import React, { useState, useMemo, useEffect } from 'react';
import type { CycleData, SymptomLog, DayData, Mood, MoodLog } from '../types';
import { Phase } from '../types';
import { calculateCycleProgress, getCurrentPhase } from '../services/cycleService';
import { getCatImageForVibe } from '../services/imageService';

interface CalendarViewProps {
  cycleData: CycleData;
  symptoms: SymptomLog;
  moods: MoodLog;
  onSymptomChange: (date: string, newSymptoms: string[]) => void;
  onMoodChange: (date: string, mood: Mood) => void;
}

// --- Internal Components ---
const FaceIcon = ({ mood, className }: { mood: Mood, className?: string }) => {
    const baseClass = `w-10 h-10 ${className || ''}`;
    const iconClass = `w-6 h-6 ${className || ''}`;
    switch (mood) {
        case 'Very Sad': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Sad': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16c-1.5-1-2.5-1-4-1s-2.5 0-4 1"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Neutral': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Happy': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Very Happy': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 3 4 3 4-3 4-3"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        default: return null;
    }
}
const SmallFaceIcon = ({ mood, className }: { mood: Mood, className?: string }) => {
    const baseClass = `w-6 h-6 ${className || ''}`;
    // Re-using the same SVGs, just with a smaller base class
    switch (mood) {
        case 'Very Sad': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Sad': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16c-1.5-1-2.5-1-4-1s-2.5 0-4 1"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Neutral': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Happy': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Very Happy': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 3 4 3 4-3 4-3"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        default: return null;
    }
}

const LoadingSpinner = () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>;

const commonSymptoms = [ 'Cramps', 'Headache', 'Bloating', 'Fatigue', 'Cravings', 'Mood Swings', 'Acne', 'Tender Breasts', 'Nausea', 'Backache', 'Anxiety', 'Insomnia' ];
const moodOptions: Mood[] = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
const dateToKey = (date: Date): string => date.toISOString().split('T')[0];

const phaseInfo: { [key in Phase]: { color: string, textColor: string, name: string } } = {
    [Phase.Menstrual]: { color: 'bg-red-100', textColor: 'text-red-800', name: 'Menstrual' },
    [Phase.Follicular]: { color: 'bg-green-100', textColor: 'text-green-800', name: 'Follicular' },
    [Phase.Ovulatory]: { color: 'bg-blue-100', textColor: 'text-blue-800', name: 'Ovulatory' },
    [Phase.Luteal]: { color: 'bg-purple-100', textColor: 'text-purple-800', name: 'Luteal' },
    [Phase.Unknown]: { color: 'bg-gray-100', textColor: 'text-gray-800', name: 'Unknown' },
};

const determineUserVibe = (mood?: Mood, symptoms?: string[], phase?: Phase): string => {
    // Priority 1: Mood
    if (mood === 'Happy' || mood === 'Very Happy') return 'happy';
    if (mood === 'Sad' || mood === 'Very Sad') return 'sad';
    if (mood === 'Neutral') return 'curious';

    // Priority 2: Symptoms
    if (symptoms && symptoms.length > 0) {
        if (symptoms.includes('Fatigue') || symptoms.includes('Insomnia')) return 'sleepy';
        if (symptoms.includes('Cravings')) return 'hungry';
        if (symptoms.includes('Cramps') || symptoms.includes('Headache') || symptoms.includes('Anxiety') || symptoms.includes('Mood Swings')) return 'grumpy';
    }

    // Priority 3: Phase
    if (phase) {
        switch(phase) {
            case Phase.Menstrual: return 'tired';
            case Phase.Follicular: return 'playful';
            case Phase.Ovulatory: return 'majestic';
            case Phase.Luteal: return 'bored';
        }
    }

    // Default
    return 'curious';
}


