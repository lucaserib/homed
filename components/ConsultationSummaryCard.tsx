import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { icons } from '../constants';
import StatusBadge from './StatusBadge';
import { ConsultationDetails } from '../types/consultation';

interface ConsultationSummaryCardProps {
  consultation: ConsultationDetails;
}

export default function ConsultationSummaryCard({
  consultation,
}: ConsultationSummaryCardProps) {
  const handlePress = () => {
    router.push(`/(root)/consultation-details/${consultation.consultationId}` as any);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="mb-4 rounded-2xl border border-gray-100 bg-white p-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}>
      {/* Header com Status e Data */}
      <View className="flex-row items-center justify-between mb-4">
        <StatusBadge status={consultation.status as any} size="sm" />
        <Text className="font-JakartaMedium text-xs text-gray-500">
          {new Date(consultation.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {/* Informações do Médico */}
      {consultation.doctor ? (
        <View className="flex-row items-center mb-4 pb-4 border-b border-gray-50">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <Image
              source={
                consultation.doctor.profileImageUrl
                  ? { uri: consultation.doctor.profileImageUrl }
                  : icons.doctor
              }
              className="h-14 w-14 rounded-full"
              resizeMode="cover"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="font-JakartaBold text-base text-gray-900">
              Dr. {consultation.doctor.firstName} {consultation.doctor.lastName}
            </Text>
            <Text className="font-JakartaMedium text-sm text-gray-600 mt-0.5">
              {consultation.doctor.specialty}
            </Text>

            <View className="flex-row items-center mt-1">
              <Image source={icons.star} className="h-3.5 w-3.5" />
              <Text className="ml-1 font-JakartaMedium text-xs text-gray-700">
                {consultation.doctor.rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="mb-4 pb-4 border-b border-gray-50">
          <Text className="font-JakartaMedium text-sm text-gray-500">
            Aguardando aceite de médico...
          </Text>
        </View>
      )}

      {/* Endereço */}
      <View className="flex-row items-start mb-3">
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
          <Image source={icons.pin} className="h-4.5 w-4.5" tintColor="#4C7C68" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-JakartaMedium text-xs text-gray-500 mb-0.5">
            Local do atendimento
          </Text>
          <Text
            className="font-JakartaSemiBold text-sm text-gray-900"
            numberOfLines={2}>
            {consultation.originAddress}
          </Text>
        </View>
      </View>

      {/* Sintomas */}
      {consultation.complaint && (
        <View className="mt-3 rounded-xl bg-gray-50 p-3">
          <Text className="font-JakartaMedium text-xs text-gray-500 mb-1">
            Sintomas relatados
          </Text>
          <Text className="font-JakartaMedium text-sm text-gray-800" numberOfLines={2}>
            {consultation.complaint}
          </Text>
        </View>
      )}

      {/* Footer com Valor */}
      {consultation.totalPrice && (
        <View className="mt-4 pt-4 border-t border-gray-50 flex-row items-center justify-between">
          <Text className="font-JakartaMedium text-sm text-gray-600">
            Valor da consulta
          </Text>
          <Text className="font-JakartaBold text-lg text-primary-500">
            R$ {consultation.totalPrice.toFixed(2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
