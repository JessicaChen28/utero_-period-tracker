
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Phase, type CycleData, type SymptomLog, type DayData, type Mood, type MoodLog } from '../types';
import { generateCalendarDays } from '../services/cycleService';

interface SymptomTrackerProps {
  cycleData: CycleData;
  symptoms: SymptomLog;
  moods: MoodLog;
  onSymptomChange: (date: string, newSymptoms: string[]) => void;
  onMoodChange: (date: string, mood: Mood) => void;
}

// Reusable Modal Components
const FaceIcon = ({ mood, className }: { mood: Mood, className?: string }) => {
    const baseClass = `w-10 h-10 ${className || ''}`;
    switch (mood) {
        case 'Very Sad': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Sad': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16c-1.5-1-2.5-1-4-1s-2.5 0-4 1"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Neutral': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Happy': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        case 'Very Happy': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12"cy="12" r="10"></circle><path d="M8 14s1.5 3 4 3 4-3 4-3"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        default: return null;
    }
}
const commonSymptoms = [ 'Cramps', 'Headache', 'Bloating', 'Fatigue', 'Cravings', 'Mood Swings', 'Acne', 'Tender Breasts', 'Nausea', 'Backache', 'Anxiety', 'Insomnia' ];
const moodOptions: Mood[] = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
const dateToKey = (date: Date): string => date.toISOString().split('T')[0];

