import 'react-native-get-random-values' 

import { StatusBar, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import * as SystemUI from 'expo-system-ui';

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

  useEffect(() => {
    // Make the Android window background white so the system navigation bar
    // area (below the tab bar) never shows as black.
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('#ffffff')
    }
  }, [])

  return (
<<<<<<< HEAD
     <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Stack screenOptions={{ headerShown: false }} />
=======
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <Stack screenOptions={{ headerShown: false }} />
>>>>>>> 5657544 (bumb v-10)
    </GestureHandlerRootView>
  )
}