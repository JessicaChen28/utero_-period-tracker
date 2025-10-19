
import React, { useState } from 'react';
import type { CycleData } from '../types';

const NumberStepper = ({ label, value, onValueChange, min, max, unit }: { label: string, value: number, onValueChange: (newValue: number) => void, min: number, max: number, unit: string }) => {
    const increment = () => onValueChange(Math.min(max, value + 1));
    const decrement = () => onValueChange(Math.max(min, value - 1));
  
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 text-center">{label}</label>
        <div className="mt-2 flex items-center justify-center space-x-4">
          <button
            onClick={decrement}
            disabled={value <= min}
            className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 text-2xl font-bold flex items-center justify-center hover:bg-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Decrease ${label.toLowerCase()}`}
          >
            -
          </button>
          <div className="text-center">
              <span className="text-4xl font-semibold text-pink-600 w-20 text-center tabular-nums">{value}</span>
              <span className="text-sm text-gray-500 ml-1">{unit}</span>
          </div>
          <button
            onClick={increment}
            disabled={value >= max}
            className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 text-2xl font-bold flex items-center justify-center hover:bg-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Increase ${label.toLowerCase()}`}
          >
            +
          </button>
        </div>
      </div>
    );
};


interface CycleDataFormProps {
  initialData?: Partial<CycleData>;
  onSave: (data: CycleData) => void;
  buttonText?: string;
}

const CycleDataForm: React.FC<CycleDataFormProps> = ({ initialData, onSave, buttonText = "Save Changes" }) => {
    const [lastPeriodStart, setLastPeriodStart] = useState<string>(
        initialData?.lastPeriodStart?.split('T')[0] || new Date().toISOString().split('T')[0]
    );
    const [cycleLength, setCycleLength] = useState<number>(initialData?.cycleLength || 28);
    const [periodLength, setPeriodLength] = useState<number>(initialData?.periodLength || 5);
    
    const handleSave = () => {
        const newData: CycleData = {
          lastPeriodStart: new Date(lastPeriodStart).toISOString(),
          cycleLength: cycleLength,
          periodLength: periodLength,
        };
        onSave(newData);
    };

    return (
        <div className="space-y-8">
            <div>
              <label htmlFor="lastPeriod" className="block text-sm font-medium text-gray-700 mb-2">First Day of Last Period</label>
              <input type="date" id="lastPeriod" value={lastPeriodStart} onChange={e => setLastPeriodStart(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
            </div>
            <NumberStepper
                label="Average Cycle Length"
                value={cycleLength}
                onValueChange={setCycleLength}
                min={20}
                max={45}
                unit="days"
            />
            <NumberStepper
                label="Average Period Length"
                value={periodLength}
                onValueChange={setPeriodLength}
                min={2}
                max={10}
                unit="days"
            />
             <button onClick={handleSave} className="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                {buttonText}
            </button>
        </div>
    )
}

export default CycleDataForm;