const CalendarView: React.FC<CalendarViewProps> = ({ cycleData, symptoms, moods, onSymptomChange, onMoodChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyImage, setDailyImage] = useState({ url: '', photographer: '', photographerUrl: '', isLoading: true, error: null as string | null });

  const today = new Date();
  const todayKey = dateToKey(today);
  const selectedDaySymptoms = symptoms[todayKey] || [];
  const selectedDayMood = moods[todayKey];

  const currentPhase = useMemo(() => getCurrentPhase(cycleData), [cycleData]);

  useEffect(() => {
    const imageCacheKey = `dailyImage_cat_${todayKey}`;

    try {
        const cachedImage = localStorage.getItem(imageCacheKey);
        if (cachedImage) {
            setDailyImage({ ...JSON.parse(cachedImage), isLoading: false, error: null });
            return;
        }
        
        const vibe = determineUserVibe(selectedDayMood, selectedDaySymptoms, currentPhase);
        const imageData = getCatImageForVibe(vibe);

        if (imageData) {
            const newImageState = {
                url: `/CatPictures/${imageData.path}`,
                photographer: imageData.photographer,
                photographerUrl: imageData.photographerUrl
            };
            localStorage.setItem(imageCacheKey, JSON.stringify(newImageState));
            setDailyImage({ ...newImageState, isLoading: false, error: null });
        } else {
             throw new Error("Could not find a suitable cat picture.");
        }

    } catch (err) {
        console.error("Error setting daily image:", err);
        setDailyImage({ url: '', photographer: '', photographerUrl: '', isLoading: false, error: "Couldn't load a daily photo for you." });
    }
  }, [todayKey, selectedDayMood, selectedDaySymptoms, currentPhase]);

  const { daysUntilNextPeriod, cyclePercentage, nextPeriodDate } = useMemo(() => calculateCycleProgress(cycleData), [cycleData]);
  
  const handleSymptomToggle = (symptom: string) => {
    const newSymptoms = selectedDaySymptoms.includes(symptom)
      ? selectedDaySymptoms.filter(s => s !== symptom)
      : [...selectedDaySymptoms, symptom];
    onSymptomChange(todayKey, newSymptoms);
  };
  
  const handleMoodSelect = (mood: Mood) => onMoodChange(todayKey, mood);

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cyclePercentage / 100) * circumference;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-items-center h-full">
      {/* Column 1: Cycle Tracker */}
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="absolute w-full h-full" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="12" strokeDasharray="4 8" />
            <circle cx="120" cy="120" r={radius} fill="none" stroke="#EC4899" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} transform="rotate(-90 120 120)" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
          </svg>
          <div className="text-center">
              <p className="text-3xl font-bold tracking-widest text-gray-700">{today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</p>
              <p className="text-8xl font-bold text-gray-900 leading-none -my-1">{today.getDate()}</p>
              <p className="text-sm font-semibold text-gray-500 tracking-wider">
                  <span className="text-lg font-bold text-gray-800">{daysUntilNextPeriod}</span> DAYS TILL NEXT PERIOD
              </p>
          </div>
          <div className="absolute top-0 text-center">
              <p className="text-xs font-semibold text-pink-600">Next: {nextPeriodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <div className="w-px h-3 bg-pink-500 mx-auto"></div>
          </div>
        </div>
        <div className="mt-12">
          <button onClick={() => setIsModalOpen(true)} className="px-10 py-4 bg-pink-500 text-white font-bold rounded-full shadow-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105">
              + Track
          </button>
        </div>
      </div>

      {/* Column 2: Daily Vibe Card */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800">Today's Vibe</h3>
        <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${phaseInfo[currentPhase].color} ${phaseInfo[currentPhase].textColor}`}>
            {phaseInfo[currentPhase].name} Phase
        </div>
        <div className="mt-4 aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
            {dailyImage.isLoading && <LoadingSpinner />}
            {dailyImage.error && !dailyImage.isLoading && <p className="text-sm text-gray-500 p-4 text-center">{dailyImage.error}</p>}
            {dailyImage.url && !dailyImage.isLoading && !dailyImage.error && (
                <>
                    <img src={dailyImage.url} alt={`A ${determineUserVibe(selectedDayMood, selectedDaySymptoms, currentPhase)} cat to accompany your day`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-xs p-1 text-center">
                        Photo by <a href={dailyImage.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-300">{dailyImage.photographer}</a> on Pexels
                    </div>
                </>
            )}
        </div>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-700">Today's Log</h4>
            {(selectedDayMood || selectedDaySymptoms.length > 0) ? (
                <div className="mt-2 space-y-2">
                    {selectedDayMood && (
                        <div className="flex items-center space-x-2">
                           <SmallFaceIcon mood={selectedDayMood} className="text-pink-500" />
                           <span className="text-gray-600">{selectedDayMood}</span>
                        </div>
                    )}
                    {selectedDaySymptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                           {selectedDaySymptoms.map(symptom => <span key={symptom} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{symptom}</span>)}
                        </div>
                    )}
                </div>
            ) : (
                <p className="mt-2 text-sm text-gray-500">Nothing logged yet. Tap the track button to add your mood and symptoms!</p>
            )}
        </div>
      </div>
      
      {/* Logging Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{today.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                <p className="text-gray-500">Phase: {currentPhase}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div>
                <h4 className="font-semibold text-gray-700 mb-2">How are you feeling?</h4>
                <div className="flex justify-around items-center bg-gray-50 p-2 rounded-lg">
                    {moodOptions.map(mood => (
                        <button key={mood} onClick={() => handleMoodSelect(mood)} className={`p-1 rounded-full transition-colors ${selectedDayMood === mood ? 'bg-pink-100' : 'hover:bg-gray-200'}`} aria-label={mood}>
                            <FaceIcon mood={mood} className={selectedDayMood === mood ? 'text-pink-500' : 'text-gray-400'}/>
                        </button>
                    ))}
                </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Log Symptoms</h4>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map(symptom => (
                  <button key={symptom} onClick={() => handleSymptomToggle(symptom)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${selectedDaySymptoms.includes(symptom) ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'}`}>
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors">Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;