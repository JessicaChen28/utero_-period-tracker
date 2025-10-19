
import React, { useState } from 'react';
import type { CycleData } from '../types';
import CycleDataForm from './CycleDataForm';

interface SettingsProps {
  onClearData: () => void;
  cycleData: CycleData;
  onCycleDataSave: (newData: CycleData) => void;
}

const Settings: React.FC<SettingsProps> = ({ onClearData, cycleData, onCycleDataSave }) => {
    const [showCycleForm, setShowCycleForm] = useState(false);
    
    const handleCycleDataSave = (newData: CycleData) => {
        onCycleDataSave(newData);
        setShowCycleForm(false); // Hide form on save
    };

    return (
        <div className="p-4 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
            
            {/* --- Cycle Data Section --- */}
            <section>
                <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Cycle Information</h3>
                {showCycleForm ? (
                     <CycleDataForm initialData={cycleData} onSave={handleCycleDataSave} />
                ) : (
                    <button
                        onClick={() => setShowCycleForm(true)}
                        className="w-full px-4 py-2 bg-pink-100 text-pink-800 font-semibold rounded-lg hover:bg-pink-200 transition-colors"
                    >
                        Update Cycle Data
                    </button>
                )}
            </section>

            {/* --- Privacy Section --- */}
            <section>
                <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Privacy</h3>
                <div className="flex items-center justify-between">
                    <div className="pr-4">
                        <p className="text-gray-800">Clear All App Data</p>
                        <p className="text-sm text-gray-500">Permanently delete all cycle, symptom, and mood data from this device.</p>
                    </div>
                    <button
                        onClick={onClearData}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                    >
                        Clear Data
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Settings;