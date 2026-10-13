import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { BARCODE_DATABASE, findFoodByBarcode } from '../data/barcodeDatabase';
import { BarcodeItem, MealType } from '../types';

interface BarcodeScannerModalProps {
  visible: boolean;
  mealType: MealType;
  onClose: () => void;
  onFoodScanned: (food: {
    food_name: string;
    serving_amount: number;
    serving_unit: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  visible,
  mealType,
  onClose,
  onFoodScanned,
}) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedItem, setScannedItem] = useState<BarcodeItem | null>(null);

  const handleScan = (code: string) => {
    const item = findFoodByBarcode(code);
    if (item) {
      setScannedItem(item);
    } else {
      Alert.alert('Barkod Bulunamadı', `Girilen barkod (${code}) veritabanımızda bulunamadı. Lütfen kontrol edin.`);
    }
  };

  const handleConfirmAdd = () => {
    if (!scannedItem) return;
    onFoodScanned({
      food_name: `${scannedItem.name} (${scannedItem.brand})`,
      serving_amount: scannedItem.serving_amount,
      serving_unit: scannedItem.serving_unit,
      calories: scannedItem.calories,
      protein_g: scannedItem.protein_g,
      carbs_g: scannedItem.carbs_g,
      fat_g: scannedItem.fat_g,
    });
    setScannedItem(null);
    setManualBarcode('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>📸 Akıllı Barkod Tarayıcı</Text>
              <Text style={styles.subtitle}>Paketli gıdaları saniyeler içinde otomatik tanı</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Visual Scanner Frame */}
            <View style={styles.scannerViewport}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
              <View style={styles.laserBeam} />
              <Text style={styles.scannerHint}>Barkodu çerçeve içine hizalayın</Text>
            </View>

            {/* Bulunan Ürün Kartı */}
            {scannedItem ? (
              <View style={styles.foundItemCard}>
                <View style={styles.foundItemBadge}>
                  <Text style={styles.foundItemBadgeText}>✅ Ürün Tespit Edildi</Text>
                </View>
                <Text style={styles.foundName}>{scannedItem.name}</Text>
                <Text style={styles.foundBrand}>Marka: {scannedItem.brand}</Text>
                <Text style={styles.foundServing}>
                  Porsiyon: {scannedItem.serving_amount} {scannedItem.serving_unit}
                </Text>

                <View style={styles.macroRow}>
                  <View style={styles.macroBox}>
                    <Text style={styles.macroNum}>{scannedItem.calories}</Text>
                    <Text style={styles.macroLabel}>kcal</Text>
                  </View>
                  <View style={styles.macroBox}>
                    <Text style={[styles.macroNum, { color: '#38bdf8' }]}>{scannedItem.protein_g}g</Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <View style={styles.macroBox}>
                    <Text style={[styles.macroNum, { color: '#fbbf24' }]}>{scannedItem.carbs_g}g</Text>
                    <Text style={styles.macroLabel}>Karb</Text>
                  </View>
                  <View style={styles.macroBox}>
                    <Text style={[styles.macroNum, { color: '#fb7185' }]}>{scannedItem.fat_g}g</Text>
                    <Text style={styles.macroLabel}>Yağ</Text>
                  </View>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => setScannedItem(null)}
                  >
                    <Text style={styles.btnSecondaryText}>Yeniden Tara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={handleConfirmAdd}
                  >
                    <Text style={styles.btnPrimaryText}>Öğüne Ekle ✓</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Manuel Barkod Numarası Girişi */}
                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>Barkod Numarası Yazın (EAN-13)</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.barcodeInput}
                      placeholder="Örn: 8690526012345"
                      placeholderTextColor="#64748b"
                      keyboardType="numeric"
                      value={manualBarcode}
                      onChangeText={setManualBarcode}
                    />
                    <TouchableOpacity
                      style={styles.scanBtn}
                      onPress={() => handleScan(manualBarcode)}
                    >
                      <Text style={styles.scanBtnText}>Sorgula</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Hızlı Test Barkodları */}
                <Text style={styles.sectionLabel}>Hızlı Test Besinleri (Dokun ve Tara):</Text>
                <View style={styles.quickList}>
                  {BARCODE_DATABASE.map(item => (
                    <TouchableOpacity
                      key={item.barcode}
                      style={styles.quickCard}
                      onPress={() => handleScan(item.barcode)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.quickName}>{item.name}</Text>
                        <Text style={styles.quickBrand}>{item.brand} • {item.barcode}</Text>
                      </View>
                      <Text style={styles.quickCal}>{item.calories} kcal</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 10, 19, 0.88)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#131b2e',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  scannerViewport: {
    height: 140,
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 18,
    overflow: 'hidden',
  },
  laserBeam: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: '#f43f5e',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  scannerHint: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  cornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#f43f5e',
  },
  cornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#f43f5e',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#f43f5e',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#f43f5e',
  },
  inputSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  barcodeInput: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  scanBtn: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  scanBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  quickList: {
    gap: 8,
    marginBottom: 20,
  },
  quickCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.6)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  quickName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  quickBrand: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  quickCal: {
    color: '#34d399',
    fontWeight: '700',
    fontSize: 13,
  },
  foundItemCard: {
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: 16,
  },
  foundItemBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  foundItemBadgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  foundName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  foundBrand: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  foundServing: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 14,
  },
  macroRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(23, 31, 48, 0.7)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  macroBox: {
    flex: 1,
    alignItems: 'center',
  },
  macroNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  macroLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 2,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
