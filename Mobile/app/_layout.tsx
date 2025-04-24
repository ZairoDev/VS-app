import { View, ActivityIndicator, StatusBar, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store'; 

export default function RootLayout() {
  const isDarkMode = useColorScheme() === 'dark';

  const loadAuthData = useAuthStore((state) => state.loadAuthData);
  
  useEffect(() => {
    loadAuthData();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar 
        barStyle={isDarkMode ? 'dark-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#fff' : '#fff'} 
      />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
