import { FoodItem } from '../types';

export const FOOD_CATALOG: FoodItem[] = [
  // Kahvaltılık & Temel Besinler
  {
    id: 'f_egg',
    name: 'Haşlanmış Yumurta',
    category: 'Kahvaltılık',
    serving_unit: 'adet',
    serving_base_amount: 1,
    calories_per_base: 75,
    protein_per_base: 6.3,
    carbs_per_base: 0.6,
    fat_per_base: 5.3,
  },
  {
    id: 'f_oats',
    name: 'Yulaf Ezmesi',
    category: 'Tahıl & Kahvaltı',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 370,
    protein_per_base: 13.5,
    carbs_per_base: 60.0,
    fat_per_base: 7.0,
  },
  {
    id: 'f_cheese',
    name: 'Tam Yağlı Beyaz Peynir',
    category: 'Süt Ürünleri',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 260,
    protein_per_base: 16.0,
    carbs_per_base: 1.5,
    fat_per_base: 21.0,
  },
  {
    id: 'f_olives',
    name: 'Siyah Zeytin',
    category: 'Kahvaltılık',
    serving_unit: 'adet',
    serving_base_amount: 5,
    calories_per_base: 45,
    protein_per_base: 0.4,
    carbs_per_base: 0.8,
    fat_per_base: 4.5,
  },

  // Protein & Et / Tavuk / Balık
  {
    id: 'f_chicken_breast',
    name: 'Izgara Tavuk Göğsü',
    category: 'Et & Tavuk',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 165,
    protein_per_base: 31.0,
    carbs_per_base: 0.0,
    fat_per_base: 3.6,
  },
  {
    id: 'f_ground_beef',
    name: 'Yağsız Dana Kıyma / Köfte',
    category: 'Et & Tavuk',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 215,
    protein_per_base: 24.0,
    carbs_per_base: 0.0,
    fat_per_base: 13.0,
  },
  {
    id: 'f_salmon',
    name: 'Fırında Somon Balığı',
    category: 'Balık & Deniz Ürünleri',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 206,
    protein_per_base: 22.0,
    carbs_per_base: 0.0,
    fat_per_base: 12.5,
  },
  {
    id: 'f_tuna',
    name: 'Konserve Ton Balığı (Süzülmüş)',
    category: 'Balık & Deniz Ürünleri',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 130,
    protein_per_base: 28.0,
    carbs_per_base: 0.0,
    fat_per_base: 1.0,
  },

  // Karbonhidrat & Bakliyat
  {
    id: 'f_rice',
    name: 'Pirinç Pilavı (Pişmiş)',
    category: 'Tahıllar',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 130,
    protein_per_base: 2.7,
    carbs_per_base: 28.0,
    fat_per_base: 0.3,
  },
  {
    id: 'f_bulgur',
    name: 'Bulgur Pilavı (Pişmiş)',
    category: 'Tahıllar',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 120,
    protein_per_base: 3.8,
    carbs_per_base: 25.0,
    fat_per_base: 0.8,
  },
  {
    id: 'f_lentil_soup',
    name: 'Mercimek Çorbası',
    category: 'Çorbalar',
    serving_unit: 'porsiyon',
    serving_base_amount: 1, // 1 kase ~250ml
    calories_per_base: 160,
    protein_per_base: 8.5,
    carbs_per_base: 22.0,
    fat_per_base: 4.0,
  },
  {
    id: 'f_bread_whole',
    name: 'Tam Buğday Ekmeği',
    category: 'Ekmek & Fırın',
    serving_unit: 'dilim',
    serving_base_amount: 1, // 1 dilim ~30g
    calories_per_base: 70,
    protein_per_base: 3.5,
    carbs_per_base: 12.5,
    fat_per_base: 1.0,
  },

  // Sebzeler & Yeşillikler
  {
    id: 'f_salad',
    name: 'Mevsim Yeşillikleri Salatası',
    category: 'Sebze',
    serving_unit: 'porsiyon',
    serving_base_amount: 1,
    calories_per_base: 45,
    protein_per_base: 1.8,
    carbs_per_base: 6.0,
    fat_per_base: 1.2,
  },
  {
    id: 'f_broccoli',
    name: 'Buharda Brokoli',
    category: 'Sebze',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 35,
    protein_per_base: 2.8,
    carbs_per_base: 7.0,
    fat_per_base: 0.4,
  },

  // Meyveler & Sağlıklı Ara Öğünler
  {
    id: 'f_apple',
    name: 'Kırmızı / Yeşil Elma',
    category: 'Meyve',
    serving_unit: 'adet',
    serving_base_amount: 1, // Orta boy ~150g
    calories_per_base: 80,
    protein_per_base: 0.4,
    carbs_per_base: 20.0,
    fat_per_base: 0.2,
  },
  {
    id: 'f_banana',
    name: 'Muz (Orta Boy)',
    category: 'Meyve',
    serving_unit: 'adet',
    serving_base_amount: 1,
    calories_per_base: 105,
    protein_per_base: 1.3,
    carbs_per_base: 27.0,
    fat_per_base: 0.3,
  },
  {
    id: 'f_almonds',
    name: 'Çiğ Badem',
    category: 'Kuruyemiş',
    serving_unit: 'gram',
    serving_base_amount: 30, // 1 avuç
    calories_per_base: 175,
    protein_per_base: 6.0,
    carbs_per_base: 6.0,
    fat_per_base: 15.0,
  },
  {
    id: 'f_yogurt_greek',
    name: 'Süzme Yoğurt',
    category: 'Süt Ürünleri',
    serving_unit: 'gram',
    serving_base_amount: 100,
    calories_per_base: 100,
    protein_per_base: 10.0,
    carbs_per_base: 4.0,
    fat_per_base: 5.0,
  },
  {
    id: 'f_olive_oil',
    name: 'Zeytinyağı',
    category: 'Sağlıklı Yağlar',
    serving_unit: 'yemek kaşığı',
    serving_base_amount: 1, // 10 ml
    calories_per_base: 90,
    protein_per_base: 0.0,
    carbs_per_base: 0.0,
    fat_per_base: 10.0,
  },
];

/**
 * Porsiyona göre kalori ve makro hesaplayıcı
 */
export function calculatePortionMacros(
  food: FoodItem,
  amount: number
): { calories: number; protein_g: number; carbs_g: number; fat_g: number } {
  const ratio = Math.max(0, amount) / food.serving_base_amount;
  return {
    calories: Math.round(food.calories_per_base * ratio),
    protein_g: Number((food.protein_per_base * ratio).toFixed(1)),
    carbs_g: Number((food.carbs_per_base * ratio).toFixed(1)),
    fat_g: Number((food.fat_per_base * ratio).toFixed(1)),
  };
}
