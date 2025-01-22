import { View } from 'react-native';
import { StatusBar, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView>
      <StatusBar 
        barStyle={isDarkMode ? 'dark-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#fff' : '#fff'} 
      />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
