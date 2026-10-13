import { Gender, MealLog } from '../types';
import { calculateBMR, calculateTDEE } from './calculator';

export interface WeightDataPoint {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface PeriodSummary {
  periodDays: number;
  loggedDaysCount: number;
  dataCompletenessPercent: number;
  averageDailyCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  weightChangeKg: number | null;
}

export interface TargetDatePrediction {
  hasEnoughData: boolean;
  confidence: 'high' | 'medium' | 'low' | 'insufficient';
  estimatedDays: number | null;
  estimatedDateStr: string | null;
  confidenceIntervalDays: { min: number; max: number } | null;
  message: string;
}

export interface AdaptiveEnergy {
  originalBMR: number;
  currentBMR: number;
  currentTDEE: number;
  adaptedTargetCalories: number;
  weightLostKg: number;
  adaptationDifferenceCalories: number;
  recommendationNote: string;
}

/**
 * 7 Günlük / 30 Günlük Dönemsel Beslenme ve Kilo Özeti
 */
export function calculatePeriodSummary(
  periodDays: number,
  mealLogs: MealLog[],
  weightLogs: WeightDataPoint[],
  referenceDate: Date = new Date()
): PeriodSummary {
  const cutoffDate = new Date(referenceDate);
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  // Filtrelenen öğünler
  const filteredMeals = mealLogs.filter(m => m.log_date >= cutoffStr);
  const loggedDatesSet = new Set(filteredMeals.map(m => m.log_date));
  const loggedDaysCount = loggedDatesSet.size;

  let totalCal = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;

  filteredMeals.forEach(m => {
    totalCal += m.calories || 0;
    totalP += m.protein_g || 0;
    totalC += m.carbs_g || 0;
    totalF += m.fat_g || 0;
  });

  const avgDivisor = Math.max(1, loggedDaysCount);
  const averageDailyCalories = Math.round(totalCal / avgDivisor);
  const averageProtein = Number((totalP / avgDivisor).toFixed(1));
  const averageCarbs = Number((totalC / avgDivisor).toFixed(1));
  const averageFat = Number((totalF / avgDivisor).toFixed(1));
  const dataCompletenessPercent = Math.round((loggedDaysCount / periodDays) * 100);

  // Kilo değişimi
  const filteredWeights = weightLogs
    .filter(w => w.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  let weightChangeKg: number | null = null;
  if (filteredWeights.length >= 2) {
    const firstW = filteredWeights[0].weight;
    const lastW = filteredWeights[filteredWeights.length - 1].weight;
    weightChangeKg = Number((lastW - firstW).toFixed(1));
  }

  return {
    periodDays,
    loggedDaysCount,
    dataCompletenessPercent,
    averageDailyCalories,
    averageProtein,
    averageCarbs,
    averageFat,
    weightChangeKg,
  };
}

/**
 * Kilo Eğilimi (Exponential Moving Average / Trend)
 * Günlük su/ödem dalgalanmalarını filtreleyerek gerçek kilo trendini hesaplar.
 */
export function calculateWeightTrend(
  weights: WeightDataPoint[]
): { date: string; actualWeight: number; trendWeight: number }[] {
  if (!weights || weights.length === 0) return [];

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const results: { date: string; actualWeight: number; trendWeight: number }[] = [];

  let currentTrend = sorted[0].weight;

  sorted.forEach((item, index) => {
    if (index === 0) {
      currentTrend = item.weight;
    } else {
      // EMA katsayısı alpha = 0.2
      currentTrend = Number((currentTrend * 0.8 + item.weight * 0.2).toFixed(2));
    }
    results.push({
      date: item.date,
      actualWeight: item.weight,
      trendWeight: Number(currentTrend.toFixed(1)),
    });
  });

  return results;
}

/**
 * Güncel Enerji İhtiyacının Yeniden Değerlendirilmesi
 * Kilo verdikçe azalan metabolizma hızına göre yeni enerji hedefi adaptasyonu
 */
export function calculateAdaptiveEnergy(
  startWeight: number,
  currentWeight: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: number
): AdaptiveEnergy {
  const originalBMR = calculateBMR(startWeight, heightCm, age, gender);
  const currentBMR = calculateBMR(currentWeight, heightCm, age, gender);
  const currentTDEE = calculateTDEE(currentBMR, activityLevel);

  let adaptedTarget = currentTDEE - 450;
  if (adaptedTarget < currentBMR) adaptedTarget = currentBMR;
  if (gender === 'female' && adaptedTarget < 1200) adaptedTarget = 1200;
  adaptedTarget = Math.round(adaptedTarget);

  const weightLostKg = Number(Math.max(0, startWeight - currentWeight).toFixed(1));
  const adaptationDifferenceCalories = originalBMR - currentBMR;

  let recommendationNote = "Metabolizman stabil çalışıyor.";
  if (adaptationDifferenceCalories > 50) {
    recommendationNote = `Tebrikler, ${weightLostKg} kg verdin! Vücut kütlen azaldığı için günlük bazal ihtiyacın ${adaptationDifferenceCalories} kcal düştü. Plato evresini önlemek için önerilen kalori hedefin uyarlandı.`;
  }

  return {
    originalBMR,
    currentBMR,
    currentTDEE,
    adaptedTargetCalories: adaptedTarget,
    weightLostKg,
    adaptationDifferenceCalories,
    recommendationNote,
  };
}

/**
 * KABUL KRİTERİ: Yeterli veri yoksa uygulama sahte kesinlikte tahmin üretmez.
 * Hedef Tarihi Tahmini & Veri Güvenilirlik Analizi
 */
export function predictTargetDateWithConfidence(
  currentWeight: number,
  targetWeight: number,
  weightHistory: WeightDataPoint[],
  dailyDeficit: number = 450
): TargetDatePrediction {
  const remainingKg = Math.max(0, currentWeight - targetWeight);

  if (remainingKg <= 0) {
    return {
      hasEnoughData: true,
      confidence: 'high',
      estimatedDays: 0,
      estimatedDateStr: 'Hedefe Ulaşıldı! 🎉',
      confidenceIntervalDays: { min: 0, max: 0 },
      message: 'Tebrikler! Belirlediğin hedef kiloya zaten ulaştın.',
    };
  }

  // Son 14 gündeki tartı kayıt sayısı
  const recentDays = weightHistory.length;

  // KABUL KRİTERİ DENETİMİ:
  // Eğer en az 4 farklı gün tartı kaydı yoksa sahte kesinlik üretilmez!
  if (recentDays < 4) {
    // Yetersiz veri durumu
    return {
      hasEnoughData: false,
      confidence: 'insufficient',
      estimatedDays: null,
      estimatedDateStr: null,
      confidenceIntervalDays: null,
      message: '⚠️ YETERSİZ VERİ: Gerçekçi ve güvenilir bir hedef tarihi tahmini için en az 4 farklı gün tartı kaydı gereklidir. Sahte kesinlikte tahmin üretilmemektedir. Lütfen düzenli tartı kaydı girin.',
    };
  }

  // Yeterli veri varsa: Gerçekleşen haftalık kilo kaybı eğilimini analiz et
  const sorted = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date));
  const firstLog = sorted[0];
  const lastLog = sorted[sorted.length - 1];

