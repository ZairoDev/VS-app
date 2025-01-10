import {View} from 'react-native'
import { StatusBar, useColorScheme } from 'react-native';

// Inside your component:

import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Slot } from 'expo-router'
export default function _layout() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <GestureHandlerRootView>
        <StatusBar barStyle="dark-content" backgroundColor="white"    />
        <Slot/>
    </GestureHandlerRootView>
  )
}

