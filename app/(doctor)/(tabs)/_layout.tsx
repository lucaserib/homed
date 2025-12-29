import { Tabs } from 'expo-router';
import { Image, ImageSourcePropType, View, Platform } from 'react-native';

import { icons } from '../../../constants';

const TabIcon = ({ source, focused }: { source: ImageSourcePropType; focused: boolean }) => (
  <View className="flex-1 items-center justify-center pt-2">
    <View
      className={`h-12 w-12 items-center justify-center rounded-2xl ${
        focused ? 'bg-primary-500' : 'bg-transparent'
      }`}
      style={
        focused
          ? {
              shadowColor: '#4C7C68',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
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
      initialRouteName="dashboard"
      screenOptions={{
        tabBarActiveTintColor: '#4C7C68',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0, // Remove a linha cinza padrão
          elevation: 10, // Sombra no Android
          height: Platform.OS === 'ios' ? 88 : 70, // Altura confortável
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          position: 'absolute', // Mantém ela sobreposta ao conteúdo
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon source={icons.home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pending"
        options={{
          title: 'Solicitações',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon source={icons.list} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon source={icons.calendar} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon source={icons.profile} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
