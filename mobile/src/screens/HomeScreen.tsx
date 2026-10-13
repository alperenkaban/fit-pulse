import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { isDemoConfig, supabase } from '../lib/supabase';
import { calculateMetabolismMetrics, runBmrTdeeVerificationTests } from '../services/calculator';

interface HomeScreenProps {
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenSettings }) => {
  const { profile, saveProfile } = useAuth();
  const [newWeightInput, setNewWeightInput] = useState('');
  const [calorieInput, setCalorieInput] = useState('');
  const [loggedCalories, setLoggedCalories] = useState<number | undefined>(undefined);
  const [verificationResults, setVerificationResults] = useState<string[] | null>(null);
  const [coachNotification, setCoachNotification] = useState<{ id: string; title: string; message: string } | null>(null);

  useEffect(() => {
    fetchCoachNotification();
  }, [profile]);

  const fetchCoachNotification = async () => {
    if (!profile) return;
    try {
      if (!isDemoConfig) {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          setCoachNotification(data[0]);
        }
      }
    } catch (e) {}
  };

  const handleDismissCoachNotification = async () => {
    if (coachNotification && !isDemoConfig) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', coachNotification.id);
    }
    setCoachNotification(null);
  };

  const metrics = useMemo(() => {
    if (!profile) return null;
    return calculateMetabolismMetrics(profile, loggedCalories);
  }, [profile, loggedCalories]);

  if (!profile || !metrics) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#fff' }}>Yükleniyor...</Text>
      </View>
    );
  }

  // Yeni tartı kilosu kaydetme
  const handleUpdateWeight = async () => {
    const val = parseFloat(newWeightInput);
    if (!val || val < 30 || val > 300) {
      Alert.alert('Geçersiz Kilo', 'Lütfen geçerli bir kilo değeri girin (30 - 300 kg).');
      return;
    }

    await saveProfile({
      current_weight_kg: val,
    });
    setNewWeightInput('');
    Alert.alert('Harika! 🌟', `Güncel kilon ${val} kg olarak güncellendi. Yeni Bazal Metabolizman ve kalan süren anında yeniden hesaplandı!`);
  };

  // Günlük kalori kaydetme & Crash-Diet kontrolü
  const handleSaveCalories = () => {
    const cal = parseInt(calorieInput, 10);
    if (isNaN(cal) || cal <= 0) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir kalori değeri girin.');
      return;
    }
    setLoggedCalories(cal);
    setCalorieInput('');
  };

  // BMR/TDEE Birim Testlerini Çalıştırma
  const handleRunTests = () => {
    const res = runBmrTdeeVerificationTests();
    setVerificationResults(res.results);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greeting}>Merhaba, {profile.full_name}! ✨</Text>
            <View style={styles.healthStatusBadge}>
              <Text style={styles.healthStatusBadgeText}>🛡️ Bilimsel Metabolizma & Form Takibi</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={onOpenSettings}>
            <Text style={styles.settingsBtnText}>⚙️ Profil</Text>
          </TouchableOpacity>
        </View>

        {/* Koçtan Gelen Bildirim Kartı */}
        {coachNotification && (
          <View style={styles.coachNotifCard}>
            <View style={styles.coachNotifHeader}>
              <Text style={styles.coachNotifTitle}>{coachNotification.title}</Text>
              <TouchableOpacity onPress={handleDismissCoachNotification}>
                <Text style={styles.coachNotifClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.coachNotifMsg}>{coachNotification.message}</Text>
          </View>
        )}

        {/* Düşük Kalori Uyarısı Kalkanı */}
        {metrics.isCrashDiet && (
          <View style={styles.dangerAlertBox}>
            <Text style={styles.dangerTitle}>🚨 DİKKAT: YETERSİZ KALORİ UYARISI!</Text>
            <Text style={styles.dangerText}>{metrics.crashDietWarningMessage}</Text>
          </View>
        )}

        {/* Hero Quick Stats (Kilo & Tahmini Kalan Süre) */}
        <View style={styles.heroCard}>
          <Text style={styles.heroQuote}>
            "Metabolizmanı dengeli besinlerle yakıtla ki yağları yaksın. Bugün enerjik bir gün olsun."
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Başlangıç</Text>
              <Text style={styles.statVal}>{profile.start_weight_kg} kg</Text>
            </View>
            <Text style={styles.statArrow}>➔</Text>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Son Ölçülen</Text>
              <Text style={[styles.statVal, { color: '#f472b6' }]}>{profile.current_weight_kg} kg</Text>
            </View>
            <Text style={styles.statArrow}>➔</Text>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Hedef</Text>
              <Text style={styles.statVal}>{profile.target_weight_kg} kg</Text>
            </View>
          </View>

          <View style={styles.etaBox}>
            <View>
              <Text style={styles.etaLabel}>Hedefe Kalan</Text>
              <Text style={styles.etaVal}>{metrics.remainingWeightKg} kg</Text>
            </View>
            <View style={styles.etaDivider} />
            <View>
              <Text style={styles.etaLabel}>Tahmini Süre (ETA)</Text>
              <Text style={[styles.etaVal, { color: '#34d399' }]}>
                {metrics.etaDays} gün (~{metrics.etaWeeks} hafta)
              </Text>
            </View>
          </View>
        </View>

        {/* Metabolizma Metrikleri (BMR, TDEE, Hedef Kalori) */}
        <Text style={styles.sectionTitle}>Metabolizma & Enerji İhtiyacı</Text>
        <View style={styles.metricsGrid}>
          {/* BMR */}
          <View style={styles.metricCard}>
            <Text style={styles.metricBadge}>⚡ BAZAL METABOLİZMA</Text>
            <Text style={styles.metricNumber}>{metrics.bmr} <Text style={styles.unit}>kcal/gün</Text></Text>
            <Text style={styles.metricDesc}>Organlarının yaşaması için gereken minimum enerji. Altına düşülmez!</Text>
          </View>

          {/* TDEE */}
          <View style={styles.metricCard}>
            <Text style={[styles.metricBadge, { color: '#fbbf24' }]}>🔥 GÜNLÜK HARCAMA (TDEE)</Text>
            <Text style={styles.metricNumber}>{metrics.tdee} <Text style={styles.unit}>kcal/gün</Text></Text>
            <Text style={styles.metricDesc}>İş ve hareket temponla yaktığın toplam enerji.</Text>
          </View>

          {/* Önerilen Kalori */}
          <View style={[styles.metricCard, styles.metricCardHighlight]}>
            <Text style={[styles.metricBadge, { color: '#34d399' }]}>🍏 ÖNERİLEN HEDEF KALORİ</Text>
            <Text style={[styles.metricNumber, { color: '#34d399' }]}>
              {metrics.healthyTarget} <Text style={styles.unit}>kcal/gün</Text>
            </Text>
            <Text style={styles.metricDesc}>Aç kalmadan yağ yaktıran, ayda ~2 kg net kayıp sağlayan altın hedef.</Text>
          </View>
        </View>

        {/* Hızlı Kilo & Kalori Güncelleme */}
        <View style={styles.actionCard}>
          <Text style={styles.cardHeaderTitle}>Tartı & Günlük Kalori Girişi</Text>

          {/* Tartı Kilosu */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.flexInput}
              placeholder="Yeni tartı sonucu (Örn: 63.2)"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={newWeightInput}
              onChangeText={setNewWeightInput}
            />
            <TouchableOpacity style={styles.btnSmall} onPress={handleUpdateWeight}>
              <Text style={styles.btnSmallText}>Kilo Kaydet</Text>
            </TouchableOpacity>
          </View>

          {/* Kalori Girişi */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.flexInput}
              placeholder="Bugün aldığın kalori (Örn: 1500)"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={calorieInput}
              onChangeText={setCalorieInput}
            />
            <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#8b5cf6' }]} onPress={handleSaveCalories}>
              <Text style={styles.btnSmallText}>Kalori Testi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MVP Kabul Kontrolü & Test Doğrulama Paneli */}
        <View style={styles.testPanelCard}>
          <Text style={styles.cardHeaderTitle}>MVP Kabul Testleri (Faz 1 Doğrulama)</Text>
          <Text style={styles.testDesc}>
            BMR ve TDEE formüllerinin bilinen test vakaları ve sınır değerleriyle doğrulanması:
          </Text>
          <TouchableOpacity style={styles.runTestBtn} onPress={handleRunTests}>
            <Text style={styles.runTestBtnText}>🧪 Birim Testlerini Çalıştır</Text>
          </TouchableOpacity>

          {verificationResults && (
            <View style={styles.resultsBox}>
              {verificationResults.map((msg, idx) => (
                <Text key={idx} style={styles.resultLine}>{msg}</Text>
              ))}
            </View>
          )}
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  healthStatusBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  healthStatusBadgeText: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '700',
  },
  settingsBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  settingsBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  dangerAlertBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  dangerTitle: {
    color: '#fecaca',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  dangerText: {
    color: '#fca5a5',
    fontSize: 12.5,
    lineHeight: 18,
  },
  coachNotifCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.22)',
    borderColor: 'rgba(99, 102, 241, 0.45)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  coachNotifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  coachNotifTitle: {
    color: '#c7d2fe',
    fontSize: 14,
    fontWeight: '700',
  },
  coachNotifClose: {
    color: '#94a3b8',
    fontSize: 16,
    paddingHorizontal: 6,
  },
  coachNotifMsg: {
    color: '#f8fafc',
    fontSize: 13.5,
    lineHeight: 19,
  },
  heroCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  heroQuote: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  statArrow: {
    color: '#475569',
    fontSize: 14,
  },
  etaBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  etaVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  etaDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.75)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricCardHighlight: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  metricBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c084fc',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  unit: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  metricDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 16,
  },
  actionCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  flexInput: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 14,
  },
  btnSmall: {
    backgroundColor: '#f43f5e',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },
  btnSmallText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  testPanelCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.65)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  testDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  runTestBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  runTestBtnText: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 13,
  },
  resultsBox: {
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  resultLine: {
    fontSize: 12,
    color: '#e2e8f0',
  },
});
