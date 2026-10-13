import { BarcodeItem } from '../types';

export const BARCODE_DATABASE: BarcodeItem[] = [
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
  {
    barcode: '8690757089012',
    name: 'Vanilyalı Protein Sütü (500ml - 26g Protein)',
    brand: 'Pınar Protein',
    serving_unit: 'kutu (500ml)',
    serving_amount: 1,
    calories: 250,
    protein_g: 26.0,
    carbs_g: 25.0,
    fat_g: 2.0,
  },
  {
    barcode: '8690637012399',
    name: 'Zeytinyağlı Ayçiçek Ton Balığı (160g)',
    brand: 'Dardanel',
    serving_unit: 'kutu (160g)',
    serving_amount: 1,
    calories: 285,
    protein_g: 36.0,
    carbs_g: 0.0,
    fat_g: 16.0,
  },
  {
    barcode: '8690767098765',
    name: 'Çıtır Karışık Çiğ Kuruyemiş',
    brand: 'Peyman Dor Leo',
    serving_unit: 'gram',
    serving_amount: 40,
    calories: 235,
    protein_g: 7.5,
    carbs_g: 8.0,
    fat_g: 19.5,
  },
  {
    barcode: '8690555011223',
    name: '%70 Kakaolu Bitter Çikolata (Anti-Tatlı Krizi)',
    brand: 'Nestle 1927',
    serving_unit: 'parça (25g)',
    serving_amount: 1,
    calories: 135,
    protein_g: 2.2,
    carbs_g: 11.5,
    fat_g: 9.0,
  },
];

/**
 * Barkod arama fonksiyonu
 */
export function findFoodByBarcode(barcode: string): BarcodeItem | null {
  const clean = barcode.trim().replace(/\s+/g, '');
  return BARCODE_DATABASE.find(item => item.barcode === clean) || null;
}
