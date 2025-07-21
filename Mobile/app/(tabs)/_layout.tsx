import React from 'react';
import {SafeAreaView,View,Image ,Text} from "react-native";
import { Tabs } from 'expo-router';
import { Platform } from "react-native";
import Wishlist from './Wishlist'
import index from '.'
import Menu from "./Menu";
import Trips from './Trips';
import Booking from './Booking';

import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
export default function Layout() {
  return (
    <Tabs
  screenOptions={{
    headerShown: false,
    tabBarHideOnKeyboard: true,
    tabBarStyle: {
      height: 50,
      borderTopWidth: 0,
      elevation:  Platform.OS === "android" ? 5 : 0,
      shadowOpacity: Platform.OS === "ios" ? 0.15 : 0,
      shadowOffset: Platform.OS === "ios" ? { width: 0, height: -4 } : undefined,
      shadowColor: Platform.OS === "ios" ? "#000" : undefined,
      position: "absolute",
      bottom: Platform.OS === "ios" ? 10 : 0,  
      left: 0,
      right: 0,
      borderRadius: Platform.OS === "ios" ? 16 : 0,
      backgroundColor: "#fff", 
    },
    tabBarActiveTintColor: "orange",
    tabBarInactiveTintColor: "gray",
    tabBarLabelStyle: { fontSize: 11 },
  }}
>
      
      <Tabs.Screen name="index"    options={{title:"Explore" , tabBarIcon:({color})=><Ionicons name='search' color={color} size={28} />, tabBarLabelStyle:{fontSize:11}}}/>
      <Tabs.Screen name="Wishlist" options={{title:"Wishlist",tabBarIcon:({color})=><Feather  name='heart' color={color} size={28} />, tabBarLabelStyle:{fontSize:11}}}/>
      <Tabs.Screen name="Booking" options={{title:"Booking",tabBarIcon:({color})=><Image source={{uri:"https://www.vacationsaga.com/_next/static/media/logo1.fe6fe7c4.png"}} style={{width:28,height:28}} /> , tabBarLabelStyle:{fontSize:11}}}/>
      <Tabs.Screen name="Trips" options={{title:"Map",tabBarIcon:({color})=><Ionicons name='map-outline' color={color} size={28} />, tabBarLabelStyle:{fontSize:11}}}/>
      <Tabs.Screen name="Menu" options={{title:"Menu",tabBarIcon:({color})=><Ionicons name='menu' color={color} size={28} />, tabBarLabelStyle:{fontSize:11}}}/>
    </Tabs>
  );
}