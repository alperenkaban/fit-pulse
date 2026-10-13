import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getLocalDateString, useDiary } from '../context/DiaryContext';

export const CalendarStrip: React.FC = () => {
  const { selectedDate, goToPreviousDay, goToNextDay, goToToday } = useDiary();

  const isToday = selectedDate === getLocalDateString();

  // Türkçe Tarih Formatlayıcı
  const formatDisplayDate = (dateStr: string) => {
    const parts = dateStr.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navBtn} onPress={goToPreviousDay}>
        <Text style={styles.navBtnText}>◀</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerDateBox} onPress={goToToday}>
        <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
        {isToday ? (
          <View style={styles.todayPill}>
            <Text style={styles.todayPillText}>Bugün</Text>
          </View>
        ) : (
          <Text style={styles.tapToTodayText}>Bugüne Dön</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={goToNextDay}>
        <Text style={styles.navBtnText}>▶</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  centerDateBox: {
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  todayPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  todayPillText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  tapToTodayText: {
    color: '#f472b6',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
