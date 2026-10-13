import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { calculatePortionMacros, FOOD_CATALOG } from '../data/foodCatalog';
import { FoodItem, MealType } from '../types';

interface FoodSearchModalProps {
  visible: boolean;
  mealType: MealType;
  onClose: () => void;
  onSelectFood: (foodLog: {
    food_name: string;
    food_id?: string;
    serving_amount: number;
    serving_unit: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }) => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  visible,
  mealType,
  onClose,
  onSelectFood,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionAmount, setPortionAmount] = useState('100');

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return FOOD_CATALOG;
    const q = searchQuery.toLowerCase();
    return FOOD_CATALOG.filter(
      f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const portionCalculations = useMemo(() => {
    if (!selectedFood) return null;
    const amt = parseFloat(portionAmount) || 0;
    return calculatePortionMacros(selectedFood, amt);
  }, [selectedFood, portionAmount]);

  const handlePickFood = (food: FoodItem) => {
    setSelectedFood(food);
    setPortionAmount(String(food.serving_base_amount));
  };

  const handleConfirmAdd = () => {
    if (!selectedFood || !portionCalculations) return;
    const amt = parseFloat(portionAmount) || selectedFood.serving_base_amount;

    onSelectFood({
      food_name: selectedFood.name,
      food_id: selectedFood.id,
      serving_amount: amt,
      serving_unit: selectedFood.serving_unit,
      calories: portionCalculations.calories,
      protein_g: portionCalculations.protein_g,
      carbs_g: portionCalculations.carbs_g,
      fat_g: portionCalculations.fat_g,
    });

    // Reset and close
    setSelectedFood(null);
    setSearchQuery('');
    onClose();
  };

  const getMealTypeTitle = () => {
    switch (mealType) {
      case 'breakfast': return 'Kahvaltıya Ekle';
      case 'lunch': return 'Öğle Yemeğine Ekle';
      case 'dinner': return 'Akşam Yemeğine Ekle';
      case 'snack': return 'Ara Öğüne Ekle';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>{getMealTypeTitle()}</Text>
              <Text style={styles.subtitle}>Besin kataloğundan seç veya ara</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* If a food is chosen for portion editing */}
          {selectedFood && portionCalculations ? (
            <View style={styles.portionCard}>
              <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
              <Text style={styles.selectedFoodCategory}>{selectedFood.category}</Text>

              <View style={styles.portionInputRow}>
                <Text style={styles.portionLabel}>Miktar ({selectedFood.serving_unit}):</Text>
                <TextInput
                  style={styles.portionInput}
                  keyboardType="numeric"
                  value={portionAmount}
                  onChangeText={setPortionAmount}
                  autoFocus
                />
              </View>

              {/* Dinamik Canlı Makro Önizleme */}
              <View style={styles.previewBox}>
                <View style={styles.previewCol}>
                  <Text style={styles.previewLabel}>Kalori</Text>
                  <Text style={styles.previewCal}>{portionCalculations.calories} kcal</Text>
                </View>
                <View style={styles.previewCol}>
                  <Text style={[styles.previewLabel, { color: '#38bdf8' }]}>Protein</Text>
                  <Text style={styles.previewVal}>{portionCalculations.protein_g}g</Text>
                </View>
                <View style={styles.previewCol}>
                  <Text style={[styles.previewLabel, { color: '#fbbf24' }]}>Karb</Text>
                  <Text style={styles.previewVal}>{portionCalculations.carbs_g}g</Text>
                </View>
                <View style={styles.previewCol}>
                  <Text style={[styles.previewLabel, { color: '#fb7185' }]}>Yağ</Text>
                  <Text style={styles.previewVal}>{portionCalculations.fat_g}g</Text>
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setSelectedFood(null)}
                >
                  <Text style={styles.cancelBtnText}>Geri</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmAdd}>
                  <Text style={styles.confirmBtnText}>Öğüne Ekle ✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Search Box */}
              <TextInput
                style={styles.searchInput}
                placeholder="Besin ara (örn: tavuk, yumurta, yulaf...)"
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {/* Food List */}
              <FlatList
                data={filteredFoods}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.foodItemRow}
                    onPress={() => handlePickFood(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodMeta}>
                        {item.serving_base_amount} {item.serving_unit} • P: {item.protein_per_base}g • K: {item.carbs_per_base}g • Y: {item.fat_per_base}g
                      </Text>
                    </View>
                    <Text style={styles.foodCal}>{item.calories_per_base} kcal</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 10, 19, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#131b2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
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
    fontSize: 18,
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
  searchInput: {
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  foodItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  foodName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  foodMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  foodCal: {
    color: '#f472b6',
    fontWeight: '700',
    fontSize: 14,
  },
  portionCard: {
    backgroundColor: 'rgba(11, 15, 25, 0.7)',
    borderRadius: 18,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedFoodName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  selectedFoodCategory: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  portionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  portionLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  portionInput: {
    backgroundColor: 'rgba(23, 31, 48, 0.9)',
    borderWidth: 1,
    borderColor: '#f43f5e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    width: 90,
    textAlign: 'center',
  },
  previewBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(23, 31, 48, 0.8)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  previewCol: {
    flex: 1,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  previewCal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#34d399',
    marginTop: 2,
  },
  previewVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#f43f5e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
