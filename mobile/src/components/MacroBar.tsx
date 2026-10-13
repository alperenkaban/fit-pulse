import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MacroBarProps {
  totalCalories: number;
  targetCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export const MacroBar: React.FC<MacroBarProps> = ({
  totalCalories,
  targetCalories,
  totalProtein,
  totalCarbs,
  totalFat,
}) => {
  const remaining = targetCalories - totalCalories;
  const progressPercent = Math.min(100, Math.max(0, Math.round((totalCalories / targetCalories) * 100)));

  return (
    <View style={styles.card}>
      {/* Kalori Özeti */}
      <View style={styles.calRow}>
        <View>
          <Text style={styles.subText}>Alınan Kalori</Text>
          <Text style={styles.calBigText}>
            {totalCalories} <Text style={styles.calUnit}>/ {targetCalories} kcal</Text>
          </Text>
        </View>

        <View style={styles.remainingBox}>
          <Text style={styles.remainingLabel}>Kalan</Text>
          <Text style={[styles.remainingVal, remaining < 0 && { color: '#f87171' }]}>
            {remaining >= 0 ? `${remaining} kcal` : `+${Math.abs(remaining)} aşım`}
          </Text>
        </View>
      </View>

      {/* İlerleme Çubuğu */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progressPercent}%` },
            totalCalories > targetCalories && { backgroundColor: '#f87171' },
          ]}
        />
      </View>

      {/* Makro Dağılım Kartları */}
      <View style={styles.macrosRow}>
        <View style={[styles.macroItem, { borderColor: 'rgba(56, 189, 248, 0.3)' }]}>
          <Text style={[styles.macroLabel, { color: '#38bdf8' }]}>Protein</Text>
          <Text style={styles.macroVal}>{totalProtein}g</Text>
        </View>

        <View style={[styles.macroItem, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
          <Text style={[styles.macroLabel, { color: '#fbbf24' }]}>Karb</Text>
          <Text style={styles.macroVal}>{totalCarbs}g</Text>
        </View>

        <View style={[styles.macroItem, { borderColor: 'rgba(244, 63, 94, 0.3)' }]}>
          <Text style={[styles.macroLabel, { color: '#fb7185' }]}>Yağ</Text>
          <Text style={styles.macroVal}>{totalFat}g</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  calRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subText: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  calBigText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  calUnit: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  remainingBox: {
    alignItems: 'flex-end',
  },
  remainingLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  remainingVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34d399',
    marginTop: 2,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f43f5e',
    borderRadius: 10,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroItem: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.6)',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  macroVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
});
