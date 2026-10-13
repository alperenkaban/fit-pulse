import { Recipe } from '../types';

export const RECIPES_DATABASE: Recipe[] = [
  {
    id: 'rec_sweet_chia',
    title: '🍫 Fit Kakaolu Muzlu Chia Puding',
    description: 'Aç kalmadan ve suçluluk duymadan tatlı krizini çözen hafif ve dengeli fit tatlı.',
    calories: 185,
    protein_g: 6.5,
    carbs_g: 22.0,
    fat_g: 7.0,
    prepTimeMinutes: 10,
    category: 'sweet_craving',
    tags: ['Tatlı Krizi', 'Şekersiz', 'Yüksek Lif'],
    ingredients: [
      '3 yemek kaşığı chia tohumu',
      '1 su bardağı badem sütü veya yarım yağlı süt',
      '1 tatlı kaşığı ham kakao',
      'Yarım ezilmiş muz',
      '1 çay kaşığı bal veya agave',
    ],
    instructions: [
      'Chia tohumu, süt ve kakaoyu bir kavanozda güzelce karıştırın.',
      'Ezilmiş muz ve balı ilave edip 2 dakika dinlendirin.',
      'Buzdolabında en az 2 saat (tercihen geceden) bekletip soğuk servis yapın.',
    ],
  },
  {
    id: 'rec_avocado_toast',
    title: '🥑 Avokadolu Poşe Yumurtalı Fit Tost',
    description: 'Sabah metabolizmasını roketleyen sağlıklı yağlar ve tam protein deposu.',
    calories: 320,
    protein_g: 17.5,
    carbs_g: 24.0,
    fat_g: 16.0,
    prepTimeMinutes: 12,
    category: 'breakfast',
    tags: ['Yüksek Protein', 'Sağlıklı Yağ', 'Tok Tutar'],
    ingredients: [
      '1 dilim tam buğday veya ekşi maya ekmek',
      '1 adet haşlanmış veya poşe yumurta',
      'Yarım olgun avokado',
      'Limon suyu, tuz, pul biber',
      'Bir tutam çörek otu',
    ],
    instructions: [
      'Ekmeği hafifçe kızartın.',
      'Avokadoyu limon suyu ve tuz ile ezip ekmeğin üzerine sürün.',
      'Üzerine poşe yumurtayı yerleştirip pul biber ile süsleyin.',
    ],
  },
  {
    id: 'rec_chicken_bowl',
    title: '🥗 Renkli Kinoa & Izgara Tavuk Bowl',
    description: 'Ofiste veya evde öğle yemeği için uzun süre tok tutan, metabolizma dostu kase.',
    calories: 410,
    protein_g: 38.0,
    carbs_g: 35.0,
    fat_g: 9.5,
    prepTimeMinutes: 20,
    category: 'lunch',
    tags: ['Yağ Yakan', 'Öğle Yemeği', 'Doyurucu'],
    ingredients: [
      '120g ızgara tavuk göğsü',
      'Yarım su bardağı haşlanmış kinoa veya bulgur',
      'Roka, marul, çeri domates',
      '1 tatlı kaşığı zeytinyağı ve elma sirkesi sosu',
    ],
    instructions: [
      'Kinoa ve tavuğu önceden pişirin.',
      'Geniş bir kasede yeşillikler, doğranmış domates ve kinoayı harmanlayın.',
      'Üzerine dilimlenmiş tavukları ekleyip zeytinyağlı sosu gezdirin.',
    ],
  },
  {
    id: 'rec_baked_salmon',
    title: '🐟 Fırında Sebzeli Somon & Kuşkonmaz',
    description: 'Omega-3 zengini, cildi parlatan ve gece yağ yakımını destekleyen akşam menüsü.',
    calories: 460,
    protein_g: 36.0,
    carbs_g: 12.0,
    fat_g: 28.0,
    prepTimeMinutes: 25,
    category: 'dinner',
    tags: ['Omega-3', 'Akşam Menüsü', 'Hafif & Besleyici'],
    ingredients: [
      '150g taze somon fileto',
      '5-6 dal kuşkonmaz veya brokoli',
      '1 tatlı kaşığı zeytinyağı',
      'Taze biberiye, sarımsak, limon dilimleri',
    ],
    instructions: [
      'Fırını 190 dereceye ısıtın.',
      'Fırın tepsisine somon ve sebzeleri yerleştirip zeytinyağı ve baharatlarla harmanlayın.',
      '15-18 dakika somon yumuşayana kadar pişirin.',
    ],
  },
  {
    id: 'rec_protein_yogurt_bowl',
    title: '🍓 Orman Meyveli Çıtır Protein Kasesi',
    description: 'Açlık krizlerini anında kesen, 5 dakikada hazırlanan pratik ara öğün.',
    calories: 220,
    protein_g: 21.0,
    carbs_g: 22.0,
    fat_g: 4.5,
    prepTimeMinutes: 5,
    category: 'snack',
    tags: ['5 Dakika', 'Yüksek Protein', 'Ara Öğün'],
    ingredients: [
      '150g süzme yoğurt',
      '1 avuç yaban mersini veya çilek',
      '1 yemek kaşığı chia veya yulaf ezmesi',
      'Birkaç damla vanilya özütü',
    ],
    instructions: [
      'Süzme yoğurdu vanilya ile pürüzsüz kıvama getirin.',
      'Üzerine taze meyveleri ve çıtır yulafı serpiştirip tüketin.',
    ],
  },
];

/**
 * Kalan kaloriye ve kategoriye göre akıllı tarif filtreleyici
 */
export function filterRecipes(
  remainingCalories?: number,
  categoryFilter?: string
): Recipe[] {
  return RECIPES_DATABASE.filter(recipe => {
    // Kategori filtresi
    if (categoryFilter && categoryFilter !== 'all' && recipe.category !== categoryFilter) {
      return false;
    }
    // Eğer kalan kalori belirtilmişse aşırı yüksek kalori önerilmesin
    if (remainingCalories !== undefined && remainingCalories > 0) {
      if (recipe.calories > remainingCalories + 100) {
        return false;
      }
    }
    return true;
  });
}
