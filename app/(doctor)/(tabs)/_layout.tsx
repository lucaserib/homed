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
    className={`flex flex-row items-center justify-center rounded-full px-4 py-2 ${
      focused ? 'bg-primary-500' : ''
    }`}>
    <View
      className={`items-center justify-center rounded-full ${
        focused ? 'bg-primary-600' : 'bg-transparent'
      }`}>
      <Image
        source={source}
        tintColor={focused ? 'white' : '#8E8E93'}
        resizeMode="contain"
        className="h-6 w-6"
      />
    </View>
    {focused && (
      <Text className="ml-2 font-JakartaSemiBold text-xs text-white">{name}</Text>
    )}
  </View>
);

export default function Layout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderRadius: 50,
          paddingBottom: 0,
          overflow: 'hidden',
          marginHorizontal: 20,
          marginBottom: 20,
          height: 70,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          position: 'absolute',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
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
