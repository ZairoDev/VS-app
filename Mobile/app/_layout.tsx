import React from 'react';
import {SafeAreaView, View } from "react-native";
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import Wishlist from './Wishlist'
import Explore from './Explore'
import Menu from "./Menu";
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
export default function Layout() {
  return (

    <Tabs  screenOptions={{headerShown: false,tabBarHideOnKeyboard:true,tabBarStyle:{height:55,borderTopWidth:0,elevation:0,shadowOpacity:0},tabBarActiveTintColor:"orange",tabBarInactiveTintColor:"gray"}}>
      <Tabs.Screen name="Explore" options={{title:"Explore" , tabBarIcon:({color})=><Ionicons name='search' color={color} size={28} />, tabBarLabelStyle:{fontSize:11}}}/>
      <Tabs.Screen name="Wishlist" options={{title:"Wishlist",tabBarIcon:({color})=><Feather  name='heart' color={color} size={28} />, tabBarLabelStyle:{fontSize:11}}}/>
      <Tabs.Screen name="Menu" options={{title:"Menu",tabBarIcon:({color})=><Ionicons name='menu' color={color} size={28} />, tabBarLabelStyle:{fontSize:11}}}/>
    </Tabs>
    
  );
}

