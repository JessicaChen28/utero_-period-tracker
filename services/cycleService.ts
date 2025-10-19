
import type { CycleData, DayData, MoodLog } from '../types';
import { Phase } from '../types';

const today = new Date();
today.setHours(0, 0, 0, 0);

const dateToKey = (date: Date): string => date.toISOString().split('T')[0];

export const getPhaseForDate = (date: Date, cycleData: CycleData): Phase => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const cycleStart = new Date(cycleData.lastPeriodStart);
    cycleStart.setHours(0, 0, 0, 0);

    const timeDiff = normalizedDate.getTime() - cycleStart.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    const cycleDay = (dayDiff % cycleData.cycleLength + cycleData.cycleLength) % cycleData.cycleLength;
    const ovulationDay = cycleData.cycleLength - 14;

    if (cycleDay < cycleData.periodLength) return Phase.Menstrual;
    if (cycleDay < ovulationDay - 1) return Phase.Follicular;
    if (cycleDay <= ovulationDay + 1) return Phase.Ovulatory;
    if (cycleDay < cycleData.cycleLength) return Phase.Luteal;
    
    return Phase.Unknown;
}

export const generateCalendarDays = (
  year: number,
  month: number,
  cycleData: CycleData,
  symptoms: { [key: string]: string[] },
  moods: MoodLog,
): DayData[] => {
  const days: DayData[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Pad days from previous month
  const startDayOfWeek = firstDayOfMonth.getDay();
  for (let i = 0; i < startDayOfWeek; i++) {
    const date = new Date(year, month, i - startDayOfWeek + 1);
    days.push({ ...getCycleDayInfo(date, cycleData), isCurrentMonth: false, symptoms: [], mood: undefined });
  }

  // Current month's days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(year, month, i);
    const dayInfo = getCycleDayInfo(date, cycleData);
    const key = dateToKey(date);
    const symptomsForDay = symptoms[key] || [];
    const moodForDay = moods[key];
    days.push({ ...dayInfo, isCurrentMonth: true, symptoms: symptomsForDay, mood: moodForDay });
  }

  // Pad days for next month
  const endDayOfWeek = lastDayOfMonth.getDay();
  for (let i = 1; days.length % 7 !== 0; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ ...getCycleDayInfo(date, cycleData), isCurrentMonth: false, symptoms: [], mood: undefined });
  }

  return days;
};

const getCycleDayInfo = (date: Date, cycleData: CycleData): Omit<DayData, 'isCurrentMonth' | 'symptoms' | 'mood'> => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  const cycleStart = new Date(cycleData.lastPeriodStart);
  cycleStart.setHours(0, 0, 0, 0);

  const timeDiff = normalizedDate.getTime() - cycleStart.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);

  const cycleDay = (dayDiff % cycleData.cycleLength + cycleData.cycleLength) % cycleData.cycleLength;

  const isPeriod = cycleDay < cycleData.periodLength;
  const ovulationDay = cycleData.cycleLength - 14;
  const isOvulation = cycleDay >= ovulationDay -1 && cycleDay <= ovulationDay + 1;
  const isFertile = cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay;
  const phase = getPhaseForDate(date, cycleData);

  return {
    date: normalizedDate,
    isToday: normalizedDate.getTime() === today.getTime(),
    isPeriod,
    isFertile,
    isOvulation,
    phase,
  };
};

export const getCurrentPhase = (cycleData: CycleData): Phase => {
    return getPhaseForDate(today, cycleData);
}

export const calculateCycleProgress = (cycleData: CycleData) => {
    const lastPeriodStart = new Date(cycleData.lastPeriodStart);
    lastPeriodStart.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - lastPeriodStart.getTime();
    const daysPassed = timeDiff / (1000 * 3600 * 24);
    
    const cyclesPassed = Math.floor(daysPassed / cycleData.cycleLength);
    const msInDay = 1000 * 3600 * 24;

    const currentCycleStartDate = new Date(lastPeriodStart.getTime() + cyclesPassed * cycleData.cycleLength * msInDay);
    
    const nextPeriodDate = new Date(currentCycleStartDate.getTime() + cycleData.cycleLength * msInDay);
    
    const daysUntilNextPeriod = Math.round((nextPeriodDate.getTime() - today.getTime()) / msInDay);

    const dayInCurrentCycle = Math.floor((today.getTime() - currentCycleStartDate.getTime()) / msInDay);

    const cyclePercentage = Math.max(0, Math.min(100, (dayInCurrentCycle / cycleData.cycleLength) * 100));

    return {
        daysUntilNextPeriod,
        cyclePercentage,
        nextPeriodDate
    };
};