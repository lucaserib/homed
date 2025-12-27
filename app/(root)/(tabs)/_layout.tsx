import { Tabs } from 'expo-router';
import React from 'react';
import { View, Image, ImageSourcePropType, Text, Platform } from 'react-native';

import { icons } from '../../../constants';

const TabIcon = ({
  source,
  focused,
  label
}: {
  source: ImageSourcePropType;
  focused: boolean;
  label: string;
}) => (
  <View className="items-center justify-center gap-1">
    <View
      className={`h-10 w-10 items-center justify-center rounded-full ${
        focused ? 'bg-primary-500' : 'bg-transparent'
      }`}>
      <Image
        source={source}
        tintColor={focused ? '#FFFFFF' : '#9CA3AF'}
        resizeMode="contain"
        className="h-5 w-5"
      />
    </View>
    <Text
      className={`text-[10px] font-JakartaSemiBold ${
        focused ? 'text-primary-500' : 'text-gray-400'
      }`}>
      {label}
    </Text>
  </View>
);

export default function Layout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: '#4C7C68',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} label="Início" />
          ),
        }}
      />
      <Tabs.Screen
        name="consultations"
        options={{
          title: 'Consultas',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.doctor} focused={focused} label="Consultas" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} label="Perfil" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // Oculta da tab bar
        }}
      />
    </Tabs>
  );
}
