# ⚡ FitPulse • Akıllı & Metabolizma Dostu Kilo Takip Platformu

FitPulse, özellikle crash diyetlerin (şok açlık diyetleri) önüne geçmek, kadın ve erkek metabolizma dinamiklerini korumak ve güvenli kalori açığı ile sürdürülebilir kilo kaybı sağlamak için geliştirilmiş yeni nesil bir sağlık ekosistemidir.

---

## 🌟 Öne Çıkan Özellikler

- **Metabolizma Koruma & Crash Diet Algoritması:** BMR (Bazal Metabolizma Hızı) altındaki tehlikeli kalori açıklarını tespit eder ve kullanıcıyı uyarır.
- **Canlı Supabase Entegrasyonu:** PostgreSQL tabanlı çok kullanıcılı güvenli mimari (`profiles`, `weight_logs`, `meal_logs`, `notifications`).
- **Koç & Admin Paneli:** Danışanların hedeflerini, güncel kilolarını, kalori dengelerini anlık izleme ve tek tıkla motivasyon/uyarı bildirimi gönderme.
- **Expo Mobil Uygulama:** React Native ve TypeScript ile geliştirilmiş, cebinizde taşıyabileceğiniz mobil deneyim.
- **Masaüstü Kolay Başlatıcılar:** `.bat` dosyaları ile tek tıkla web, admin veya mobil geliştirme ortamını açma.

---

## 📂 Proje Mimarisi

```
Diyet/
├── AGENTS.md                          # Nova'nın yapay zekâ hafızası ve proje kılavuzu
├── Admin_Panelini_Baslat.bat          # Koç & Admin Dashboard başlatıcı
├── Uygulamayı_Baslat.bat              # Web danışan paneli başlatıcı
├── Mobilyi_Baslat.bat                 # Expo mobil geliştirme başlatıcı
├── index.html / app.js / style.css    # Web istemci ön yüzü
├── admin.html / admin.js / admin.css  # Koç & Admin yönetim paneli
├── supabase/
│   └── schema.sql                     # Veritabanı şeması & RLS güvenlik kuralları
└── mobile/                            # React Native (Expo) mobil uygulaması
    ├── src/screens/                   # Ekranlar (Home, Profile, Auth vb.)
    ├── src/services/                  # Supabase ve API servisleri
    └── App.tsx
```

---

## 🚀 Hızlı Başlangıç

### 1. Web & Admin Paneli
- Danışan paneli için: `Uygulamayı_Baslat.bat`
- Koç paneli için: `Admin_Panelini_Baslat.bat`

### 2. Mobil Uygulama (Expo)
```bash
cd mobile
npm install
npx expo start --clear
```

### 3. Veritabanı (Supabase)
`supabase/schema.sql` dosyasındaki SQL kodlarını Supabase SQL Editor'de çalıştırarak tabloları ve RLS politikalarını anında aktif edebilirsiniz.

---

© 2026 FitPulse • Geliştirici: Alperen Kaban | Yapay Zekâ Ortağı: Nova