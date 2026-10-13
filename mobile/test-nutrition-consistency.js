// FAZ 2 KABUL KRİTERİ VE TUTARLILIK DOĞRULAMA TESTİ

function calculatePortion(food, amount) {
  const ratio = Math.max(0, amount) / food.serving_base_amount;
  return {
    calories: Math.round(food.calories_per_base * ratio),
    protein_g: Number((food.protein_per_base * ratio).toFixed(1)),
    carbs_g: Number((food.carbs_per_base * ratio).toFixed(1)),
    fat_g: Number((food.fat_per_base * ratio).toFixed(1)),
  };
}

function calculateDailySummary(meals, targetDate) {
  const dayMeals = meals.filter(m => m.log_date === targetDate);
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  dayMeals.forEach(m => {
    totalCalories += m.calories || 0;
    totalProtein += m.protein_g || 0;
    totalCarbs += m.carbs_g || 0;
    totalFat += m.fat_g || 0;
  });

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Number(totalProtein.toFixed(1)),
    totalCarbs: Number(totalCarbs.toFixed(1)),
    totalFat: Number(totalFat.toFixed(1)),
  };
}

console.log("=== FAZ 2 BESLENME & TUTARLILIK TESTLERİ ===");

const egg = {
  name: 'Haşlanmış Yumurta',
  serving_unit: 'adet',
  serving_base_amount: 1,
  calories_per_base: 75,
  protein_per_base: 6.3,
  carbs_per_base: 0.6,
  fat_per_base: 5.3,
};

const chicken = {
  name: 'Izgara Tavuk Göğsü',
  serving_unit: 'gram',
  serving_base_amount: 100,
  calories_per_base: 165,
  protein_per_base: 31.0,
  carbs_per_base: 0.0,
  fat_per_base: 3.6,
};

// Test 1: Porsiyonlama Hesabı Doğrulaması (2 adet yumurta & 150g tavuk)
const p1 = calculatePortion(egg, 2);
console.log(`Test 1.1 (2 Adet Yumurta): Cal=${p1.calories} (Beklenen: 150), P=${p1.protein_g} (Beklenen: 12.6) -> ${p1.calories === 150 && p1.protein_g === 12.6 ? 'PASSED ✅' : 'FAILED ❌'}`);

const p2 = calculatePortion(chicken, 150);
console.log(`Test 1.2 (150g Tavuk Göğsü): Cal=${p2.calories} (Beklenen: 248), P=${p2.protein_g} (Beklenen: 46.5) -> ${p2.calories === 248 && p2.protein_g === 46.5 ? 'PASSED ✅' : 'FAILED ❌'}`);

// Test 2: Öğün Ekleme Sonrası Günlük Toplam Tutarlılığı
let meals = [
  { id: '1', log_date: '2026-10-13', calories: p1.calories, protein_g: p1.protein_g, carbs_g: p1.carbs_g, fat_g: p1.fat_g },
  { id: '2', log_date: '2026-10-13', calories: p2.calories, protein_g: p2.protein_g, carbs_g: p2.carbs_g, fat_g: p2.fat_g },
];

let sum1 = calculateDailySummary(meals, '2026-10-13');
console.log(`Test 2 (Ekleme Sonrası Toplam): Cal=${sum1.totalCalories} (Beklenen: 398), Protein=${sum1.totalProtein}g (Beklenen: 59.1g) -> ${sum1.totalCalories === 398 && sum1.totalProtein === 59.1 ? 'PASSED ✅' : 'FAILED ❌'}`);

// Test 3: Öğün Düzenleme Sonrası Günlük Toplam Tutarlılığı (Tavuk 200g yapıldı)
const p2_updated = calculatePortion(chicken, 200);
meals = meals.map(m => m.id === '2' ? { ...m, ...p2_updated } : m);
let sum2 = calculateDailySummary(meals, '2026-10-13');
console.log(`Test 3 (Düzenleme Sonrası Toplam): Cal=${sum2.totalCalories} (Beklenen: 480), Protein=${sum2.totalProtein}g (Beklenen: 74.6g) -> ${sum2.totalCalories === 480 && sum2.totalProtein === 74.6 ? 'PASSED ✅' : 'FAILED ❌'}`);

// Test 4: Öğün Silme Sonrası Günlük Toplam Tutarlılığı (Yumurta silindi)
meals = meals.filter(m => m.id !== '1');
let sum3 = calculateDailySummary(meals, '2026-10-13');
console.log(`Test 4 (Silme Sonrası Toplam): Cal=${sum3.totalCalories} (Beklenen: 330), Protein=${sum3.totalProtein}g (Beklenen: 62.0g) -> ${sum3.totalCalories === 330 && sum3.totalProtein === 62.0 ? 'PASSED ✅' : 'FAILED ❌'}`);

// Test 5: Farklı Tarih İzolasyonu (2026-10-12 ve 2026-10-13)
meals.push({ id: '3', log_date: '2026-10-12', calories: 500, protein_g: 30, carbs_g: 50, fat_g: 10 });
let sumToday = calculateDailySummary(meals, '2026-10-13');
let sumYesterday = calculateDailySummary(meals, '2026-10-12');
console.log(`Test 5 (Tarih İzolasyonu): Bugün=${sumToday.totalCalories}kcal, Dün=${sumYesterday.totalCalories}kcal -> ${sumToday.totalCalories === 330 && sumYesterday.totalCalories === 500 ? 'PASSED ✅' : 'FAILED ❌'}`);
