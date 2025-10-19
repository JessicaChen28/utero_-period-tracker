
import React, { useState, useCallback } from 'react';
import { getSymptomAdvice, getMoodQuote } from '../services/geminiService';
import type { Mood } from '../types';

// --- Reusable UI Components ---
const FaceIcon = ({ mood, className }: { mood: Mood, className?: string }) => {
    const baseClass = `w-10 h-10 ${className || ''}`;
    switch (mood) {
        case 'Very Sad': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Sad': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16c-1.5-1-2.5-1-4-1s-2.5 0-4 1"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Neutral': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Happy': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Very Happy': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 3 4 3 4-3 4-3"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        default: return null;
    }
}
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
);

// --- Data ---
const commonSymptoms = [ 'Cramps', 'Headache', 'Bloating', 'Fatigue', 'Cravings', 'Mood Swings', 'Acne', 'Tender Breasts', 'Nausea', 'Backache', 'Anxiety', 'Insomnia' ];
const moodOptions: Mood[] = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

// --- Main Component ---
const AiAdviceView: React.FC = () => {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
    const [advice, setAdvice] = useState<string | null>(null);
    const [quote, setQuote] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSymptomToggle = (symptom: string) => {
        setSelectedSymptoms(prev => 
            prev.includes(symptom) ? prev.filter(p => p !== symptom) : [...prev, symptom]
        );
    };

    const handleMoodSelect = (mood: Mood) => {
        setSelectedMood(prev => prev === mood ? undefined : mood);
    };

    const fetchAdviceAndQuote = useCallback(async () => {
        if (selectedSymptoms.length === 0 && !selectedMood) {
            setError("Please select a mood or at least one symptom to get advice.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAdvice(null);
        setQuote(null);

        try {
            const advicePromise = getSymptomAdvice(selectedSymptoms, selectedMood);
            const quotePromise = selectedMood ? getMoodQuote(selectedMood) : Promise.resolve(null);
            
            const [adviceResult, quoteResult] = await Promise.all([advicePromise, quotePromise]);

            setAdvice(adviceResult);
            setQuote(quoteResult);

        } catch (err) {
            setError("Sorry, we couldn't fetch your advice right now. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedSymptoms, selectedMood]);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Get Personalized Advice</h2>
            <div className="space-y-6 bg-pink-50 p-6 rounded-lg">
                {/* Mood Selector */}
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">How are you feeling today?</h3>
                    <div className="flex justify-around items-center bg-white p-2 rounded-lg shadow-sm">
                        {moodOptions.map(mood => (
                            <button key={mood} onClick={() => handleMoodSelect(mood)} className={`p-1 rounded-full transition-all duration-200 ${selectedMood === mood ? 'bg-pink-100 ring-2 ring-pink-400' : 'hover:bg-gray-100'}`} aria-label={mood}>
                                <FaceIcon mood={mood} className={selectedMood === mood ? 'text-pink-500' : 'text-gray-400'}/>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Symptom Selector */}
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Are you experiencing any of these?</h3>
                    <div className="flex flex-wrap gap-2">
                        {commonSymptoms.map(symptom => (
                            <button key={symptom} onClick={() => handleSymptomToggle(symptom)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${selectedSymptoms.includes(symptom) ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-400'}`}>
                                {symptom}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={fetchAdviceAndQuote}
                disabled={isLoading}
                className="mt-6 w-full px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-300"
            >
                {isLoading ? 'Getting Advice...' : 'Get AI Advice'}
            </button>
            
            {isLoading && <LoadingSpinner />}
            {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {(advice || quote) && !isLoading && (
                <div className="mt-8 space-y-6">
                    {quote && (
                        <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 rounded-r-lg" role="alert">
                            <p className="font-style: italic">"{quote}"</p>
                        </div>
                    )}
                     {advice && (
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                           <h3 className="text-lg font-bold text-gray-800 mb-2">Here's some advice:</h3>
                           <p className="text-gray-700 whitespace-pre-line">{advice}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiAdviceView;
