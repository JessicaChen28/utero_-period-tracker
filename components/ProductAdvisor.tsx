
import React, { useState, useCallback } from 'react';
import { getProductRecommendations } from '../services/geminiService';
import type { ProductRecommendation } from '../types';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
);

// FIX: Explicitly type ProductCard as a React Function Component to correctly handle props like `key`.
const ProductCard: React.FC<{ product: ProductRecommendation }> = ({ product }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="font-bold text-lg text-pink-700">{product.productName}</h4>
        <p className="text-sm font-medium text-gray-500 mb-2">{product.productType}</p>
        <p className="text-gray-700">{product.recommendation}</p>
    </div>
);

const ProductAdvisor: React.FC = () => {
    const [flow, setFlow] = useState('Medium');
    const [activity, setActivity] = useState('Active');
    const [preferences, setPreferences] = useState<string[]>(['Pads', 'Tampons']);
    const [recommendations, setRecommendations] = useState<ProductRecommendation[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const productTypes = ['Pads', 'Tampons', 'Menstrual Cups', 'Period Underwear', 'Discs'];

    const handlePreferenceChange = (type: string) => {
        setPreferences(prev => 
            prev.includes(type) ? prev.filter(p => p !== type) : [...prev, type]
        );
    };

    const fetchRecommendations = useCallback(async () => {
        if (preferences.length === 0) {
            setError("Please select at least one product type preference.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setRecommendations(null);
        try {
            const result = await getProductRecommendations({ flow, activity, preferences });
            setRecommendations(result);
        } catch (err) {
            setError("Sorry, we couldn't fetch recommendations right now. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [flow, activity, preferences]);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Menstrual Product Advisor</h2>
            <div className="space-y-6 bg-pink-50 p-6 rounded-lg">
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">My flow is typically...</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Light', 'Medium', 'Heavy'].map(f => (
                            <button key={f} onClick={() => setFlow(f)} className={`px-4 py-1.5 rounded-full text-sm transition-colors ${flow === f ? 'bg-pink-600 text-white' : 'bg-white text-gray-600'}`}>{f}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">My activity level is...</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Sedentary', 'Active', 'Very Active'].map(a => (
                            <button key={a} onClick={() => setActivity(a)} className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activity === a ? 'bg-pink-600 text-white' : 'bg-white text-gray-600'}`}>{a}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">I'm interested in...</h3>
                    <div className="flex flex-wrap gap-2">
                        {productTypes.map(p => (
                            <button key={p} onClick={() => handlePreferenceChange(p)} className={`px-4 py-1.5 rounded-full text-sm transition-colors ${preferences.includes(p) ? 'bg-pink-600 text-white' : 'bg-white text-gray-600'}`}>{p}</button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="mt-6 w-full px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-300"
            >
                {isLoading ? 'Finding Products...' : 'Get Recommendations'}
            </button>
            
            {isLoading && <LoadingSpinner />}
            {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {recommendations && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Here are your recommendations:</h3>
                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <ProductCard key={index} product={rec} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductAdvisor;