import React, { useState, useEffect } from 'react';
import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useLocationStore } from '../../store';
import { useConsultation } from '../../hooks/useConsultation';
import { useNearbyDoctors } from '../../hooks/useNearbyDoctors';
import CustomButton from '../../components/CustomButton';
import LoadingScreen from '../../components/LoadingScreen';
import { icons } from '../../constants';

export default function ConfirmConsultation() {
  const params = useLocalSearchParams();
  const { user } = useUser();
  const { userLatitude, userLongitude, userAddress } = useLocationStore();
  const { createConsultation, loading: creating } = useConsultation();
  const { doctors } = useNearbyDoctors();
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    const selectedDoctor = doctors.find((d) => d.id === params.doctorId);
    if (selectedDoctor) {
      setDoctor(selectedDoctor);
    }
  }, [params.doctorId, doctors]);

  const handleConfirm = async () => {
    if (!userLatitude || !userLongitude || !userAddress) {
      alert('Localização não disponível');
      return;
    }

    const consultation = await createConsultation({
      originAddress: userAddress,
      originLatitude: userLatitude,
      originLongitude: userLongitude,
      complaint: params.complaint as string,
    });

    if (consultation) {
      router.replace({
        pathname: '/(root)/consultation-tracking/[id]',
        params: { id: consultation.consultationId },
      } as any);
    }
  };

  if (!doctor) {
    return <LoadingScreen message="Carregando informações..." fullScreen />;
  }

  return (
    <SafeAreaView className="h-full bg-gray-50">
      {/* Header */}
      <View
        className="flex-row items-center border-b border-gray-200 bg-white px-5 py-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-gray-50"
          activeOpacity={0.7}>
          <Image source={icons.backArrow} className="h-5 w-5" />
        </TouchableOpacity>

        <Text className="flex-1 font-JakartaBold text-xl text-gray-900">
          Confirmar Consulta
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Doctor Card */}
        <View
          className="mb-5 rounded-3xl border border-primary-100 bg-white p-6"
          style={{
            shadowColor: '#4C7C68',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 6,
          }}>
          <View className="mb-4 flex-row items-center">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
              <Image source={icons.doctor} className="h-5 w-5" tintColor="#FFFFFF" />
            </View>
            <Text className="ml-3 font-JakartaBold text-base text-gray-900">
              Médico Selecionado
            </Text>
          </View>

          <View className="mb-5 flex-row items-center">
            <View
              className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-primary-50"
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
                className="h-20 w-20 rounded-2xl"
                resizeMode="cover"
              />
            </View>

            <View className="ml-4 flex-1">
              <Text className="font-JakartaBold text-lg text-gray-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </Text>

              <View className="mt-1 self-start rounded-lg bg-primary-50 px-2 py-1">
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
                  {doctor.distance.toFixed(1)} km
                </Text>
              </View>
            </View>
          </View>

          <View className="space-y-3 rounded-xl bg-gray-50 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  <Image source={icons.calendar} className="h-4 w-4" tintColor="#4C7C68" />
                </View>
                <Text className="ml-2 font-JakartaMedium text-sm text-gray-600">
                  Tempo estimado
                </Text>
              </View>
              <Text className="font-JakartaBold text-sm text-gray-900">
                ~{doctor.estimatedArrivalTime} min
              </Text>
            </View>

            <View className="h-px bg-gray-200" />

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  <Image source={icons.dollar} className="h-4 w-4" tintColor="#4C7C68" />
                </View>
                <Text className="ml-2 font-JakartaMedium text-sm text-gray-600">
                  Valor da consulta
                </Text>
              </View>
              <Text className="font-JakartaBold text-lg text-primary-500">
                R$ {doctor.hourlyRate.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Card */}
        <View
          className="mb-5 rounded-2xl border border-gray-200 bg-white p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}>
          <View className="mb-3 flex-row items-center">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
              <Image source={icons.pin} className="h-4.5 w-4.5" tintColor="#4C7C68" />
            </View>
            <Text className="ml-3 font-JakartaBold text-base text-gray-900">
              Local de Atendimento
            </Text>
          </View>

          <View className="rounded-xl bg-gray-50 p-3">
            <Text className="font-JakartaMedium text-sm text-gray-700 leading-5">
              {userAddress}
            </Text>
          </View>
        </View>

        {/* Symptoms Card */}
        {params.complaint && (
          <View
            className="mb-5 rounded-2xl border border-gray-200 bg-white p-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-3 flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                <Image source={icons.list} className="h-4.5 w-4.5" tintColor="#4C7C68" />
              </View>
              <Text className="ml-3 font-JakartaBold text-base text-gray-900">
                Sintomas Relatados
              </Text>
            </View>

            <View className="rounded-xl bg-gray-50 p-3">
              <Text className="font-JakartaMedium text-sm text-gray-700 leading-5">
                {params.complaint}
              </Text>
            </View>
          </View>
        )}

        {/* Warning Card */}
        <View
          className="rounded-2xl border border-warning-200 p-4"
          style={{
            backgroundColor: '#FFFBEB',
            shadowColor: '#EAB308',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          }}>
          <View className="flex-row items-start">
            <View
              className="h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: '#EAB308' }}>
              <Text className="text-xl font-JakartaBold text-white">!</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-JakartaBold text-sm mb-1.5" style={{ color: '#713F12' }}>
                Importante
              </Text>
              <Text className="font-JakartaMedium text-xs leading-4" style={{ color: '#854D0E' }}>
                Ao confirmar, o médico será notificado e iniciará o deslocamento até você.
                Certifique-se de estar no local informado.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View
        className="border-t border-gray-200 bg-white px-5 py-5"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        }}>
        <CustomButton
          title={creating ? 'Confirmando...' : 'Confirmar e Solicitar'}
          onPress={handleConfirm}
          bgVariant="primary"
          disabled={creating}
        />
      </View>
    </SafeAreaView>
  );
}