const TrackingModal: React.FC<{
    day: DayData,
    onClose: () => void,
    onSymptomChange: (date: string, newSymptoms: string[]) => void,
    onMoodChange: (date: string, mood: Mood) => void
}> = ({ day, onClose, onSymptomChange, onMoodChange }) => {
    const dayKey = dateToKey(day.date);

    const handleSymptomToggle = (symptom: string) => {
        const newSymptoms = day.symptoms.includes(symptom)
            ? day.symptoms.filter(s => s !== symptom)
            : [...day.symptoms, symptom];
        onSymptomChange(dayKey, newSymptoms);
    };
    
    const handleMoodSelect = (mood: Mood) => {
        onMoodChange(dayKey, mood);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{day.date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                        <p className="text-gray-500">Phase: {day.phase}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">How are you feeling?</h4>
                    <div className="flex justify-around items-center bg-gray-50 p-2 rounded-lg">
                        {moodOptions.map(mood => (
                            <button key={mood} onClick={() => handleMoodSelect(mood)} className={`p-1 rounded-full transition-colors ${day.mood === mood ? 'bg-pink-100' : 'hover:bg-gray-200'}`} aria-label={mood}>
                                <FaceIcon mood={mood} className={day.mood === mood ? 'text-pink-500' : 'text-gray-400'}/>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Log Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                        {commonSymptoms.map(symptom => (
                            <button key={symptom} onClick={() => handleSymptomToggle(symptom)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${day.symptoms.includes(symptom) ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'}`}>
                                {symptom}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={onClose} className="w-full mt-4 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors">Done</button>
            </div>
        </div>
    );
};

const MonthYearPicker: React.FC<{
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    onClose: () => void;
}> = ({ currentDate, onDateSelect, onClose }) => {
    const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const handleMonthClick = (monthIndex: number) => {
        onDateSelect(new Date(pickerYear, monthIndex, 1));
    };

    return (
        <div ref={pickerRef} className="absolute top-full mt-2 left-0 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-30 w-64">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setPickerYear(y => y - 1)} className="p-2 rounded-full hover:bg-gray-100 font-bold text-lg">&lt;</button>
                <span className="font-semibold text-gray-700">{pickerYear}</span>
                <button onClick={() => setPickerYear(y => y + 1)} className="p-2 rounded-full hover:bg-gray-100 font-bold text-lg">&gt;</button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
                {months.map((month, index) => (
                    <button 
                        key={month} 
                        onClick={() => handleMonthClick(index)}
                        className={`p-2 rounded-md text-sm hover:bg-pink-100 transition-colors ${
                            currentDate.getFullYear() === pickerYear && currentDate.getMonth() === index ? 'bg-pink-500 text-white font-semibold' : 'text-gray-600'
                        }`}
                    >
                        {month}
                    </button>
                ))}
            </div>
        </div>
    );
};

const Legend = () => (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h4 className="font-semibold text-gray-700 mb-3 text-sm">Legend</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-200"></div>
          <span>Menstrual Phase</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm bg-green-50 border border-green-200"></div>
          <span>Follicular Phase</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></div>
          <span>Ovulatory Phase</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm bg-purple-50 border border-purple-200"></div>
          <span>Luteal Phase</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 flex justify-center items-center"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div></div>
          <span>Period Day</span>
        </div>
        <div className="flex items-center space-x-2">
           <div className="w-3 h-3 flex justify-center items-center"><div className="w-1.5 h-1.5 bg-blue-300 rounded-full"></div></div>
          <span>Fertile Window</span>
        </div>
        <div className="flex items-center space-x-2">
           <div className="w-3 h-3 flex justify-center items-center"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full ring-1 ring-blue-300"></div></div>
          <span>Ovulation Day</span>
        </div>
      </div>
    </div>
);

const SymptomTracker: React.FC<SymptomTrackerProps> = ({ cycleData, onSymptomChange, onMoodChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const days = useMemo(() => {
        const symptoms = localStorage.getItem('symptoms');
        const moods = localStorage.getItem('moods');
        return generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth(), cycleData, symptoms ? JSON.parse(symptoms) : {}, moods ? JSON.parse(moods) : {});
    }, [currentDate, cycleData]);

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1); // Set to the first to avoid month-end issues
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative">
                        <button onClick={() => setIsPickerOpen(o => !o)} className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                <span>{currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </h2>
                        </button>
                        {isPickerOpen && (
                            <MonthYearPicker 
                                currentDate={currentDate} 
                                onDateSelect={(date) => {
                                    setCurrentDate(date);
                                    setIsPickerOpen(false);
                                }}
                                onClose={() => setIsPickerOpen(false)}
                            />
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            Today
                        </button>
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Previous month">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Next month">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-semibold">
                    {weekDays.map(day => <div key={day} className="py-2">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                        const phaseClasses: { [key in Phase]: string } = {
                            [Phase.Menstrual]: 'bg-red-100 text-red-900',
                            [Phase.Follicular]: 'bg-green-50 text-green-900',
                            [Phase.Ovulatory]: 'bg-blue-100 text-blue-900',
                            [Phase.Luteal]: 'bg-purple-50 text-purple-900',
                            [Phase.Unknown]: 'bg-white text-gray-700',
                        };

                        const cellClasses = [
                            'relative aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors',
                            'hover:ring-2 hover:ring-pink-300 z-10',
                            !day.isCurrentMonth && 'text-gray-300 bg-gray-50 hover:ring-0',
                            day.isCurrentMonth && !day.isToday && phaseClasses[day.phase],
                            day.isToday && 'bg-pink-500 text-white font-bold z-20',
                        ].filter(Boolean).join(' ');

                        return (
                            <div key={index} className={cellClasses} onClick={() => day.isCurrentMonth && setSelectedDay(day)}>
                                <span>{day.date.getDate()}</span>
                                <div className="absolute bottom-1.5 flex space-x-0.5">
                                    {day.isPeriod && <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>}
                                    {day.isFertile && <div className="w-1.5 h-1.5 bg-blue-300 rounded-full"></div>}
                                    {day.isOvulation && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ring-1 ring-blue-200"></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Legend />
            </div>
            {selectedDay && (
                <TrackingModal
                    day={selectedDay}
                    onClose={() => setSelectedDay(null)}
                    onSymptomChange={onSymptomChange}
                    onMoodChange={onMoodChange}
                />
            )}
        </div>
    );
};

export default SymptomTracker;
