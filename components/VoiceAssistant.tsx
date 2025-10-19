import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { encode, decode, decodeAudioData } from '../services/audioUtils';
import type { Mood, TranscriptEntry } from '../types';

interface VoiceAssistantProps {
  onLogSymptoms: (date: string, symptoms: string[]) => void;
  onLogMood: (date: string, mood: Mood) => void;
}

const MicIcon = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>;
const StopIcon = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>;

const commonSymptoms = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Cravings', 'Mood Swings', 'Acne', 'Tender Breasts', 'Nausea', 'Backache', 'Anxiety', 'Insomnia'];
const moodOptions: Mood[] = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

const logSymptomsFunctionDeclaration: FunctionDeclaration = {
  name: 'logSymptomsAndMood',
  description: "Logs the user's menstrual cycle symptoms and mood for the current day. Use this function when the user mentions how they are feeling physically or emotionally.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      symptoms: {
        type: Type.ARRAY,
        description: `A list of symptoms the user is experiencing. Must be one or more of: ${commonSymptoms.join(', ')}`,
        items: { type: Type.STRING }
      },
      mood: {
        type: Type.STRING,
        description: `The user's current mood. Must be one of: ${moodOptions.join(', ')}`
      }
    }
  }
};

const dateToKey = (date: Date): string => date.toISOString().split('T')[0];

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onLogSymptoms, onLogMood }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    const sessionPromiseRef = useRef<any>(null); // Using `any` to avoid complex session type issues
    const audioRefs = useRef({
        inputAudioContext: null as AudioContext | null,
        outputAudioContext: null as AudioContext | null,
        stream: null as MediaStream | null,
        processor: null as ScriptProcessorNode | null,
        outputSources: new Set<AudioBufferSourceNode>(),
        nextStartTime: 0
    }).current;

    const startSession = useCallback(async () => {
        setError(null);
        setIsListening(true);
        setTranscript([]);

        try {
            // Many browsers only allow getUserMedia in secure contexts (HTTPS) or on localhost.
            // When the Vite dev server is exposed to the LAN (e.g. using --host) and accessed
            // via an IP address, window.isSecureContext will be false and microphone access
            // will be blocked. Detect that and show a friendly error.
            if (!window.isSecureContext) {
                const msg = 'Microphone access requires a secure context (HTTPS) or localhost.\nIf you are accessing the app using a network IP from Vite (e.g. 192.168.x.x), the browser will block getUserMedia. Run the dev server on localhost or enable HTTPS (see README).';
                console.error(msg);
                setError(msg);
                setIsListening(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            try {
                audioRefs.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (err: any) {
                // Surface the error to the UI so users know why microphone access failed.
                const message = err?.message || String(err);
                console.error('getUserMedia error:', err);
                setError(`Microphone access failed: ${message}`);
                setIsListening(false);
                return;
            }
            
            audioRefs.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioRefs.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioRefs.nextStartTime = 0;

            const source = audioRefs.inputAudioContext.createMediaStreamSource(audioRefs.stream);
            audioRefs.processor = audioRefs.inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            audioRefs.processor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) { int16[i] = inputData[i] * 32768; }
                const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };

                if (sessionPromiseRef.current) {
                    sessionPromiseRef.current.then((session: any) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                }
            };
            source.connect(audioRefs.processor);
            audioRefs.processor.connect(audioRefs.inputAudioContext.destination);

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{ functionDeclarations: [logSymptomsFunctionDeclaration] }],
                },
                callbacks: {
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const { text } = message.serverContent.inputTranscription;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.source === 'user') {
                                    return [...prev.slice(0, -1), { source: 'user', text: last.text + text }];
                                }
                                return [...prev, { source: 'user', text }];
                            });
                        }
                         if (message.serverContent?.outputTranscription) {
                            const { text } = message.serverContent.outputTranscription;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.source === 'model') {
                                    return [...prev.slice(0, -1), { source: 'model', text: last.text + text }];
                                }
                                return [...prev, { source: 'model', text }];
                            });
                        }
                        if (message.toolCall?.functionCalls) {
                            for (const fc of message.toolCall.functionCalls) {
                                if (fc.name === 'logSymptomsAndMood') {
                                    const { symptoms, mood } = fc.args;
                                    const todayKey = dateToKey(new Date());
                                    if (symptoms && Array.isArray(symptoms)) onLogSymptoms(todayKey, symptoms as string[]);
                                    if (mood && moodOptions.includes(mood as Mood)) onLogMood(todayKey, mood as Mood);
                                    
                                    const session = await sessionPromiseRef.current;
                                    session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "OK, symptoms and mood logged successfully." } } });
                                }
                            }
                        }
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && audioRefs.outputAudioContext) {
                            const audioBuffer = await decodeAudioData(decode(audioData), audioRefs.outputAudioContext, 24000, 1);
                            const source = audioRefs.outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioRefs.outputAudioContext.destination);
                            audioRefs.outputSources.add(source);
                            source.addEventListener('ended', () => { audioRefs.outputSources.delete(source); });
                            const currentTime = audioRefs.outputAudioContext.currentTime;
                            audioRefs.nextStartTime = Math.max(audioRefs.nextStartTime, currentTime);
                            source.start(audioRefs.nextStartTime);
                            audioRefs.nextStartTime += audioBuffer.duration;
                        }

                        // If the message also includes an output transcription (text), forward it to the ElevenLabs TTS proxy
                        const outputText = message.serverContent?.outputTranscription?.text;
                        if (outputText && audioRefs.outputAudioContext) {
                            // Call local proxy /api/tts which uses ELEVENLABS_API_KEY server-side
                            try {
                                const resp = await fetch('/api/tts', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ text: outputText, format: 'wav' })
                                });
                                if (resp.ok) {
                                    const ab = await resp.arrayBuffer();
                                    const audioUint8 = new Uint8Array(ab);
                                    const decoded = await decodeAudioData(audioUint8, audioRefs.outputAudioContext, 24000, 1);
                                    const src = audioRefs.outputAudioContext.createBufferSource();
                                    src.buffer = decoded;
                                    src.connect(audioRefs.outputAudioContext.destination);
                                    audioRefs.outputSources.add(src);
                                    src.addEventListener('ended', () => audioRefs.outputSources.delete(src));
                                    const now = audioRefs.outputAudioContext.currentTime;
                                    audioRefs.nextStartTime = Math.max(audioRefs.nextStartTime, now);
                                    src.start(audioRefs.nextStartTime);
                                    audioRefs.nextStartTime += decoded.duration;
                                } else {
                                    console.error('TTS proxy error', resp.status);
                                }
                            } catch (err) {
                                console.error('Failed to fetch TTS proxy', err);
                            }
                        }
                    },
                    onerror: (e) => console.error('Session Error:', e),
                    onclose: () => console.log('Session Closed'),
                },
            });

        } catch (error) {
            console.error("Failed to start voice session:", error);
            setError((error as any)?.message || String(error));
            setIsListening(false);
        }
    }, [onLogSymptoms, onLogMood]);

    const stopSession = useCallback(async () => {
        setIsListening(false);
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.close();
            sessionPromiseRef.current = null;
        }
        audioRefs.stream?.getTracks().forEach(track => track.stop());
        audioRefs.processor?.disconnect();
        audioRefs.inputAudioContext?.close();
        audioRefs.outputAudioContext?.close();
        audioRefs.outputSources.forEach(s => s.stop());
        audioRefs.outputSources.clear();
    }, []);

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            if (isListening) stopSession();
        };
    }, [isListening, stopSession]);


    const toggleListening = () => {
        if (isListening) {
            stopSession();
        } else {
            startSession();
        }
    };
    
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-pink-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-pink-600 transition-transform transform hover:scale-110 z-50"
                aria-label="Open Voice Assistant"
            >
                <MicIcon className="w-8 h-8"/>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-end z-50">
            <div className="bg-white rounded-t-2xl p-4 h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">AI Assistant</h3>
                    <button onClick={() => { stopSession(); setIsOpen(false); }} className="text-gray-500 text-2xl">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {transcript.map((entry, index) => (
                        <div key={index} className={`flex ${entry.source === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <p className={`max-w-[80%] p-3 rounded-2xl ${entry.source === 'user' ? 'bg-pink-500 text-white rounded-br-lg' : 'bg-gray-200 text-gray-800 rounded-bl-lg'}`}>
                                {entry.text}
                            </p>
                        </div>
                    ))}
                    {error && (
                        <div className="p-3 bg-yellow-100 text-yellow-900 rounded-md">
                            <strong>Voice assistant unavailable:</strong>
                            <p className="whitespace-pre-wrap">{error}</p>
                        </div>
                    )}
                    {isListening && transcript.length === 0 && <p className="text-center text-gray-500">Listening...</p>}
                </div>
                
                <div className="mt-4 flex justify-center">
                    <button onClick={toggleListening} className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors text-white ${isListening ? 'bg-red-500' : 'bg-green-500'}`}>
                        {isListening ? <StopIcon className="w-8 h-8" /> : <MicIcon className="w-8 h-8" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistant;
