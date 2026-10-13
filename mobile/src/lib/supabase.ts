import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase Proje Bilgileri
// Kullanıcı kendi Supabase dashboard'undan URL ve Anon Key ekleyebilir.
// Geliştirme ve test kolaylığı için varsayılan ortam değişkenleri / fallback sağlanır.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo-fitpulse.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy-anon-key-for-fitpulse-mvp';

export const isDemoConfig = !process.env.EXPO_PUBLIC_SUPABASE_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
