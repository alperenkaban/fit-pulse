# FitPulse • Mobil Dağıtım & EAS Build Rehberi (FAZ 4)

Bu rehber, FitPulse uygulamasını Expo Go'dan bağımsız gerçek test cihazlarına ve mağazalara dağıtmak için gereken resmi EAS Build adımlarını içerir.

---

## 1. Geliştirme Ortamı (Expo Go)
Hızlı prototipleme ve test için:
```bash
cd mobile
npx expo start
```
Telefonundaki Expo Go uygulamasıyla QR kodu taratarak anında test edebilirsin.

---

## 2. EAS CLI Kurulumu ve Giriş
Expo Application Services (EAS) araçlarını yükle:
```bash
npm install -g eas-cli
eas login
```

Projeyi EAS ile ilişkilendir:
```bash
cd mobile
eas project:init
```

---

## 3. Test Cihazlarına Dağıtım (Preview / Internal APK Derlemesi)

Geliştirici hesabı olmadan Android cihazlara doğrudan yüklenebilir bağımsız `.apk` dosyası üretmek için:
```bash
eas build --profile preview --platform android
```
- Derleme işlemi Expo bulut sunucularında tamamlanır.
- Çıkan indirme bağlantısını veya QR kodu telefonda açıp APK'yı doğrudan kurabilirsin.
- İndirme bağlantısını doğrudan paylaşıp telefona anında kurulmasını sağlayabilirsin! 📲

---

## 4. Canlı Supabase Projesini Bağlama
Kendi Supabase projenin veritabanını bağlamak için `mobile/.env` dosyası oluştur:
```env
EXPO_PUBLIC_SUPABASE_URL=https://projeniz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=projenizin_anon_keyi
```
Ardından `supabase/schema.sql` dosyasındaki SQL sorgularını Supabase Dashboard > SQL Editor sekmesinde çalıştır.

---

## 5. Üretim & Mağaza Derlemesi (Google Play & App Store)
Resmi mağaza derlemeleri için:
```bash
# Android için AAB (Android App Bundle):
eas build --profile production --platform android

# iOS için IPA (Apple App Store / TestFlight):
eas build --profile production --platform ios
```
