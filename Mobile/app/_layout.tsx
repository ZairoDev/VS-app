import {View} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Slot } from 'expo-router'
export default function _layout() {
  return (
    <GestureHandlerRootView>
        <Slot/>
    </GestureHandlerRootView>
  )
}