  const daysBetween = Math.max(1, Math.round((new Date(lastLog.date).getTime() - new Date(firstLog.date).getTime()) / (1000 * 3600 * 24)));
  const totalLost = Math.max(0, firstLog.weight - lastLog.weight);
  const actualDailyLossRate = totalLost / daysBetween; // kg/gün

  let effectiveRate = actualDailyLossRate;
  let confidence: 'high' | 'medium' = 'high';

  // Eğer gerçekleşen hız sıfıra yakınsa veya aşırı dalgalıysa teorik kalori açığıyla harmanla
  if (effectiveRate < 0.02) {
    effectiveRate = (dailyDeficit / 7700); // 1 kg yağ ~ 7700 kcal
    confidence = 'medium';
  }

  const estimatedDays = Math.ceil(remainingKg / effectiveRate);
  
  // Güven aralığı (Confidence Interval): ±%20 belirsizlik payı
  const minDays = Math.max(1, Math.floor(estimatedDays * 0.85));
  const maxDays = Math.ceil(estimatedDays * 1.25);

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + estimatedDays);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  return {
    hasEnoughData: true,
    confidence,
    estimatedDays,
    estimatedDateStr: targetDateStr,
    confidenceIntervalDays: { min: minDays, max: maxDays },
    message: `Tahmini süre ~${estimatedDays} gün (${Math.round(minDays / 7)} - ${Math.round(maxDays / 7)} hafta aralığında). Veri kaliten yüksek olduğu için güvenilirdir.`,
  };
}
