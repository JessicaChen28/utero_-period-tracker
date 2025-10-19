import React, { useState, useCallback } from 'react';
import { getNutritionAdvice, getCravingAdvice } from '../services/geminiService';
import type { Phase, NutritionAdvice } from '../types';

interface NutritionAdvisorProps {
  phase: Phase;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
);

const AdviceCard = ({ title, items, color }: { title: string, items: string[], color: string }) => (
    <div className={`bg-${color}-50 p-4 rounded-lg`}>
        <h3 className={`text-lg font-bold text-${color}-800 mb-2`}>{title}</h3>
        <ul className="space-y-1 list-disc list-inside text-gray-700">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);

const NutritionAdvisor: React.FC<NutritionAdvisorProps> = ({ phase }) => {
  // State for phase-based advice
  const [advice, setAdvice] = useState<NutritionAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for craving advice
  const [craving, setCraving] = useState('');
  const [cravingAdvice, setCravingAdvice] = useState<string | null>(null);
  const [isCravingLoading, setIsCravingLoading] = useState(false);
  const [cravingError, setCravingError] = useState<string | null>(null);

  const fetchAdvice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const result = await getNutritionAdvice(phase);
      setAdvice(result);
    } catch (err) {
      setError("Sorry, we couldn't fetch your personalized nutrition advice right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [phase]);

  const handleCravingSubmit = useCallback(async () => {
      if (!craving.trim()) {
        setCravingError("Please enter what you're craving.");
        return;
      }
      setIsCravingLoading(true);
      setCravingError(null);
      setCravingAdvice(null);
      try {
        const result = await getCravingAdvice(craving);
        setCravingAdvice(result);
      } catch (err) {
        setCravingError("Sorry, we couldn't get a suggestion for your craving. Please try again.");
      } finally {
        setIsCravingLoading(false);
      }
    }, [craving]);

  return (
    <div className="space-y-8">
      {/* --- Phase-Based Nutrition Section --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Phase-Based Nutrition</h2>
        <p className="text-gray-600 mb-4">
          Get AI-powered nutrition tips tailored for your current <span className="font-semibold">{phase}</span> phase.
        </p>

        <button
          onClick={fetchAdvice}
          disabled={isLoading}
          className="px-6 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-300"
        >
          {isLoading ? 'Getting Advice...' : 'Get Nutrition Advice'}
        </button>

        {isLoading && <LoadingSpinner />}
        {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        
        {advice && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdviceCard title="Foods to Eat" items={advice.foodsToEat} color="green" />
            <AdviceCard title="Foods to Avoid" items={advice.foodsToAvoid} color="red" />
          </div>
        )}
      </div>

      {/* --- Craving Helper Section --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Craving Helper</h2>
        <p className="text-gray-600 mb-4">
          Tell us what you're craving, and we'll suggest a healthier alternative.
        </p>
        <textarea
            value={craving}
            onChange={(e) => {
                setCraving(e.target.value);
                if (cravingError) setCravingError(null);
            }}
            placeholder="e.g., chocolate, salty chips, ice cream..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition"
            rows={3}
            aria-label="Enter your food craving"
        />
        <button
            onClick={handleCravingSubmit}
            disabled={isCravingLoading}
            className="mt-4 w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
        >
            {isCravingLoading ? 'Thinking...' : 'Get Healthier Options'}
        </button>
        {isCravingLoading && <LoadingSpinner />}
        {cravingError && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{cravingError}</div>}
        
        {cravingAdvice && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-2">Here are some ideas:</h3>
                <p className="text-gray-700 whitespace-pre-line">{cravingAdvice}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default NutritionAdvisor;
