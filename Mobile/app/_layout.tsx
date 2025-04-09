import { View, ActivityIndicator, StatusBar, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store'; // adjust the path based on your folder structure

export default function RootLayout() {
  const isDarkMode = useColorScheme() === 'dark';

  const loadAuthData = useAuthStore((state) => state.loadAuthData);
  // const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    loadAuthData(); // Load user + token from AsyncStorage
  }, []);

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" color="#000" />
  //     </View>
  //   );
  // }

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
