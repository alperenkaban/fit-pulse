export type Gender = 'female' | 'male';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  gender: Gender;
  birth_date: string; // YYYY-MM-DD
  age: number;
  height_cm: number;
  start_weight_kg: number;
  current_weight_kg: number;
  target_weight_kg: number;
  activity_level: number; // 1.2, 1.375, 1.55, 1.725
  daily_calorie_target: number;
  created_at?: string;
  updated_at?: string;
}

export interface MetabolismMetrics {
  bmr: number;
  tdee: number;
  healthyTarget: number;
  remainingWeightKg: number;
  lostSoFarKg: number;
  progressPercent: number;
  dailyDeficit: number;
  etaDays: number;
  etaWeeks: string;
  isCrashDiet: boolean;
  crashDietWarningMessage?: string;
}

export interface WeightLog {
  id?: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  weight_kg: number;
  notes?: string;
  created_at?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  serving_unit: string; // 'gram' | 'adet' | 'porsiyon'
  serving_base_amount: number; // örn: 100 gram veya 1 adet
  calories_per_base: number; // base miktar için kalori
  protein_per_base: number;
  carbs_per_base: number;
  fat_per_base: number;
}

export interface MealLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  meal_type: MealType;
  food_id?: string;
  food_name: string;
  serving_amount: number; // Girilen porsiyon miktarı (örn: 150g)
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at?: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: {
    breakfast: MealLog[];
    lunch: MealLog[];
    dinner: MealLog[];
    snack: MealLog[];
  };
}

export interface BarcodeItem {
  barcode: string;
  name: string;
  brand: string;
  serving_unit: string;
  serving_amount: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  prepTimeMinutes: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'sweet_craving';
  tags: string[]; // e.g. ['Yüksek Protein', 'Tatlı Krizi', 'Hızlı Hazırlanır']
  ingredients: string[];
  instructions: string[];
}


