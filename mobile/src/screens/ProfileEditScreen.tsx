import React, { useState } from 'react';
import {
  ActivityIndicator,
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

interface ProfileEditScreenProps {
  onClose: () => void;
}

export const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ onClose }) => {
  const { profile, saveProfile, signOut, deleteAccount, loading } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [height, setHeight] = useState(String(profile?.height_cm || '165'));
  const [targetWeight, setTargetWeight] = useState(String(profile?.target_weight_kg || '56'));
  const [activity, setActivity] = useState(profile?.activity_level || 1.375);

  const handleSave = async () => {
    const h = parseFloat(height);
    const tw = parseFloat(targetWeight);
    if (!h || !tw) {
      Alert.alert('Hata', 'Lütfen geçerli boy ve hedef kilo girin.');
      return;
    }

    const res = await saveProfile({
      full_name: fullName.trim() || profile?.full_name,
      height_cm: h,
      target_weight_kg: tw,
      activity_level: activity,
    });

    if (res.error) {
      Alert.alert('Hata', res.error);
    } else {
      Alert.alert('Başarılı! ✨', 'Profilin güncellendi.');
      onClose();
    }
  };

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Oturumunu kapatmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Kalıcı Olarak Sil',
      'Bu işlem geri alınamaz. Tüm profilin, kilo geçmişin ve hedeflerin veritabanından kalıcı olarak silinecektir.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Evet, Hesabımı Sil', style: 'destructive', onPress: deleteAccount },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>⚙️ Profil & Hedefler</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Kapat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor="#64748b"
          />

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Boy (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Hedef Kilo (kg)</Text>
              <TextInput
                style={styles.input}
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          <Text style={styles.label}>İş & Günlük Hareket Seviyesi</Text>
          <View style={styles.activityGrid}>
            {[
              { val: 1.2, title: '🛋️ Masa Başı (1.2)' },
              { val: 1.375, title: '🚶‍♀️ Hafif Hareket (1.375)' },
              { val: 1.55, title: '🏃‍♀️ Orta Hareket (1.55)' },
              { val: 1.725, title: '⚡ Çok Hareketli (1.725)' },
            ].map(item => (
              <TouchableOpacity
                key={item.val}
                style={[styles.actBtn, activity === item.val && styles.actBtnActive]}
                onPress={() => setActivity(item.val)}
              >
                <Text style={[styles.actBtnText, activity === item.val && styles.actBtnTextActive]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Güvenlik & Hesap Yönetimi (Kabul Kriterleri) */}
        <View style={styles.dangerZoneCard}>
          <Text style={styles.dangerSectionTitle}>Oturum & Güvenlik Politikası</Text>

          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutBtnText}>🚪 Oturumu Kapat (Çıkış Yap)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Text style={styles.deleteBtnText}>🗑️ Hesabı ve Tüm Verileri Sil</Text>
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  closeBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
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
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 14,
  },
  activityGrid: {
    gap: 8,
    marginBottom: 18,
  },
  actBtn: {
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actBtnActive: {
    borderColor: '#f43f5e',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  actBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  actBtnTextActive: {
    color: '#f472b6',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#f43f5e',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  dangerZoneCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.65)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
  },
  signOutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  signOutBtnText: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 14,
  },
});
