# NOVA • FITPULSE GELİŞTİRİCİ HAFIZASI & PROJE REHBERİ
> **Son Güncelleme:** 13 Ekim 2026 | **Asistan:** Nova | **Proje Sahibi:** Alperen

---

## 📌 1. Temel Kimlik & Amaç
- **Asistan Adı:** Nova
- **Karakter:** Samimi, enerjik, çözüm odaklı, proaktif ve dikkatli yapay zekâ kodlama ortağı.
- **Proje:** **FitPulse** • Akıllı, Metabolizma Dostu Kilo & Sağlık Takip Platformu.
- **Kritik Hedef:** Kullanıcının (özellikle yakın çevresi/kız arkadaşı Selin) ölüm diyetine (crash diet) girmesini engellemek, metabolizmayı korumak, BMR altı açlıkları tespit etmek, verileri takip edebilmek ve Alperen'in koçluk panelinden motive edici/uyarıcı bildirimler gönderebilmesini sağlamak.

---

## 🗄️ 2. Veritabanı & Canlı Altyapı (Supabase)
- **Supabase URL:** `https://ufolevhtefxmtjeeqxil.supabase.co`
- **Publishable / Anon Key:** `sb_publishable_SdHTchHRadcFHQnI2TAytA_BcrFM6Fs`
- **Durum:** Veritabanı şeması ve tüm RLS politikaları SQL Editor'de başarıyla çalıştırıldı (`Success. No rows returned`).
- **Tablolar:**
  1. `public.profiles`: Kullanıcı ID, boy, yaş, cinsiyet, başlangıç/mevcut/hedef kilo, aktivite seviyesi, günlük kalori hedefi.
  2. `public.weight_logs`: Tarih bazlı kilo geçmişi ve notlar.
  3. `public.meal_logs`: Öğün tipleri (kahvaltı, öğle, akşam, ara), kalori, protein, karbonhidrat, yağ.
  4. `public.notifications`: Admin/koç paneli ve kullanıcı bildirimleri (warning, congrats, info, reminder).
- **Tetikleyici (Trigger):** `on_auth_user_created` -> Yeni kullanıcı kaydolduğunda otomatik varsayılan profil satırı üretir.
- **Güvenlik Mimarisi (RLS):** 
  - `SELECT`: Koç/Admin ve kullanıcılar için serbest okuma (`using (true)`).
  - `INSERT / UPDATE / DELETE`: Sadece ilgili kullanıcının kendi yetkisi (`auth.uid() = id` / `auth.uid() = user_id`).
  - Idempotent yapı: Tekrar çalıştırıldığında `DROP POLICY IF EXISTS` sayesinde çakışma yaşanmaz.

---

## 💻 3. Bileşenler & Başlatma Komutları
| Bileşen | Dosyalar | Başlatıcı / URL |
|---|---|---|
| **Web Ön Yüz (Danışan)** | `index.html`, `app.js`, `style.css` | `Uygulamayı_Baslat.bat` veya `http://localhost:8085/` |
| **Koç / Admin Paneli** | `admin.html`, `admin.js`, `admin.css` | `Admin_Panelini_Baslat.bat` veya `http://localhost:8085/admin.html` |
| **Mobil Uygulama (Expo)** | `mobile/` (React Native, TypeScript) | `Mobilyi_Baslat.bat` (`npx expo start --clear`) |
| **Veritabanı Şeması** | `supabase/schema.sql` | Supabase SQL Editor |

---

## 🚀 4. Tamamlanan Aşamalar & Mevcut Durum
1. **Web Dashboard:** BMR/TDEE hesaplayıcı, kilo koruma & güvenli açık hesaplama, crash diet kırmızı alarmları, bardak su takibi, koçtan gelen canlı bildirim barı tamamlandı.
2. **Koç / Admin Paneli:** Danışanların kilo, hedef ve kalori takibi, risk altındaki kullanıcılar için acil bildirim şablonları (açlık uyarısı, tebrik, su molası) ve canlı gönderim paneli tamamlandı.
3. **Expo Mobil Uygulama:** TypeScript tam uyumlu (`tsc --noEmit` 0 hata), ekranlar ve Supabase istemcisi hazırlandı.
4. **Git & GitHub:** Tüm kodlar `https://github.com/alperenkaban/fit-pulse` reposuna pushlandı.

---

## 🔮 5. Sonraki Görüşme İçin Yapılacaklar (Roadmap)
- [ ] **Mobil Uygulama Testi:** Expo Go üzerinde telefon ile test ve Supabase Auth entegrasyonu.
- [ ] **Faz 2 (Öğün & Besin Takibi):** Danışanların yediklerini eklemesi, makro hesapları ve `meal_logs` tablosuna canlı yazma.
- [ ] **Canlı Bildirim Dinleyicisi (Realtime):** Supabase Realtime ile koç mesaj attığı anda danışanın ekranında anlık toast bildirimi patlatma.
