import React from 'react';
import { View, Text, Image } from 'react-native';
import { icons } from '../constants';

const steps = [
  {
    number: '1',
    title: 'Descreva seus sintomas',
    description: 'Conte-nos como você está se sentindo',
    icon: icons.document,
  },
  {
    number: '2',
    title: 'Escolha um médico',
    description: 'Encontre profissionais próximos a você',
    icon: icons.doctor,
  },
  {
    number: '3',
    title: 'Receba em casa',
    description: 'Atendimento no conforto do seu lar',
    icon: icons.home,
  },
];

export default function HowItWorksSection() {
  return (
    <View className="px-5 py-6 bg-gray-50">
      <Text className="font-JakartaBold text-lg text-gray-900 mb-4">
        Como Funciona
      </Text>

      <View className="space-y-4">
        {steps.map((step, index) => (
          <View key={step.number} className="flex-row items-start">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#4C7C68]">
              <Text className="font-JakartaBold text-lg text-white">
                {step.number}
              </Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="font-JakartaBold text-base text-gray-900">
                {step.title}
              </Text>
              <Text className="font-JakartaMedium text-sm text-gray-600 mt-0.5">
                {step.description}
              </Text>
            </View>

            <Image
              source={step.icon}
              className="h-6 w-6 mt-1"
              tintColor="#4C7C68"
            />
          </View>
        ))}
      </View>
    </View>
  );
}
