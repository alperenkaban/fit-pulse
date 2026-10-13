import { Gender, MetabolismMetrics, UserProfile } from '../types';

/**
 * Yaş hesaplama (Doğum tarihinden)
 */
export function calculateAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(14, Math.min(99, age || 24));
}

/**
 * Mifflin-St Jeor BMR (Bazal Metabolizma Hızı) Hesaplama
 * Formül:
 * Kadın: (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
 * Erkek: (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  // Sınır durum kontrolleri
  const validWeight = Math.max(30, Math.min(300, weightKg));
  const validHeight = Math.max(100, Math.min(250, heightCm));
  const validAge = Math.max(14, Math.min(99, age));

  let bmr = (10 * validWeight) + (6.25 * validHeight) - (5 * validAge);
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }
  return Math.round(bmr);
}

/**
 * TDEE (Toplam Günlük Enerji Harcaması)
 */
export function calculateTDEE(bmr: number, activityLevel: number): number {
  const validActivity = Math.max(1.1, Math.min(2.2, activityLevel || 1.375));
  return Math.round(bmr * validActivity);
}

/**
 * Tam Metabolizma ve Kilo İlerleme Analizi
 */
export function calculateMetabolismMetrics(
  profile: Pick<UserProfile, 'gender' | 'height_cm' | 'age' | 'start_weight_kg' | 'current_weight_kg' | 'target_weight_kg' | 'activity_level'>,
  loggedCaloriesToday?: number
): MetabolismMetrics {
  const bmr = calculateBMR(profile.current_weight_kg, profile.height_cm, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activity_level);

  // Sağlıklı Kalori Açığı (Günde ~450 kcal açık -> Ayda ~1.8-2.0 kg sağlıklı yağ kaybı)
  let healthyTarget = tdee - 450;
  
  // Güvenlik alt sınırı (Crash-Diet engeli):
  // Asla BMR'ın veya kadınlar için 1200 kcal'ın altına düşürme!
  if (healthyTarget < bmr) {
    healthyTarget = bmr;
  }
  if (profile.gender === 'female' && healthyTarget < 1200) {
    healthyTarget = 1200;
  }
  healthyTarget = Math.round(healthyTarget);

  const remainingWeightKg = Math.max(0, Number((profile.current_weight_kg - profile.target_weight_kg).toFixed(1)));
  const totalWeightToLose = Math.max(0.1, profile.start_weight_kg - profile.target_weight_kg);
  const lostSoFarKg = Math.max(0, Number((profile.start_weight_kg - profile.current_weight_kg).toFixed(1)));
  const progressPercent = Math.min(100, Math.max(0, Math.round((lostSoFarKg / totalWeightToLose) * 100)));

  // Kalan Süre Projeksiyonu (1 kg yağ = ~7700 kcal)
  const dailyDeficit = Math.max(250, tdee - healthyTarget);
  const totalKcalNeeded = remainingWeightKg * 7700;
  const etaDays = Math.ceil(totalKcalNeeded / dailyDeficit);
  const etaWeeks = (etaDays / 7).toFixed(1);

  // Crash Diet Tespiti (Ölüm diyeti tehlikesi)
  let isCrashDiet = false;
  let crashDietWarningMessage: string | undefined;

  if (loggedCaloriesToday !== undefined && loggedCaloriesToday > 0) {
    if (loggedCaloriesToday < 1000 || loggedCaloriesToday < bmr * 0.75) {
      isCrashDiet = true;
      crashDietWarningMessage = `DİKKAT: ${loggedCaloriesToday} kcal sağlıklı sınırın çok altında! Bazal metabolizman ${bmr} kcal. Kas kaybetmemek ve metabolizmayı korumak için lütfen yeterli besin tüket.`;
    }
  }

  return {
    bmr,
    tdee,
    healthyTarget,
    remainingWeightKg,
    lostSoFarKg,
    progressPercent,
    dailyDeficit,
    etaDays,
    etaWeeks,
    isCrashDiet,
    crashDietWarningMessage,
  };
}

/**
 * Bilinen Test Değerleri Doğrulama Fonksiyonu (Birim Testi)
 * MVP Kabul Kriteri: BMR ve TDEE bilinen test değerleriyle doğrulanır.
 */
export function runBmrTdeeVerificationTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let passed = true;

  // Test 1: Kadın 25 yaş, 165 cm, 60 kg, Hafif hareketli (1.375)
  // BMR = (10*60) + (6.25*165) - (5*25) - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345 kcal
  // TDEE = 1345 * 1.375 = 1849.375 -> 1849 kcal
  const test1BMR = calculateBMR(60, 165, 25, 'female');
  const test1TDEE = calculateTDEE(test1BMR, 1.375);
  if (test1BMR === 1345 && test1TDEE === 1849) {
    results.push('✅ Test 1 (Kadın 60kg, 165cm, 25y): BMR 1345, TDEE 1849 DOĞRULANDI');
  } else {
    passed = false;
    results.push(`❌ Test 1 BAŞARISIZ: Beklenen BMR 1345 (Alınan ${test1BMR}), Beklenen TDEE 1849 (Alınan ${test1TDEE})`);
  }

  // Test 2: Erkek 30 yaş, 180 cm, 80 kg, Masa başı (1.2)
  // BMR = (10*80) + (6.25*180) - (5*30) + 5 = 800 + 1125 - 150 + 5 = 1780 kcal
  // TDEE = 1780 * 1.2 = 2136 kcal
  const test2BMR = calculateBMR(80, 180, 30, 'male');
  const test2TDEE = calculateTDEE(test2BMR, 1.2);
  if (test2BMR === 1780 && test2TDEE === 2136) {
    results.push('✅ Test 2 (Erkek 80kg, 180cm, 30y): BMR 1780, TDEE 2136 DOĞRULANDI');
  } else {
    passed = false;
    results.push(`❌ Test 2 BAŞARISIZ: Beklenen BMR 1780 (Alınan ${test2BMR}), Beklenen TDEE 2136 (Alınan ${test2TDEE})`);
  }

  // Test 3: Sınır Durumlar (Aşırı düşük kilo / boy girişleri)
  const extremeBMR = calculateBMR(10, 50, 5, 'female');
  if (extremeBMR > 500) {
    results.push('✅ Test 3 (Sınır Durum Filtreleri): Güvenli alt sınırlara otomatik normalize edildi');
  } else {
    passed = false;
    results.push('❌ Test 3 BAŞARISIZ: Sınır durum doğru ele alınamadı');
  }

  return { passed, results };
}
