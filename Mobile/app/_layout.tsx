import 'react-native-get-random-values' 

import { View, ActivityIndicator, StatusBar, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';  


export default function RootLayout() {
  let loadAuthData: () => void

  try {
    loadAuthData = useAuthStore((state) => state.loadAuthData)
  } catch (error) {
    console.warn('useAuthStore not ready yet', error)
  }

  useEffect(() => {
    loadAuthData && loadAuthData()
  }, [])

  return (
     <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  )
}