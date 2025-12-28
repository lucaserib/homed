import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { icons } from '../constants';

interface HomeHeaderProps {
  userName: string;
  onSignOut: () => void;
}

export default function HomeHeader({ userName, onSignOut }: HomeHeaderProps) {
  return (
    <View className="bg-primary-500 rounded-3xl px-6 py-6 shadow-lg shadow-black/15" style={{ elevation: 8 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-JakartaMedium text-sm text-white/90">Olá, bem-vindo</Text>
          <Text className="mt-1 font-JakartaBold text-2xl capitalize text-white" numberOfLines={1}>
            {userName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onSignOut}
          activeOpacity={0.7}
          className="h-12 w-12 items-center justify-center rounded-full bg-white/20 ml-3">
          <Image source={icons.out} className="h-5 w-5" tintColor="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
