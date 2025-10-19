

export interface CycleData {
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
}

export interface SymptomLog {
  [date: string]: string[];
}

export type Mood = 'Very Sad' | 'Sad' | 'Neutral' | 'Happy' | 'Very Happy';

export interface MoodLog {
  [date:string]: Mood;
}

export enum Phase {
  Menstrual = "Menstrual",
  Follicular = "Follicular",
  Ovulatory = "Ovulatory",
  Luteal = "Luteal",
  Unknown = "Unknown"
}

export interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  symptoms: string[];
  mood?: Mood;
  phase: Phase;
}

export interface NutritionAdvice {
  foodsToEat: string[];
  foodsToAvoid: string[];
}

export interface ProductRecommendation {
  productName: string;
  productType: string;
  recommendation: string;
}

export interface TranscriptEntry {
  source: 'user' | 'model';
  text: string;
}

export interface CatImage {
    vibe: string;
    path: string;
    photographer: string;
    photographerUrl: string;
}