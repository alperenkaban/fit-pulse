import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CalendarStrip } from '../components/CalendarStrip';
import { FoodSearchModal } from '../components/FoodSearchModal';
import { MacroBar } from '../components/MacroBar';
import { useAuth } from '../context/AuthContext';
import { useDiary } from '../context/DiaryContext';
import { MealLog, MealType } from '../types';

export const DiaryScreen: React.FC = () => {
  const { profile } = useAuth();
  const { selectedDate, getDailySummary, addMealLog, deleteMealLog } = useDiary();

  const [activeModalMealType, setActiveModalMealType] = useState<MealType | null>(null);

  const summary = getDailySummary(selectedDate);
  const targetCalories = profile?.daily_calorie_target || 1500;

  const handleOpenAddModal = (mealType: MealType) => {
    setActiveModalMealType(mealType);
  };

  const handleFoodSelected = async (foodData: {
    food_name: string;
    food_id?: string;
    serving_amount: number;
    serving_unit: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }) => {
    if (!activeModalMealType) return;
    await addMealLog({
      log_date: selectedDate,
      meal_type: activeModalMealType,
      food_id: foodData.food_id,
      food_name: foodData.food_name,
      serving_amount: foodData.serving_amount,
      serving_unit: foodData.serving_unit,
      calories: foodData.calories,
      protein_g: foodData.protein_g,
      carbs_g: foodData.carbs_g,
      fat_g: foodData.fat_g,
    });
  };

  const handleDeleteItem = (meal: MealLog) => {
    Alert.alert('Öğünü Sil', `${meal.food_name} kaydını silmek istediğine emin misin?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteMealLog(meal.id) },
    ]);
  };

  // Render a specific meal section
  const renderMealSection = (type: MealType, title: string, icon: string) => {
    const items = summary.meals[type] || [];
    const sectionCalories = items.reduce((sum, item) => sum + item.calories, 0);

    return (
      <View style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleBox}>
            <Text style={styles.mealIcon}>{icon}</Text>
            <View>
              <Text style={styles.mealTitle}>{title}</Text>
              <Text style={styles.mealCalTotal}>{sectionCalories} kcal</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => handleOpenAddModal(type)}
          >
            <Text style={styles.addBtnText}>+ Ekle</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <Text style={styles.emptyMealText}>Henüz besin eklenmedi</Text>
        ) : (
          <View style={styles.itemsList}>
            {items.map(item => (
              <View key={item.id} style={styles.foodRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{item.food_name}</Text>
                  <Text style={styles.foodDetails}>
                    {item.serving_amount} {item.serving_unit} • P: {item.protein_g}g • K: {item.carbs_g}g • Y: {item.fat_g}g
                  </Text>
                </View>

                <View style={styles.foodRightCol}>
                  <Text style={styles.itemCalories}>{item.calories} kcal</Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteItem(item)}
                  >
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>🥗 Beslenme Günlüğü</Text>
          <Text style={styles.headerSub}>Öğünlerini ve makrolarını takip et</Text>
        </View>

        {/* Takvim Çubuğu */}
        <CalendarStrip />

        {/* Günlük Kalori & Makro Barı */}
        <MacroBar
          totalCalories={summary.totalCalories}
          targetCalories={targetCalories}
          totalProtein={summary.totalProtein}
          totalCarbs={summary.totalCarbs}
          totalFat={summary.totalFat}
        />

        {/* 4 Öğün Bölümleri */}
        {renderMealSection('breakfast', 'Kahvaltı', '🍳')}
        {renderMealSection('lunch', 'Öğle Yemeği', '🥗')}
        {renderMealSection('dinner', 'Akşam Yemeği', '🥩')}
        {renderMealSection('snack', 'Ara Öğün', '🍎')}
      </ScrollView>

      {/* Besin Arama & Ekleme Modalı */}
      {activeModalMealType && (
        <FoodSearchModal
          visible={!!activeModalMealType}
          mealType={activeModalMealType}
          onClose={() => setActiveModalMealType(null)}
          onSelectFood={handleFoodSelected}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topHeader: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  mealCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.75)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealIcon: {
    fontSize: 22,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  mealCalTotal: {
    fontSize: 12,
    color: '#f472b6',
    fontWeight: '700',
    marginTop: 1,
  },
  addBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#f472b6',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyMealText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
    gap: 8,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  foodName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
  foodDetails: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  foodRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCalories: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 13,
    opacity: 0.6,
  },
});
