// app/(doctor)/(tabs)/dashboard.tsx
import { useAuth, useUser } from '@clerk/clerk-expo';
import Map from 'components/Map';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';

import { icons, images } from '../../../constants';
import { useFetch, fetchAPI } from '../../../lib/fetch';
import { Doctor, ConsultationDetails } from '../../../types/consultation';

interface DoctorDataResponse {
  data: Doctor & {
    upcomingConsultations?: ConsultationDetails[];
  };
}

const DoctorDashboard: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [stats, setStats] = useState({
    pendingConsultations: 0,
    todayConsultations: 0,
    totalEarnings: 0,
    rating: 0,
  });

  const {
    data: doctorDataResponse,
    loading,
    refetch,
  } = useFetch<DoctorDataResponse>(`/(api)/doctor/${user?.id}`);

  const doctorData = doctorDataResponse?.data;

  useEffect(() => {
    if (doctorData) {
      setIsAvailable(doctorData.isAvailable || false);

      fetchAPI(`/(api)/doctor/stats/${user?.id}`)
        .then((response) => {
          if (response.data) {
            setStats(response.data);
          }
        })
        .catch((error) => console.error('Error fetching stats:', error));
    }
  }, [doctorData, user?.id]);

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/sign-in');
  };

  const toggleAvailability = async () => {
    try {
      const newAvailability = !isAvailable;
      setIsAvailable(newAvailability);

      await fetchAPI(`/(api)/doctor/${user?.id}/toggle-availability`, {
        method: 'POST',
        body: JSON.stringify({ isAvailable: newAvailability }),
      });

      refetch();
    } catch (error) {
      console.error('Error toggling availability:', error);
      // Reverter em caso de falha
      setIsAvailable(!isAvailable);
    }
  };

  const navigateToAvailability = () => {
    router.navigate({
      pathname: '/(doctor)/availability',
    } as any);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-general-500">
        <ActivityIndicator size="large" color="#0286FF" />
      </SafeAreaView>
    );
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Horário não definido';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <ScrollView className="p-5">
        <View className="my-5 flex flex-row items-center justify-between">
          <Text className="font-JakartaExtraBold text-2xl capitalize">
            Bem vindo, Dr. {user?.firstName || 'Médico'}
          </Text>
          <TouchableOpacity
            onPress={handleSignOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-white">
            <Image source={icons.out} className="h-6 w-6" />
          </TouchableOpacity>
        </View>

        <View className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-JakartaSemiBold text-lg">Status</Text>
              <Text className="mt-1 font-JakartaMedium text-gray-500">
                {isAvailable
                  ? 'Você está disponível para receber consultas'
                  : 'Você está indisponível para consultas'}
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#ADE5B9' }}
              thumbColor={isAvailable ? '#38A169' : '#999999'}
              onValueChange={toggleAvailability}
              value={isAvailable}
            />
          </View>

          <TouchableOpacity
            onPress={navigateToAvailability}
            className="mt-3 flex-row items-center rounded-lg bg-gray-100 p-3">
            <Image source={icons.map} className="mr-2 h-5 w-5" />
            <Text className="font-JakartaMedium">Configurar disponibilidade</Text>
          </TouchableOpacity>
        </View>

        <Text className="mb-3 font-JakartaBold text-xl">Resumo</Text>
        <View className="mb-5 flex-row flex-wrap justify-between">
          <View className="mb-3 w-[48%] rounded-xl bg-white p-4 shadow-sm">
            <Text className="font-JakartaMedium text-gray-500">Consultas pendentes</Text>
            <Text className="mt-1 font-JakartaBold text-2xl">{stats.pendingConsultations}</Text>
          </View>

          <View className="mb-3 w-[48%] rounded-xl bg-white p-4 shadow-sm">
            <Text className="font-JakartaMedium text-gray-500">Consultas hoje</Text>
            <Text className="mt-1 font-JakartaBold text-2xl">{stats.todayConsultations}</Text>
          </View>

          <View className="w-[48%] rounded-xl bg-white p-4 shadow-sm">
            <Text className="font-JakartaMedium text-gray-500">Ganhos totais</Text>
            <Text className="mt-1 font-JakartaBold text-2xl">R$ {stats.totalEarnings}</Text>
          </View>

          <View className="w-[48%] rounded-xl bg-white p-4 shadow-sm">
            <Text className="font-JakartaMedium text-gray-500">Avaliação</Text>
            <View className="mt-1 flex-row items-center">
              <Text className="mr-1 font-JakartaBold text-2xl">{stats.rating.toFixed(1)}</Text>
              <Image source={icons.star} className="h-5 w-5" />
            </View>
          </View>
        </View>

        <Text className="mb-3 font-JakartaBold text-xl">Sua Localização</Text>
        <View className="mb-5 h-[300px] overflow-hidden rounded-xl">
          <Map />
        </View>

        <Text className="mb-3 font-JakartaBold text-xl">Próximas Consultas</Text>
        {doctorData?.upcomingConsultations && doctorData.upcomingConsultations.length > 0 ? (
          doctorData.upcomingConsultations.map((consultation: ConsultationDetails) => (
            <TouchableOpacity
              key={consultation.consultationId}
              onPress={() =>
                router.navigate({
                  pathname: '/(doctor)/consultation/[id]',
                  params: { id: consultation.consultationId },
                } as any)
              }
              className="mb-3 rounded-xl bg-white p-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <Text className="font-JakartaSemiBold">{consultation.patient.name}</Text>
                <Text className="font-JakartaSemiBold text-primary-500">
                  {formatTime(consultation.scheduledTime)}
                </Text>
              </View>
              <Text className="mt-1 text-gray-500">
                {consultation.complaint.substring(0, 50)}...
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center rounded-xl bg-white p-5">
            <Image source={images.noResult} className="h-40 w-40" />
            <Text className="mt-2 text-gray-500">Nenhuma consulta agendada</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorDashboard;
