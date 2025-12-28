import { Tabs } from 'expo-router';
import { Image, ImageSourcePropType, View, Text } from 'react-native';

import { icons } from '../../../constants';

const TabIcon = ({
  source,
  focused,
  name,
}: {
  source: ImageSourcePropType;
  focused: boolean;
  name: string;
}) => (
  <View
    className={`flex flex-row items-center justify-center rounded-full px-5 py-2.5 ${
      focused ? 'bg-primary-500' : ''
    }`}
    style={
      focused
        ? {
            shadowColor: '#4C7C68',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
          }
        : undefined
    }>
    <Image
      source={source}
      tintColor={focused ? 'white' : '#6B7280'}
      resizeMode="contain"
      className="h-5 w-5"
    />
    {focused && (
      <Text className="ml-2 font-JakartaBold text-xs text-white">{name}</Text>
    )}
  </View>
);

export default function Layout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderRadius: 28,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginHorizontal: 20,
          marginBottom: 24,
          height: 68,
          position: 'absolute',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 12,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} name="Início" />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} focused={focused} name="Histórico" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} name="Perfil" />
          ),
        }}
      />
    </Tabs>
  );
}
