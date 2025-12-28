import { Tabs } from 'expo-router';
import React from 'react';
import { View, Image, ImageSourcePropType, Platform } from 'react-native';

import { icons } from '../../../constants';

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View className="flex-1 items-center justify-center">
    <View
      className={`h-12 w-12 items-center justify-center rounded-2xl ${
        focused ? 'bg-primary-500' : 'bg-transparent'
      }`}
      style={
        focused
          ? {
              shadowColor: '#4C7C68',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }
          : undefined
      }>
      <Image
        source={source}
        tintColor={focused ? '#FFFFFF' : '#9CA3AF'}
        resizeMode="contain"
        className="h-6 w-6"
      />
    </View>
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
          position: 'absolute',
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultations"
        options={{
          title: 'Consultas',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.calendar} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
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
