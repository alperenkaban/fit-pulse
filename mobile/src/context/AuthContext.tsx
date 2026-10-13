import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { isDemoConfig, supabase } from '../lib/supabase';
import { calculateAge } from '../services/calculator';
import { UserProfile } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  isOnboarded: boolean;
  signUp: (email: string, pass: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  saveProfile: (p: Partial<UserProfile>) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const LOCAL_STORAGE_KEY = '@fitpulse_mock_profile';
const LOCAL_SESSION_KEY = '@fitpulse_mock_session';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      if (!isDemoConfig) {
        // Canlı Supabase Oturum Kontrolü
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          await fetchSupabaseProfile(session.user.id);
        }
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            await fetchSupabaseProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        });
      } else {
        // Yerel Test / Offline-First Modu (AsyncStorage)
        const savedSession = await AsyncStorage.getItem(LOCAL_SESSION_KEY);
        const savedProfile = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSession) {
          setUser(JSON.parse(savedSession));
        }
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      }
    } catch (e) {
      console.error('Oturum başlatma hatası:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupabaseProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data && !error) {
        setProfile(data as UserProfile);
      }
    } catch (e) {
      console.error('Profil çekme hatası:', e);
    }
  };

  const signUp = async (email: string, pass: string, name: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      if (!isDemoConfig) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { full_name: name } },
        });
        if (error) return { error: error.message };
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
        }
        return { error: null };
      } else {
        // Yerel simülasyon
        const mockUser = { id: 'usr_' + Date.now(), email };
        await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
        return { error: null };
      }
    } catch (err: any) {
      return { error: err.message || 'Kayıt sırasında hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      if (!isDemoConfig) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) return { error: error.message };
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          await fetchSupabaseProfile(data.user.id);
        }
        return { error: null };
      } else {
        // Yerel simülasyon
        const mockUser = { id: 'usr_local', email };
        await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
        const savedProfile = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
        return { error: null };
      }
    } catch (err: any) {
      return { error: err.message || 'Giriş yapılamadı' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (!isDemoConfig) {
        await supabase.auth.signOut();
      }
      await AsyncStorage.removeItem(LOCAL_SESSION_KEY);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (p: Partial<UserProfile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Oturum bulunamadı' };
    setLoading(true);
    try {
      const birthDate = p.birth_date || '2000-01-01';
      const age = calculateAge(birthDate);

      const completeProfile: UserProfile = {
        id: user.id,
        email: user.email,
        full_name: p.full_name || 'Kullanıcı',
        gender: p.gender || 'female',
        birth_date: birthDate,
        age: age,
        height_cm: Number(p.height_cm || 165),
        start_weight_kg: Number(p.start_weight_kg || 65),
        current_weight_kg: Number(p.current_weight_kg || p.start_weight_kg || 65),
        target_weight_kg: Number(p.target_weight_kg || 58),
        activity_level: Number(p.activity_level || 1.375),
        daily_calorie_target: Number(p.daily_calorie_target || 1500),
        updated_at: new Date().toISOString(),
      };

      if (!isDemoConfig) {
        const { error } = await supabase
          .from('profiles')
          .upsert(completeProfile);
        if (error) return { error: error.message };
      }

      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(completeProfile));
      setProfile(completeProfile);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Profil kaydedilemedi' };
    } finally {
      setLoading(false);
    }
  };

  // Hesap Silme (GDPR / KVKK Silme Politikası)
  const deleteAccount = async (): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Oturum bulunamadı' };
    setLoading(true);
    try {
      if (!isDemoConfig) {
        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
      }
      await AsyncStorage.removeItem(LOCAL_STORAGE_KEY);
      await AsyncStorage.removeItem(LOCAL_SESSION_KEY);
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Hesap silinemedi' };
    } finally {
      setLoading(false);
    }
  };

  const isOnboarded = !!(profile && profile.height_cm && profile.target_weight_kg);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isOnboarded,
        signUp,
        signIn,
        signOut,
        saveProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
