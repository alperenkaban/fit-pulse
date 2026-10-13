import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useDiary } from '../context/DiaryContext';
import {
  calculateAdaptiveEnergy,
  calculatePeriodSummary,
  calculateWeightTrend,
  predictTargetDateWithConfidence,
  WeightDataPoint
} from '../services/analytics';

export const AnalyticsScreen: React.FC = () => {
  const { profile } = useAuth();
  const { mealLogs } = useDiary();

  const [period, setPeriod] = useState<7 | 30>(7);

  // Kilo geçmişi (Demo / profil tartı verileri simülasyonu ve gerçek kayıtlar)
  const weightHistory: WeightDataPoint[] = useMemo(() => {
    if (!profile) return [];
    // Başlangıç ve güncel kilo noktaları
    const list: WeightDataPoint[] = [
      { date: '2026-10-01', weight: profile.start_weight_kg },
      { date: '2026-10-05', weight: Number((profile.start_weight_kg - 0.4).toFixed(1)) },
      { date: '2026-10-09', weight: Number((profile.start_weight_kg - 0.8).toFixed(1)) },
      { date: '2026-10-13', weight: profile.current_weight_kg },
    ];
    return list;
  }, [profile]);

  // 1. Dönemsel Özet
  const summary = useMemo(() => {
    return calculatePeriodSummary(period, mealLogs, weightHistory);
  }, [period, mealLogs, weightHistory]);

  // 2. Kilo Eğilimi (Trend)
  const weightTrends = useMemo(() => {
    return calculateWeightTrend(weightHistory);
  }, [weightHistory]);

  // 3. Yeniden Değerlendirilen Enerji İhtiyacı
  const adaptiveEnergy = useMemo(() => {
    if (!profile) return null;
    return calculateAdaptiveEnergy(
      profile.start_weight_kg,
      profile.current_weight_kg,
      profile.height_cm,
      profile.age,
      profile.gender,
      profile.activity_level
    );
  }, [profile]);

  // 4. Hedef Tarihi Tahmini (Kabul Kriteri: Yetersiz veride sahte kesinlik üretmez)
  const targetPrediction = useMemo(() => {
    if (!profile) return null;
    return predictTargetDateWithConfidence(
      profile.current_weight_kg,
      profile.target_weight_kg,
      weightHistory
    );
  }, [profile, weightHistory]);

  if (!profile || !adaptiveEnergy || !targetPrediction) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#fff' }}>Yükleniyor...</Text>
      </View>
    );
  }

  const latestTrend = weightTrends[weightTrends.length - 1];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerBox}>
          <Text style={styles.title}>📈 İlerleme & Akıllı Analiz</Text>
          <Text style={styles.subtitle}>
            Kişisel eğilimler, plato önleme ve hedef projeksiyonları
          </Text>
        </View>

        {/* 1. Hedef Tarihi Tahmini & Veri Güvenilirlik Kartı (KABUL KRİTERİ) */}
        <View style={[
          styles.card,
          targetPrediction.hasEnoughData ? styles.cardSuccessBorder : styles.cardWarningBorder
        ]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>
              {targetPrediction.hasEnoughData ? '🎯 Hedef Tarihi Tahmini' : '⚠️ Veri Güvenilirlik Durumu'}
            </Text>
            <View style={[
              styles.confidenceBadge,
              targetPrediction.confidence === 'high' ? styles.badgeHigh :
              targetPrediction.confidence === 'medium' ? styles.badgeMedium : styles.badgeLow
            ]}>
              <Text style={styles.confidenceBadgeText}>
                Güvenilirlik: {targetPrediction.confidence.toUpperCase()}
              </Text>
            </View>
          </View>

          {targetPrediction.hasEnoughData ? (
            <View style={styles.predictionSuccessBox}>
              <Text style={styles.targetDateText}>{targetPrediction.estimatedDateStr}</Text>
              <Text style={styles.predictionDetailsText}>{targetPrediction.message}</Text>
              {targetPrediction.confidenceIntervalDays && (
                <View style={styles.intervalBox}>
                  <Text style={styles.intervalText}>
                    Aralık: {targetPrediction.confidenceIntervalDays.min} - {targetPrediction.confidenceIntervalDays.max} gün
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.predictionWarningBox}>
              <Text style={styles.warningMessageText}>{targetPrediction.message}</Text>
              <Text style={styles.warningSubText}>
                * Sahte kesinlikte tarih üretmek yerine bilimsel veri toplama beklenmektedir.
              </Text>
            </View>
          )}
        </View>

        {/* 2. Güncel Enerji İhtiyacının Yeniden Değerlendirilmesi (Metabolik Adaptasyon) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Güncel Enerji & Plato Koruması</Text>
          <Text style={styles.cardSubtitle}>
            Kilon düştükçe vücudun daha az enerji harcar. Plato evresine girmemen için kalori hedefin dinamik güncellenir:
          </Text>

          <View style={styles.energyComparisonRow}>
            <View style={styles.energyCol}>
              <Text style={styles.energyColLabel}>Başlangıç BMR</Text>
              <Text style={styles.energyColVal}>{adaptiveEnergy.originalBMR} kcal</Text>
            </View>
            <Text style={styles.arrowIcon}>➔</Text>
            <View style={styles.energyCol}>
              <Text style={styles.energyColLabel}>Güncel BMR</Text>
              <Text style={[styles.energyColVal, { color: '#f472b6' }]}>
                {adaptiveEnergy.currentBMR} kcal
              </Text>
            </View>
            <Text style={styles.arrowIcon}>➔</Text>
            <View style={styles.energyCol}>
              <Text style={styles.energyColLabel}>Yeni Hedef</Text>
              <Text style={[styles.energyColVal, { color: '#34d399' }]}>
                {adaptiveEnergy.adaptedTargetCalories} kcal
              </Text>
            </View>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationText}>💡 {adaptiveEnergy.recommendationNote}</Text>
          </View>
        </View>

        {/* 3. Kilo Eğilimi (Weight Trend / Dalgalanma Filtresi) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>📊 Kilo Eğilimi (Trend)</Text>
            {latestTrend && (
              <View style={styles.trendBadge}>
                <Text style={styles.trendBadgeText}>Trend: {latestTrend.trendWeight} kg</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardSubtitle}>
            Su ve tuz tutumundan kaynaklanan günlük iniş çıkışları filtreleyen gerçek kilo eğilimin:
          </Text>

          <View style={styles.trendList}>
            {weightTrends.map(item => (
              <View key={item.date} style={styles.trendItemRow}>
                <Text style={styles.trendDate}>{item.date}</Text>
                <View style={styles.trendValues}>
                  <Text style={styles.actualWText}>Tartı: {item.actualWeight}kg</Text>
                  <Text style={styles.trendWText}>Eğilim: {item.trendWeight}kg</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 4. Dönemsel Beslenme Özetleri (7 Gün vs 30 Gün) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>📅 Dönemsel Özet</Text>
            <View style={styles.periodToggleRow}>
              <TouchableOpacity
                style={[styles.periodBtn, period === 7 && styles.periodBtnActive]}
                onPress={() => setPeriod(7)}
              >
                <Text style={[styles.periodBtnText, period === 7 && styles.periodBtnTextActive]}>
                  7 Gün
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, period === 30 && styles.periodBtnActive]}
                onPress={() => setPeriod(30)}
              >
                <Text style={[styles.periodBtnText, period === 30 && styles.periodBtnTextActive]}>
                  30 Gün
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.summaryStatsGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.sumLabel}>Günlük Ort. Kalori</Text>
              <Text style={styles.sumVal}>{summary.averageDailyCalories} kcal</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.sumLabel}>Veri Doluluk Oranı</Text>
              <Text style={styles.sumVal}>%{summary.dataCompletenessPercent}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.sumLabel}>Ortalama Protein</Text>
              <Text style={[styles.sumVal, { color: '#38bdf8' }]}>{summary.averageProtein}g</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.sumLabel}>Kilo Değişimi</Text>
              <Text style={[styles.sumVal, { color: '#34d399' }]}>
                {summary.weightChangeKg !== null ? `${summary.weightChangeKg} kg` : '--'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerBox: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  cardSuccessBorder: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  cardWarningBorder: {
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#94a3b8',
    marginBottom: 14,
    lineHeight: 17,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeHigh: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  badgeLow: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  confidenceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  predictionSuccessBox: {
    backgroundColor: 'rgba(11, 15, 25, 0.7)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  targetDateText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#34d399',
    marginBottom: 4,
  },
  predictionDetailsText: {
    fontSize: 12.5,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 18,
  },
  intervalBox: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intervalText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  predictionWarningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 14,
    padding: 14,
  },
  warningMessageText: {
    fontSize: 13,
    color: '#fde68a',
    lineHeight: 18,
    fontWeight: '600',
  },
  warningSubText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 6,
  },
  energyComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.7)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  energyCol: {
    alignItems: 'center',
  },
  energyColLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  energyColVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  arrowIcon: {
    color: '#475569',
    fontSize: 14,
  },
  recommendationBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  recommendationText: {
    fontSize: 12,
    color: '#fbcfe8',
    lineHeight: 17,
  },
  trendBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  trendList: {
    gap: 8,
  },
  trendItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(11, 15, 25, 0.6)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  trendDate: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  trendValues: {
    flexDirection: 'row',
    gap: 12,
  },
  actualWText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  trendWText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  periodToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderRadius: 10,
    padding: 2,
  },
  periodBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  periodBtnActive: {
    backgroundColor: '#f43f5e',
  },
  periodBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  periodBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(11, 15, 25, 0.7)',
    borderRadius: 12,
    padding: 12,
  },
  sumLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  sumVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
});
