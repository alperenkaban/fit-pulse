// Verification test for Mifflin-St Jeor and TDEE formulas

function calculateBMR(weightKg, heightCm, age, gender) {
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

function calculateTDEE(bmr, activityLevel) {
  return Math.round(bmr * activityLevel);
}

console.log("=== BMR & TDEE VERIFICATION TEST SUITE ===");

// Test 1: Kadın 25 yaş, 165 cm, 60 kg, Hafif hareketli (1.375)
// Formül: (10*60) + (6.25*165) - (5*25) - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345 kcal
// TDEE: 1345 * 1.375 = 1849.375 -> 1849 kcal
const t1_bmr = calculateBMR(60, 165, 25, 'female');
const t1_tdee = calculateTDEE(t1_bmr, 1.375);
console.log(`Test 1 (Kadın 60kg, 165cm, 25y): BMR=${t1_bmr} (Expected: 1345), TDEE=${t1_tdee} (Expected: 1849) -> ${t1_bmr === 1345 && t1_tdee === 1849 ? 'PASSED ✅' : 'FAILED ❌'}`);

// Test 2: Erkek 30 yaş, 180 cm, 80 kg, Masa başı (1.2)
// Formül: (10*80) + (6.25*180) - (5*30) + 5 = 800 + 1125 - 150 + 5 = 1780 kcal
// TDEE: 1780 * 1.2 = 2136 kcal
const t2_bmr = calculateBMR(80, 180, 30, 'male');
const t2_tdee = calculateTDEE(t2_bmr, 1.2);
console.log(`Test 2 (Erkek 80kg, 180cm, 30y): BMR=${t2_bmr} (Expected: 1780), TDEE=${t2_tdee} (Expected: 2136) -> ${t2_bmr === 1780 && t2_tdee === 2136 ? 'PASSED ✅' : 'FAILED ❌'}`);

// Test 3: Sınır durumlar
const t3_bmr = calculateBMR(10, 50, 5, 'female');
console.log(`Test 3 (Sınır Durum Normalizasyonu): BMR=${t3_bmr} -> ${t3_bmr > 500 ? 'PASSED ✅' : 'FAILED ❌'}`);
