// FAZ 3 KABUL KRİTERİ VE ANALİTİK DOĞRULAMA TESTİ

function predictTargetDateWithConfidence(currentWeight, targetWeight, weightHistory, dailyDeficit = 450) {
  const remainingKg = Math.max(0, currentWeight - targetWeight);

  if (remainingKg <= 0) {
    return {
      hasEnoughData: true,
      confidence: 'high',
      estimatedDays: 0,
      message: 'Hedefe Ulaşıldı! 🎉',
    };
  }

  // KABUL KRİTERİ KONTROLÜ: En az 4 farklı gün tartı kaydı zorunluluğu
  if (weightHistory.length < 4) {
    return {
      hasEnoughData: false,
      confidence: 'insufficient',
      estimatedDays: null,
      message: '⚠️ YETERSİZ VERİ: Gerçekçi ve güvenilir bir hedef tarihi tahmini için en az 4 farklı gün tartı kaydı gereklidir. Sahte kesinlikte tahmin üretilmemektedir.',
    };
  }

  const sorted = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date));
  const firstLog = sorted[0];
  const lastLog = sorted[sorted.length - 1];
  const daysBetween = Math.max(1, Math.round((new Date(lastLog.date).getTime() - new Date(firstLog.date).getTime()) / (1000 * 3600 * 24)));
  const totalLost = Math.max(0, firstLog.weight - lastLog.weight);
  let effectiveRate = totalLost / daysBetween;

  let confidence = 'high';
  if (effectiveRate < 0.02) {
    effectiveRate = (dailyDeficit / 7700);
    confidence = 'medium';
  }

  const estimatedDays = Math.ceil(remainingKg / effectiveRate);
  const minDays = Math.max(1, Math.floor(estimatedDays * 0.85));
  const maxDays = Math.ceil(estimatedDays * 1.25);

  return {
    hasEnoughData: true,
    confidence,
    estimatedDays,
    minDays,
    maxDays,
    message: `Tahmini süre ~${estimatedDays} gün (${Math.round(minDays / 7)} - ${Math.round(maxDays / 7)} hafta).`,
  };
}

function calculateWeightTrend(weights) {
  if (!weights || weights.length === 0) return [];
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  let currentTrend = sorted[0].weight;
  const results = [];

  sorted.forEach((item, index) => {
    if (index === 0) {
      currentTrend = item.weight;
    } else {
      currentTrend = Number((currentTrend * 0.8 + item.weight * 0.2).toFixed(2));
    }
    results.push({ date: item.date, actual: item.weight, trend: Number(currentTrend.toFixed(1)) });
  });
  return results;
}

console.log("=== FAZ 3 ANALİTİK & KABUL KRİTERİ TESTLERİ ===");

// Test 1: KABUL KRİTERİ - Yetersiz Veri Durumu (Yalnızca 2 gün kayıt var)
const sparseData = [
  { date: '2026-10-01', weight: 64.0 },
  { date: '2026-10-03', weight: 63.8 }
];
const res1 = predictTargetDateWithConfidence(63.8, 56.0, sparseData);
console.log(`Test 1 (Yetersiz Veri Koruma Kalkanı):`);
console.log(`  hasEnoughData=${res1.hasEnoughData} (Beklenen: false)`);
console.log(`  estimatedDays=${res1.estimatedDays} (Beklenen: null)`);
console.log(`  Sonuç: ${!res1.hasEnoughData && res1.estimatedDays === null ? 'PASSED ✅ (Sahte kesinlik engellendi)' : 'FAILED ❌'}`);

// Test 2: Yeterli Veri Durumu (4 gün kayıt var)
const sufficientData = [
  { date: '2026-10-01', weight: 64.0 },
  { date: '2026-10-05', weight: 63.5 },
  { date: '2026-10-09', weight: 63.1 },
  { date: '2026-10-13', weight: 62.8 }
];
const res2 = predictTargetDateWithConfidence(62.8, 56.0, sufficientData);
console.log(`Test 2 (Yeterli Veriyle Güvenilir Tahmin):`);
console.log(`  hasEnoughData=${res2.hasEnoughData} (Beklenen: true)`);
console.log(`  estimatedDays=${res2.estimatedDays} gün, Aralık=[${res2.minDays} - ${res2.maxDays} gün]`);
console.log(`  Sonuç: ${res2.hasEnoughData && res2.estimatedDays > 0 ? 'PASSED ✅' : 'FAILED ❌'}`);

// Test 3: Kilo Eğilimi (EMA Trend Yumuşatma)
const rawWeights = [
  { date: '2026-10-01', weight: 65.0 },
  { date: '2026-10-02', weight: 66.2 }, // Ani su/tuz artışı
  { date: '2026-10-03', weight: 64.8 }
];
const trend = calculateWeightTrend(rawWeights);
// 66.2'lik ani sıçrama 65.0 * 0.8 + 66.2 * 0.2 = 52.0 + 13.24 = 65.24 -> 65.2 kg olarak yumuşatılmalı
console.log(`Test 3 (Kilo Eğilimi Yumuşatma): Ani tartı=${trend[1].actual}kg, Eğilim=${trend[1].trend}kg -> ${trend[1].trend < 65.5 ? 'PASSED ✅' : 'FAILED ❌'}`);
