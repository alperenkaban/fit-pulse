import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { calculateBMR, calculateTDEE } from '../services/calculator';
import { Gender } from '../types';

export const OnboardingScreen: React.FC = () => {
  const { profile, saveProfile, loading } = useAuth();

  const [gender, setGender] = useState<Gender>('female');
  const [age, setAge] = useState('24');
  const [height, setHeight] = useState('165');
  const [startWeight, setStartWeight] = useState('64.0');
  const [targetWeight, setTargetWeight] = useState('56.0');
  const [activity, setActivity] = useState(1.375);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Anlık BMR & TDEE Önizlemesi
  const previewMetrics = useMemo(() => {
    const w = parseFloat(startWeight) || 60;
    const h = parseFloat(height) || 165;
    const a = parseInt(age, 10) || 24;
    const bmr = calculateBMR(w, h, a, gender);
    const tdee = calculateTDEE(bmr, activity);
    return { bmr, tdee };
  }, [gender, age, height, startWeight, activity]);

  const handleComplete = async () => {
    setErrorMsg(null);
    const hNum = parseFloat(height);
    const swNum = parseFloat(startWeight);
    const twNum = parseFloat(targetWeight);
    const aNum = parseInt(age, 10);

    if (!hNum || !swNum || !twNum || !aNum) {
      setErrorMsg('Lütfen tüm değerleri geçerli sayılarla doldurun.');
      return;
    }

    if (twNum >= swNum) {
      setErrorMsg('Hedef kilo başlangıç kilosundan düşük olmalıdır (Kilo verme hedefi).');
      return;
    }

    const res = await saveProfile({
      full_name: profile?.full_name || 'Kullanıcı',
      gender,
      birth_date: `${2026 - aNum}-01-01`,
      age: aNum,
      height_cm: hNum,
      start_weight_kg: swNum,
      current_weight_kg: swNum,
      target_weight_kg: twNum,
      activity_level: activity,
      daily_calorie_target: previewMetrics.tdee - 450,
    });

    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBox}>
          <Text style={styles.badge}>Adım 1: Kurulum & Metabolizma</Text>
          <Text style={styles.title}>Seni Tanıyalım ✨</Text>
          <Text style={styles.subtitle}>
            Aç kalarak değil, metabolizmanı yakıtlayarak sağlıklı kalıcı fitliğe ulaşacağız.
          </Text>
        </View>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </View>
        )}

        <View style={styles.card}>
          {/* Cinsiyet */}
          <Text style={styles.label}>Cinsiyet</Text>
          <View style={styles.radioRow}>
            <TouchableOpacity
              style={[styles.radioBtn, gender === 'female' && styles.radioBtnActive]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.radioText, gender === 'female' && styles.radioTextActive]}>
                Kadın
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioBtn, gender === 'male' && styles.radioBtnActive]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.radioText, gender === 'male' && styles.radioTextActive]}>
                Erkek
              </Text>
            </TouchableOpacity>
          </View>

          {/* Yaş & Boy */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Yaş</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder="24"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Boy (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder="165"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          {/* Güncel Kilo & Hedef Kilo */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Güncel Kilo (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={startWeight}
                onChangeText={setStartWeight}
                placeholder="64.0"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Hedef Kilo (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={targetWeight}
                onChangeText={setTargetWeight}
                placeholder="56.0"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          {/* İş & Aktivite Seviyesi */}
          <Text style={styles.label}>Nasıl Bir İşte Çalışıyorsun?</Text>
          <View style={styles.activityOptions}>
            {[
              { val: 1.2, title: '🛋️ Masa Başı / Hareketsiz', desc: 'Ofis, evden çalışma' },
              { val: 1.375, title: '🚶‍♀️ Hafif Hareketli', desc: 'Öğretmen, satış, hafif tempo' },
              { val: 1.55, title: '🏃‍♀️ Orta Hareketli', desc: 'Sürekli ayakta, 3-4 gün spor' },
              { val: 1.725, title: '⚡ Çok Hareketli', desc: 'Ağır iş veya yoğun antrenman' },
            ].map(item => (
              <TouchableOpacity
                key={item.val}
                style={[styles.activityCard, activity === item.val && styles.activityCardActive]}
                onPress={() => setActivity(item.val)}
              >
                <Text style={[styles.actTitle, activity === item.val && styles.actTitleActive]}>
                  {item.title}
                </Text>
                <Text style={styles.actDesc}>{item.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dinamik Canlı Hesaplama Önizlemesi */}
          <View style={styles.previewBox}>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Bazal Metabolizma (BMR)</Text>
              <Text style={styles.previewVal}>{previewMetrics.bmr} kcal</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Günlük Harcama (TDEE)</Text>
              <Text style={styles.previewVal}>{previewMetrics.tdee} kcal</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Metabolizma Planımı Başlat 🚀</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerBox: {
    marginBottom: 20,
  },
  badge: {
    color: '#f472b6',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  radioBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  radioBtnActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#f43f5e',
  },
  radioText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  radioTextActive: {
    color: '#f472b6',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 15,
  },
  activityOptions: {
    gap: 8,
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: 'rgba(11, 15, 25, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
  },
  activityCardActive: {
    borderColor: '#f43f5e',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  actTitleActive: {
    color: '#f472b6',
  },
  actDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  previewBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    alignItems: 'center',
  },
  previewItem: {
    flex: 1,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  previewVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34d399',
    marginTop: 2,
  },
  previewDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitBtn: {
    backgroundColor: '#f43f5e',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
