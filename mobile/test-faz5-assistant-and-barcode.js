// ============================================================================
// FAZ 5: AKILLI DİYET ASİSTANI, BARKOD TARAMA & TARİF MOTORU TESTLERİ
// ============================================================================

const BARCODE_DATABASE = [
  {
    barcode: '8690526012345',
    name: 'İnce Öğütülmüş Yulaf Ezmesi (500g)',
    brand: 'Eti Lifalif',
    serving_unit: 'gram',
    serving_amount: 100,
    calories: 365,
    protein_g: 13.0,
    carbs_g: 62.0,
    fat_g: 6.5,
  },
  {
    barcode: '8690565045678',
    name: 'Süzme Yoğurt (Yüksek Protein)',
    brand: 'Sütaş',
    serving_unit: 'gram',
    serving_amount: 150,
    calories: 145,
    protein_g: 14.5,
    carbs_g: 5.2,
    fat_g: 7.2,
  },
];

function findFoodByBarcode(barcode) {
  const clean = barcode.trim().replace(/\s+/g, '');
  return BARCODE_DATABASE.find(item => item.barcode === clean) || null;
}

const RECIPES_DATABASE = [
  {
    id: 'rec_sweet_chia',
    title: '🍫 Fit Kakaolu Muzlu Chia Puding',
    calories: 185,
    category: 'sweet_craving',
  },
  {
    id: 'rec_baked_salmon',
    title: '🐟 Fırında Sebzeli Somon & Kuşkonmaz',
    calories: 460,
    category: 'dinner',
  },
  {
    id: 'rec_protein_yogurt_bowl',
    title: '🍓 Orman Meyveli Çıtır Protein Kasesi',
    calories: 220,
    category: 'snack',
  },
];

function filterRecipes(remainingCalories, categoryFilter) {
  return RECIPES_DATABASE.filter(recipe => {
    if (categoryFilter && categoryFilter !== 'all' && recipe.category !== categoryFilter) {
      return false;
    }
    if (remainingCalories !== undefined && remainingCalories > 0) {
      if (recipe.calories > remainingCalories + 100) {
        return false;
      }
    }
    return true;
  });
}

console.log("=== FAZ 5 BARKOD & TARİF ASİSTANI TEST SÜİTİ ===");

// TEST 1: Barkod Doğru Eşleştirme (Eti Lifalif Yulaf)
const b1 = findFoodByBarcode('8690526012345');
const test1_passed = b1 !== null && b1.name.includes('Yulaf') && b1.brand === 'Eti Lifalif' && b1.calories === 365;
console.log(`Test 1 (EAN-13 Barkod Eşleşmesi): ${test1_passed ? 'PASSED ✅' : 'FAILED ❌'}`);

// TEST 2: Geçersiz Barkod Sorgusu
const b2 = findFoodByBarcode('9999999999999');
const test2_passed = b2 === null;
console.log(`Test 2 (Bilinmeyen Barkod Güvenliği): ${test2_passed ? 'PASSED ✅ (Boş sonuç güvenle döndü)' : 'FAILED ❌'}`);

// TEST 3: Beyaz Boşluk Temizleme (Whitespace Trim)
const b3 = findFoodByBarcode('  8690565045678  ');
const test3_passed = b3 !== null && b3.brand === 'Sütaş';
console.log(`Test 3 (Barkod Format Temizliği): ${test3_passed ? 'PASSED ✅' : 'FAILED ❌'}`);

// TEST 4: Kalan Kaloriye Göre Akıllı Tarif Filtreleme (250 kcal limit)
const lowCalRecipes = filterRecipes(250);
const allUnderLimit = lowCalRecipes.every(r => r.calories <= 350);
const test4_passed = lowCalRecipes.length === 2 && allUnderLimit;
console.log(`Test 4 (Kalan Kaloriye Göre Akıllı Tarif Filtreleme): ${test4_passed ? 'PASSED ✅ (Limit aşanlar elendi)' : 'FAILED ❌'}`);

// TEST 5: 'Tatlı Krizi' Anti-Ölüm Diyeti Kategori Filtresi
const sweetCravingRecipes = filterRecipes(undefined, 'sweet_craving');
const test5_passed = sweetCravingRecipes.length === 1 && sweetCravingRecipes[0].title.includes('Chia');
console.log(`Test 5 (Tatlı Krizi Kategori Filtresi): ${test5_passed ? 'PASSED ✅' : 'FAILED ❌'}`);

const allPassed = test1_passed && test2_passed && test3_passed && test4_passed && test5_passed;
console.log(`\nSONUÇ: ${allPassed ? 'TÜM FAZ 5 TESTLERİ BAŞARIYLA GEÇTİ ✅ (5/5)' : 'BAZI TESTLER BAŞARISIZ ❌'}`);
process.exit(allPassed ? 0 : 1);
