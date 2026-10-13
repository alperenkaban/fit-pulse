import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { useAuth } from '../context/AuthContext';
import { useDiary } from '../context/DiaryContext';
import { filterRecipes, RECIPES_DATABASE } from '../data/recipesDatabase';
import { Recipe } from '../types';

export const RecipeAssistantScreen: React.FC = () => {
  const { profile } = useAuth();
  const { selectedDate, getDailySummary, addMealLog } = useDiary();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const summary = getDailySummary(selectedDate);
  const targetCalories = profile?.daily_calorie_target || 1500;
  const remainingCalories = targetCalories - summary.totalCalories;

  const recipes = useMemo(() => {
    return filterRecipes(undefined, selectedCategory);
  }, [selectedCategory]);

  const handleAddRecipeToMeal = (recipe: Recipe) => {
    const mealType = recipe.category === 'sweet_craving' ? 'snack' : recipe.category;

    Alert.alert(
      'Öğüne Ekle',
      `"${recipe.title}" tarifini (${recipe.calories} kcal) bugünkü beslenme günlüğüne eklemek istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Ekle ✓',
          onPress: async () => {
            await addMealLog({
              log_date: selectedDate,
              meal_type: mealType,
              food_name: recipe.title,
              serving_amount: 1,
              serving_unit: 'porsiyon',
              calories: recipe.calories,
              protein_g: recipe.protein_g,
              carbs_g: recipe.carbs_g,
              fat_g: recipe.fat_g,
            });
            Alert.alert('Afiyet Olsun! 🍓', 'Tarif bugünkü günlüğüne başarıyla eklendi.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.topHeaderRow}>
          <View>
            <Text style={styles.title}>🤖 Akıllı Diyet Asistanı</Text>
            <Text style={styles.subtitle}>Aç kalmadan yağ yaktıran leziz tarifler</Text>
          </View>

          {/* Barkod Hızlı Açma Butonu */}
          <TouchableOpacity
            style={styles.scanHeaderBtn}
            onPress={() => setShowBarcodeScanner(true)}
          >
            <Text style={styles.scanHeaderBtnText}>📸 Barkod</Text>
          </TouchableOpacity>
        </View>

        {/* Kalan Kalori & Asistan Tavsiyesi Kartı */}
        <View style={styles.assistantCard}>
          <Text style={styles.assistantBadge}>KİŞİSELLEŞTİRİLMİŞ ÖNERİ</Text>
          <Text style={styles.assistantHeading}>
            Bugün kalan hedefin: <Text style={styles.calHighlight}>{Math.max(0, remainingCalories)} kcal</Text>
          </Text>
          <Text style={styles.assistantMessage}>
            {remainingCalories > 300
              ? 'Akşam veya ara öğün için metabolizmanı hızlandıracak ve tokluk sağlayacak zengin proteinli seçenekler hazırladık!'
              : 'Hedefine çok yaklaştın! Tatlı krizini bastıracak veya hafif atıştırmalık tariflerimiz tam sana göre.'}
          </Text>
        </View>

        {/* Kategori Filtre Butonları */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {[
            { id: 'all', title: 'Tümü' },
            { id: 'sweet_craving', title: '🍫 Tatlı Krizi' },
            { id: 'breakfast', title: '🍳 Kahvaltı' },
            { id: 'lunch', title: '🥗 Öğle' },
            { id: 'dinner', title: '🥩 Akşam' },
            { id: 'snack', title: '🍎 Ara Öğün' },
          ].map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catBtn, selectedCategory === cat.id && styles.catBtnActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.catBtnText, selectedCategory === cat.id && styles.catBtnTextActive]}>
                {cat.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tarif Listesi */}
        <View style={styles.recipesList}>
          {recipes.map(item => {
            const isExpanded = selectedRecipeDetail?.id === item.id;

            return (
              <View key={item.id} style={styles.recipeCard}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipeTitle}>{item.title}</Text>
                    <Text style={styles.recipeDesc}>{item.description}</Text>
                  </View>
                  <Text style={styles.recipeCal}>{item.calories} kcal</Text>
                </View>

                {/* Tags & Prep Time */}
                <View style={styles.tagsRow}>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>⏱️ {item.prepTimeMinutes} dk</Text>
                  </View>
                  {item.tags.map(t => (
                    <View key={t} style={styles.tagPill}>
                      <Text style={styles.tagPillText}>{t}</Text>
                    </View>
                  ))}
                </View>

                {/* Macro Breakdown */}
                <View style={styles.macroPillsRow}>
                  <Text style={styles.macroPill}>Protein: <Text style={{ color: '#38bdf8', fontWeight: '800' }}>{item.protein_g}g</Text></Text>
                  <Text style={styles.macroPill}>Karb: <Text style={{ color: '#fbbf24', fontWeight: '800' }}>{item.carbs_g}g</Text></Text>
                  <Text style={styles.macroPill}>Yağ: <Text style={{ color: '#fb7185', fontWeight: '800' }}>{item.fat_g}g</Text></Text>
                </View>

                {/* Expanded Details (Ingredients & Instructions) */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    <Text style={styles.sectionSubTitle}>Malzemeler:</Text>
                    {item.ingredients.map((ing, idx) => (
                      <Text key={idx} style={styles.bulletItem}>• {ing}</Text>
                    ))}

                    <Text style={[styles.sectionSubTitle, { marginTop: 10 }]}>Hazırlanışı:</Text>
                    {item.instructions.map((ins, idx) => (
                      <Text key={idx} style={styles.stepItem}>{idx + 1}. {ins}</Text>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.recipeActionRow}>
                  <TouchableOpacity
                    style={styles.detailsToggleBtn}
                    onPress={() => setSelectedRecipeDetail(isExpanded ? null : item)}
                  >
                    <Text style={styles.detailsToggleText}>
                      {isExpanded ? 'Detayları Kapat ▲' : 'Tarifi Gör ▼'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addRecipeBtn}
                    onPress={() => handleAddRecipeToMeal(item)}
                  >
                    <Text style={styles.addRecipeBtnText}>+ Öğünüme Ekle</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Barkod Tarayıcı Modalı */}
      <BarcodeScannerModal
        visible={showBarcodeScanner}
        mealType="snack"
        onClose={() => setShowBarcodeScanner(false)}
        onFoodScanned={async (scannedFood) => {
          await addMealLog({
            log_date: selectedDate,
            meal_type: 'snack',
            food_name: scannedFood.food_name,
            serving_amount: scannedFood.serving_amount,
            serving_unit: scannedFood.serving_unit,
            calories: scannedFood.calories,
            protein_g: scannedFood.protein_g,
            carbs_g: scannedFood.carbs_g,
            fat_g: scannedFood.fat_g,
          });
          Alert.alert('Eklendi! ✨', `${scannedFood.food_name} ara öğününe başarıyla eklendi.`);
        }}
      />
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
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  scanHeaderBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  scanHeaderBtnText: {
    color: '#f472b6',
    fontWeight: '700',
    fontSize: 12,
  },
  assistantCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    marginBottom: 16,
  },
  assistantBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f472b6',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  assistantHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  calHighlight: {
    color: '#34d399',
  },
  assistantMessage: {
    fontSize: 12.5,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  catBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
  },
  catBtnActive: {
    backgroundColor: '#f43f5e',
  },
  catBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  catBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  recipesList: {
    gap: 16,
  },
  recipeCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.75)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  recipeDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 16,
  },
  recipeCal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34d399',
    marginLeft: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  timeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeBadgeText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  tagPill: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagPillText: {
    color: '#f472b6',
    fontSize: 11,
    fontWeight: '600',
  },
  macroPillsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  macroPill: {
    fontSize: 12,
    color: '#94a3b8',
  },
  expandedSection: {
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  sectionSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
  },
  stepItem: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginTop: 2,
  },
  recipeActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailsToggleBtn: {
    paddingVertical: 6,
  },
  detailsToggleText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  addRecipeBtn: {
    backgroundColor: '#f43f5e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addRecipeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
