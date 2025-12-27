import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { icons } from '../constants';

interface QuickActionCardProps {
  onPress: () => void;
}

export default function QuickActionCard({ onPress }: QuickActionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mx-6 -mt-8"
      activeOpacity={0.9}>
      <LinearGradient
        colors={['#4C7C68', '#3D6353']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl p-6"
        style={{
          shadowColor: '#4C7C68',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        }}>
        <View className="flex-row items-center justify-between">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <Image source={icons.doctor} className="h-9 w-9" tintColor="white" />
          </View>

          <View className="mx-4 flex-1">
            <Text className="font-JakartaBold text-xl text-white">
              Solicitar Atendimento
            </Text>
            <Text className="font-JakartaMedium text-sm text-white/80 mt-1">
              Médico na sua casa agora
            </Text>
          </View>

          <View
            className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Image source={icons.plus} className="h-6 w-6" tintColor="white" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
