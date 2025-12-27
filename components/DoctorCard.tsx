import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { icons } from '../constants';

interface DoctorCardProps {
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    profileImageUrl?: string;
    rating: number;
    hourlyRate: number;
    distance: number;
    estimatedArrivalTime: number;
  };
  selected: boolean;
  onSelect: () => void;
}

export default function DoctorCard({ doctor, selected, onSelect }: DoctorCardProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      className={`mb-4 rounded-2xl border-2 bg-white p-5 ${
        selected ? 'border-primary-500' : 'border-gray-100'
      }`}
      style={{
        shadowColor: selected ? '#4C7C68' : '#000',
        shadowOffset: { width: 0, height: selected ? 4 : 2 },
        shadowOpacity: selected ? 0.15 : 0.06,
        shadowRadius: selected ? 12 : 8,
        elevation: selected ? 6 : 3,
      }}>
      {/* Selection Indicator */}
      {selected && (
        <View className="absolute -right-1 -top-1 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-500">
          <Image source={icons.checkmark} className="h-4 w-4" tintColor="white" />
        </View>
      )}

      {/* Doctor Info */}
      <View className="flex-row items-start">
        <View
          className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary-50"
          style={{
            shadowColor: '#4C7C68',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Image
            source={
              doctor.profileImageUrl
                ? { uri: doctor.profileImageUrl }
                : icons.doctor
            }
            className="h-16 w-16 rounded-2xl"
            resizeMode="cover"
          />
        </View>

        <View className="ml-4 flex-1">
          <Text className="font-JakartaBold text-lg text-gray-900">
            Dr. {doctor.firstName} {doctor.lastName}
          </Text>

          <View className="mt-1 rounded-lg bg-primary-50 px-2 py-1 self-start">
            <Text className="font-JakartaSemiBold text-xs text-primary-700">
              {doctor.specialty}
            </Text>
          </View>

          <View className="mt-2 flex-row items-center">
            <View className="flex-row items-center rounded-lg bg-yellow-50 px-2 py-1">
              <Image source={icons.star} className="h-3.5 w-3.5" />
              <Text className="ml-1 font-JakartaBold text-xs text-yellow-700">
                {doctor.rating.toFixed(1)}
              </Text>
            </View>

            <View className="mx-2 h-1 w-1 rounded-full bg-gray-300" />

            <Text className="font-JakartaMedium text-xs text-gray-600">
              {doctor.distance.toFixed(1)} km de distância
            </Text>
          </View>
        </View>
      </View>

      {/* Details Footer */}
      <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-4">
        <View className="flex-row items-center">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
            <Image source={icons.calendar} className="h-4 w-4" tintColor="#4C7C68" />
          </View>
          <View className="ml-2">
            <Text className="font-JakartaMedium text-xs text-gray-500">
              Tempo estimado
            </Text>
            <Text className="font-JakartaBold text-sm text-gray-900">
              ~{doctor.estimatedArrivalTime} min
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="font-JakartaMedium text-xs text-gray-500">
            Valor da consulta
          </Text>
          <Text className="font-JakartaBold text-lg text-primary-500">
            R$ {doctor.hourlyRate.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
