
import React, { useState, useEffect, useCallback } from 'react';
// FIX: `Phase` is defined in `types.ts` and should be imported from there.
import { Phase, type CycleData, type SymptomLog, type MoodLog, type Mood } from './types';
import { getCurrentPhase } from './services/cycleService';

import CalendarView from './components/CalendarView';
import SymptomTracker from './components/SymptomTracker';
import NutritionAdvisor from './components/NutritionAdvisor';
import ProductAdvisor from './components/ProductAdvisor';
import VoiceAssistant from './components/VoiceAssistant';
import Settings from './components/Settings';
import CycleDataForm from './components/CycleDataForm';
import AiAdviceView from './components/AiAdviceView';

const UteroLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" fill="#EC4899"/>
        <path d="M12 7C9.239 7 7 9.239 7 12C7 14.761 9.239 17 12 17C14.761 17 17 14.761 17 12C17 9.239 14.761 7 12 7ZM12 15C10.343 15 9 13.657 9 12C9 10.343 10.343 9 12 9C13.657 9 15 10.343 15 12C15 13.657 13.657 15 12 15Z" fill="#EC4899"/>
    </svg>
);


type View = 'dashboard' | 'calendar' | 'nutrition' | 'products' | 'advice' | 'settings';

const Header: React.FC<{ activeView: View; setActiveView: (view: View) => void }> = ({ activeView, setActiveView }) => {
    const navItems: { id: View, label: string }[] = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'calendar', label: 'Calendar' },
        { id: 'nutrition', label: 'Nutrition' },
        { id: 'products', label: 'Products' },
        { id: 'advice', label: 'AI Advice' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3 -ml-3">
                        <UteroLogo />
                        <span className="text-xl font-bold text-gray-800">Utero</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-2">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeView === item.id 
                                        ? 'bg-pink-500 text-white shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                     <div className="flex items-center space-x-3">
                        <img className="h-8 w-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop" alt="User" />
                        <span className="hidden sm:inline text-sm font-medium text-gray-700">Alex Hartman</span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
             <div className="md:hidden border-t border-gray-200">
                <nav className="flex justify-around p-1">
                     {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`flex-1 px-2 py-2 text-center rounded-md text-xs font-medium transition-colors ${
                                    activeView === item.id 
                                        ? 'bg-pink-500 text-white shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                </nav>
            </div>
        </header>
    );
};


const App: React.FC = () => {
    const [cycleData, setCycleData] = useState<CycleData | null>(null);
    const [symptoms, setSymptoms] = useState<SymptomLog>({});
    const [moods, setMoods] = useState<MoodLog>({});
    const [activeView, setActiveView] = useState<View>('dashboard');

    useEffect(() => {
        try {
            const savedCycleData = localStorage.getItem('cycleData');
            if (savedCycleData) setCycleData(JSON.parse(savedCycleData));

            const savedSymptoms = localStorage.getItem('symptoms');
            if (savedSymptoms) setSymptoms(JSON.parse(savedSymptoms));
            
            const savedMoods = localStorage.getItem('moods');
            if (savedMoods) setMoods(JSON.parse(savedMoods));
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        if (cycleData) {
            try {
                localStorage.setItem('cycleData', JSON.stringify(cycleData));
            } catch (error) {
                console.error("Failed to save cycle data", error);
            }
        }
    }, [cycleData]);

    useEffect(() => {
        try {
            localStorage.setItem('symptoms', JSON.stringify(symptoms));
        } catch (error) {
            console.error("Failed to save symptoms", error);
        }
    }, [symptoms]);

    useEffect(() => {
        try {
            localStorage.setItem('moods', JSON.stringify(moods));
        } catch (error) {
            console.error("Failed to save moods", error);
        }
    }, [moods]);
    
    const handleSaveCycleData = useCallback((data: CycleData) => {
        setCycleData(data);
    }, []);

    const handleSymptomChange = useCallback((date: string, newSymptoms: string[]) => {
        setSymptoms(prev => ({ ...prev, [date]: newSymptoms }));
    }, []);

    const handleMoodChange = useCallback((date: string, mood: Mood) => {
        setMoods(prev => ({ ...prev, [date]: mood }));
    }, []);

    const handleClearData = useCallback(() => {
        if (window.confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
            localStorage.clear();
            setCycleData(null);
            setSymptoms({});
            setMoods({});
        }
    }, []);

    const currentPhase = cycleData ? getCurrentPhase(cycleData) : Phase.Unknown;

    const renderContent = () => {
        if (!cycleData) {
            return (
                <div className="flex flex-col items-center justify-center min-h-full p-4">
                    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Welcome to Utero</h1>
                            <p className="text-gray-500">Let's get your cycle set up.</p>
                        </div>
                        <CycleDataForm onSave={handleSaveCycleData} buttonText="Get Started" />
                    </div>
                </div>
            );
        }

        switch(activeView) {
            case 'dashboard':
                return <CalendarView cycleData={cycleData} symptoms={symptoms} moods={moods} onSymptomChange={handleSymptomChange} onMoodChange={handleMoodChange} />;
            case 'calendar':
                return <SymptomTracker cycleData={cycleData} symptoms={symptoms} moods={moods} onSymptomChange={handleSymptomChange} onMoodChange={handleMoodChange} />;
            case 'nutrition':
                return <div className="container mx-auto p-4 sm:p-6 lg:p-8"><NutritionAdvisor phase={currentPhase} /></div>;
            case 'products':
                return <div className="container mx-auto p-4 sm:p-6 lg:p-8"><ProductAdvisor /></div>;
            case 'advice':
                return <div className="container mx-auto p-4 sm:p-6 lg:p-8"><AiAdviceView /></div>;
            case 'settings':
                return <div className="container mx-auto p-4 sm:p-6 lg:p-8"><Settings onClearData={handleClearData} cycleData={cycleData} onCycleDataSave={handleSaveCycleData} /></div>;
            default:
                return <CalendarView cycleData={cycleData} symptoms={symptoms} moods={moods} onSymptomChange={handleSymptomChange} onMoodChange={handleMoodChange} />;
        }
    };

    return (
        <div className="flex flex-col h-screen font-sans">
            <Header activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                {renderContent()}
            </main>
            {cycleData && <VoiceAssistant onLogSymptoms={handleSymptomChange} onLogMood={handleMoodChange} />}
        </div>
    );
};

export default App;
