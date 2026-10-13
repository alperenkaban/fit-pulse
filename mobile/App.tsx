import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DiaryProvider } from './src/context/DiaryContext';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { DiaryScreen } from './src/screens/DiaryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileEditScreen } from './src/screens/ProfileEditScreen';
import { RecipeAssistantScreen } from './src/screens/RecipeAssistantScreen';

type TabType = 'home' | 'diary' | 'recipes' | 'analytics';

const MainAppNavigator: React.FC = () => {
  const { user, isOnboarded, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  // 1. Giriş yapılmamışsa
  if (!user) {
    return <AuthScreen />;
  }

  // 2. Profil kurulumu tamamlanmamışsa
  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  // 3. Ayarlar / Profil düzenleme
  if (showSettings) {
    return <ProfileEditScreen onClose={() => setShowSettings(false)} />;
  }

  // 4. Ana Uygulama (4 Sekmeli Zengin Navigasyon)
  return (
    <View style={styles.screenWrapper}>
      <View style={styles.contentArea}>
        {currentTab === 'home' && (
          <HomeScreen onOpenSettings={() => setShowSettings(true)} />
        )}
        {currentTab === 'diary' && (
          <DiaryScreen />
        )}
        {currentTab === 'recipes' && (
          <RecipeAssistantScreen />
        )}
        {currentTab === 'analytics' && (
          <AnalyticsScreen />
        )}
      </View>

      {/* Alt Navigasyon Sekmeleri */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'home' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('home')}
        >
          <Text style={styles.tabIcon}>⚡</Text>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>
            Metabolizma
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'diary' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('diary')}
        >
          <Text style={styles.tabIcon}>🥗</Text>
          <Text style={[styles.tabLabel, currentTab === 'diary' && styles.tabLabelActive]}>
            Günlük
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'recipes' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('recipes')}
        >
          <Text style={styles.tabIcon}>🤖</Text>
          <Text style={[styles.tabLabel, currentTab === 'recipes' && styles.tabLabelActive]}>
            Tarif & Barkod
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'analytics' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('analytics')}
        >
          <Text style={styles.tabIcon}>📈</Text>
          <Text style={[styles.tabLabel, currentTab === 'analytics' && styles.tabLabelActive]}>
            Analiz
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <AuthProvider>
        <DiaryProvider>
          <MainAppNavigator />
        </DiaryProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  contentArea: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#131b2e',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#f43f5e',
    fontWeight: '700',
  },
});
