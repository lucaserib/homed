import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useLocationStore } from '../../store';
import { useNearbyDoctors } from '../../hooks/useNearbyDoctors';
import DoctorCard from '../../components/DoctorCard';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import CustomButton from '../../components/CustomButton';
import { icons, images } from '../../constants';

export default function FindDoctor() {
  const params = useLocalSearchParams();
  const { userLatitude, userLongitude, userAddress } = useLocationStore();
  const { doctors, findNearbyDoctors, loading } = useNearbyDoctors();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  useEffect(() => {
    if (userLatitude && userLongitude) {
      findNearbyDoctors({
        latitude: userLatitude,
        longitude: userLongitude,
        radius: 20,
      });
    }
  }, [userLatitude, userLongitude]);

  const handleSelectDoctor = (doctorId: string) => {
    setSelectedDoctor(doctorId);
  };

  const handleConfirm = () => {
    if (selectedDoctor) {
      router.push({
        pathname: '/(root)/confirm-consultation',
        params: {
          doctorId: selectedDoctor,
          complaint: params.complaint,
        },
      } as any);
    }
  };

  if (loading && doctors.length === 0) {
    return <LoadingScreen message="Buscando médicos disponíveis..." fullScreen />;
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
          Médicos Disponíveis
        </Text>
      </View>

      {doctors.length === 0 ? (
        <EmptyState
          title="Nenhum médico encontrado"
          description="Não há médicos disponíveis próximos à sua localização no momento"
          image={images.noResult}
          actionLabel="Tentar Novamente"
          onAction={() => {
            if (userLatitude && userLongitude) {
              findNearbyDoctors({
                latitude: userLatitude,
                longitude: userLongitude,
                radius: 20,
              });
            }
          }}
        />
      ) : (
        <>
          {/* Results Count Banner */}
          <View
            className="mx-5 mt-5 rounded-2xl border border-primary-100 bg-primary-50 p-4"
            style={{
              shadowColor: '#4C7C68',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-500">
                <Image source={icons.doctor} className="h-5 w-5" tintColor="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-JakartaBold text-base text-gray-900">
                  {doctors.length} {doctors.length === 1 ? 'médico encontrado' : 'médicos encontrados'}
                </Text>
                <Text className="font-JakartaMedium text-xs text-gray-600 mt-0.5">
                  Selecione um médico para continuar
                </Text>
              </View>
            </View>
          </View>

          {/* Doctors List */}
          <FlatList
            data={doctors}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
            renderItem={({ item }) => (
              <DoctorCard
                doctor={item}
                selected={selectedDoctor === item.id}
                onSelect={() => handleSelectDoctor(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />

          {/* Floating Action Button */}
          {selectedDoctor && (
            <View
              className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 py-5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 8,
              }}>
              <CustomButton
                title="Confirmar Médico"
                onPress={handleConfirm}
                bgVariant="primary"
              />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
