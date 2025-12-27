import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { icons } from '../constants';

interface HomeHeaderProps {
  userName: string;
  onSignOut: () => void;
}

export default function HomeHeader({ userName, onSignOut }: HomeHeaderProps) {
  return (
    <View className="mt-20pt-2 bg-primary-500 px-5 pb-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-JakartaMedium text-sm text-white/80">Olá, bem-vindo</Text>
          <Text className="mt-1 font-JakartaBold text-2xl capitalize text-white">{userName}</Text>
        </View>

        <TouchableOpacity
          onPress={onSignOut}
          activeOpacity={0.8}
          className="h-11 w-11 items-center justify-center rounded-xl bg-white/20">
          <Image source={icons.out} className="h-5 w-5" tintColor="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
