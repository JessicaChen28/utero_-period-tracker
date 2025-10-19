import { GoogleGenAI, Type } from "@google/genai";
import type { NutritionAdvice, ProductRecommendation, Mood } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development and will show an alert.
  // In a production environment, process.env.API_KEY is expected to be set.
  console.error("API_KEY is not set. Please set the environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getSymptomAdvice = async (symptoms: string[], mood?: Mood): Promise<string> => {
  if (symptoms.length === 0 && !mood) {
    return "No symptoms or mood selected.";
  }

  const descriptions: string[] = [];
  if (symptoms.length > 0) {
    descriptions.push(`I am experiencing the following menstrual cycle symptoms: ${symptoms.join(', ')}.`);
  }
  if (mood) {
    descriptions.push(`My current mood is: ${mood}.`);
  }
  
  const prompt = `${descriptions.join(' ')} Provide 2-3 concise, actionable remedies or suggestions to help alleviate these. Frame the response as helpful advice, but do not add a greeting or sign-off.`

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text.trim();

  } catch (error) {
    console.error("Error fetching symptom advice:", error);
    throw new Error("Failed to get symptom advice from AI.");
  }
};

export const getMoodQuote = async (mood: Mood): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a short, single-sentence motivational quote for someone feeling '${mood}'. The quote should be uplifting and encouraging. Do not include quotation marks or any introductory text.`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching mood quote:", error);
        throw new Error("Failed to get mood quote from AI.");
    }
};


export const getNutritionAdvice = async (phase: string): Promise<NutritionAdvice> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I am in the ${phase} phase of my menstrual cycle. Provide nutrition advice.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodsToEat: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of foods that are beneficial during this phase.'
            },
            foodsToAvoid: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of foods to limit or avoid during this phase.'
            }
          },
          required: ['foodsToEat', 'foodsToAvoid']
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as NutritionAdvice;

  } catch (error) {
    console.error("Error fetching nutrition advice:", error);
    throw new Error("Failed to get nutrition advice from AI.");
  }
};

export const getCravingAdvice = async (craving: string): Promise<string> => {
  if (!craving.trim()) {
    return "Please tell me what you're craving.";
  }

  const prompt = `I'm having a food craving for "${craving}". Please suggest 2-3 healthier alternatives that could satisfy this craving. For each suggestion, provide a brief (1-2 sentence) explanation of why it's a good alternative. Format the response with bullet points for readability. Frame it as helpful advice, but do not add a greeting or sign-off.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text.trim();

  } catch (error) {
    console.error("Error fetching craving advice:", error);
    throw new Error("Failed to get craving advice from AI.");
  }
};

interface ProductPreferences {
    flow: string;
    activity: string;
    preferences: string[];
}

export const getProductRecommendations = async (prefs: ProductPreferences): Promise<ProductRecommendation[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Recommend menstrual products based on these preferences: Flow: ${prefs.flow}, Activity Level: ${prefs.activity}, Product Types of Interest: ${prefs.preferences.join(', ')}. Provide 3 recommendations.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            productName: {
                                type: Type.STRING,
                                description: 'A generic but descriptive name for the product (e.g., "High-Absorbency Organic Cotton Tampons").'
                            },
                            productType: {
                                type: Type.STRING,
                                description: 'The type of product (e.g., Tampon, Pad, Menstrual Cup).'
                            },
                            recommendation: {
                                type: Type.STRING,
                                description: 'A brief explanation of why this product is a good fit for the user.'
                            }
                        },
                        required: ['productName', 'productType', 'recommendation']
                    }
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ProductRecommendation[];

    } catch (error) {
        console.error("Error fetching product recommendations:", error);
        throw new Error("Failed to get product recommendations from AI.");
    }
};
