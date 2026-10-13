import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { isDemoConfig, supabase } from '../lib/supabase';
import { DailyNutritionSummary, MealLog, MealType } from '../types';
import { useAuth } from './AuthContext';

interface DiaryContextType {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  mealLogs: MealLog[];
  loadingDiary: boolean;
  addMealLog: (meal: Omit<MealLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateMealLog: (id: string, updates: Partial<MealLog>) => Promise<void>;
  deleteMealLog: (id: string) => Promise<void>;
  getDailySummary: (dateStr?: string) => DailyNutritionSummary;
}

const STORAGE_MEALS_KEY = '@fitpulse_mock_meals';

// Timezone-safe local date helper (YYYY-MM-DD)
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DiaryContext = createContext<DiaryContextType>({} as DiaryContextType);

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loadingDiary, setLoadingDiary] = useState(false);

  useEffect(() => {
    if (user) {
      loadMeals();
    } else {
      setMealLogs([]);
    }
  }, [user]);

  const loadMeals = async () => {
    setLoadingDiary(true);
    try {
      if (!isDemoConfig && user) {
        const { data, error } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', user.id);
        if (data && !error) {
          setMealLogs(data as MealLog[]);
        }
      } else {
        const saved = await AsyncStorage.getItem(STORAGE_MEALS_KEY);
        if (saved) {
          setMealLogs(JSON.parse(saved));
        }
      }
    } catch (e) {
      console.error('Öğünleri yükleme hatası:', e);
    } finally {
      setLoadingDiary(false);
    }
  };

  const persistMealsLocally = async (newList: MealLog[]) => {
    setMealLogs(newList);
    await AsyncStorage.setItem(STORAGE_MEALS_KEY, JSON.stringify(newList));
  };

  // 1. Öğün Ekleme
  const addMealLog = async (meal: Omit<MealLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const newId = 'meal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newEntry: MealLog = {
      ...meal,
      id: newId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    const updated = [newEntry, ...mealLogs];
    await persistMealsLocally(updated);

    if (!isDemoConfig) {
      try {
        await supabase.from('meal_logs').insert(newEntry);
      } catch (e) {
        console.error('Supabase meal insert error:', e);
      }
    }
  };

  // 2. Öğün Düzenleme
  const updateMealLog = async (id: string, updates: Partial<MealLog>) => {
    const updated = mealLogs.map(m => (m.id === id ? { ...m, ...updates } : m));
    await persistMealsLocally(updated);

    if (!isDemoConfig && user) {
      try {
        await supabase.from('meal_logs').update(updates).eq('id', id);
      } catch (e) {
        console.error('Supabase meal update error:', e);
      }
    }
  };

  // 3. Öğün Silme
  const deleteMealLog = async (id: string) => {
    const updated = mealLogs.filter(m => m.id !== id);
    await persistMealsLocally(updated);

    if (!isDemoConfig && user) {
      try {
        await supabase.from('meal_logs').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase meal delete error:', e);
      }
    }
  };

  // 4. Günlük Toplam & Makro Hesaplama (Kabul Kriteri: ekleme, düzenleme, silme sonrası tutarlılık)
  const getDailySummary = (dateStr: string = selectedDate): DailyNutritionSummary => {
    const dayMeals = mealLogs.filter(m => m.log_date === dateStr);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const meals: {
      breakfast: MealLog[];
      lunch: MealLog[];
      dinner: MealLog[];
      snack: MealLog[];
    } = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    dayMeals.forEach(m => {
      totalCalories += m.calories || 0;
      totalProtein += m.protein_g || 0;
      totalCarbs += m.carbs_g || 0;
      totalFat += m.fat_g || 0;

      const type = (m.meal_type || 'snack') as MealType;
      if (meals[type]) {
        meals[type].push(m);
      } else {
        meals.snack.push(m);
      }
    });

    return {
      date: dateStr,
      totalCalories: Math.round(totalCalories),
      totalProtein: Number(totalProtein.toFixed(1)),
      totalCarbs: Number(totalCarbs.toFixed(1)),
      totalFat: Number(totalFat.toFixed(1)),
      meals,
    };
  };

  // Tarih Navigasyonu
  const changeDateByDays = (delta: number) => {
    const parts = selectedDate.split('-').map(Number);
    const cur = new Date(parts[0], parts[1] - 1, parts[2]);
    cur.setDate(cur.getDate() + delta);
    setSelectedDate(getLocalDateString(cur));
  };

  const goToPreviousDay = () => changeDateByDays(-1);
  const goToNextDay = () => changeDateByDays(1);
  const goToToday = () => setSelectedDate(getLocalDateString(new Date()));

  return (
    <DiaryContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        mealLogs,
        loadingDiary,
        addMealLog,
        updateMealLog,
        deleteMealLog,
        getDailySummary,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => useContext(DiaryContext);
