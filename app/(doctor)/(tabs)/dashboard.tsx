// app/(doctor)/(tabs)/dashboard.tsx
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
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useFetch, fetchAPI } from '../../../lib/fetch';
import { router } from 'expo-router';
import { icons, images } from '../../../constants';
import Map from 'components/Map';
import { styled } from 'nativewind';
import { Doctor, ConsultationDetails } from '../../../types/consultation';

// Componentes estilizados
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledImage = styled(Image);

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
      <StyledSafeAreaView className="flex-1 items-center justify-center bg-general-500">
        <ActivityIndicator size="large" color="#0286FF" />
      </StyledSafeAreaView>
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
    <StyledSafeAreaView className="flex-1 bg-general-500">
      <StyledScrollView className="p-5">
        <StyledView className="my-5 flex flex-row items-center justify-between">
          <StyledText className="font-JakartaExtraBold text-2xl capitalize">
            Bem vindo, Dr. {user?.firstName || 'Médico'}
          </StyledText>
          <StyledTouchableOpacity
            onPress={handleSignOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-white">
            <StyledImage source={icons.out} className="h-6 w-6" />
          </StyledTouchableOpacity>
        </StyledView>

        <StyledView className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <StyledView className="flex-row items-center justify-between">
            <StyledView>
              <StyledText className="font-JakartaSemiBold text-lg">Status</StyledText>
              <StyledText className="mt-1 font-JakartaMedium text-gray-500">
                {isAvailable
                  ? 'Você está disponível para receber consultas'
                  : 'Você está indisponível para consultas'}
              </StyledText>
            </StyledView>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#ADE5B9' }}
              thumbColor={isAvailable ? '#38A169' : '#999999'}
              onValueChange={toggleAvailability}
              value={isAvailable}
            />
          </StyledView>

          <StyledTouchableOpacity
            onPress={navigateToAvailability}
            className="mt-3 flex-row items-center rounded-lg bg-gray-100 p-3">
            <StyledImage source={icons.map} className="mr-2 h-5 w-5" />
            <StyledText className="font-JakartaMedium">Configurar disponibilidade</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        <StyledText className="mb-3 font-JakartaBold text-xl">Resumo</StyledText>
        <StyledView className="mb-5 flex-row flex-wrap justify-between">
          <StyledView className="mb-3 w-[48%] rounded-xl bg-white p-4 shadow-sm">
            <StyledText className="font-JakartaMedium text-gray-500">
              Consultas pendentes
            </StyledText>
            <StyledText className="mt-1 font-JakartaBold text-2xl">
              {stats.pendingConsultations}
            </StyledText>
          </StyledView>

          <StyledView className="mb-3 w-[48%] rounded-xl bg-white p-4 shadow-sm">
            <StyledText className="font-JakartaMedium text-gray-500">Consultas hoje</StyledText>
            <StyledText className="mt-1 font-JakartaBold text-2xl">
              {stats.todayConsultations}
            </StyledText>
          </StyledView>

          <StyledView className="w-[48%] rounded-xl bg-white p-4 shadow-sm">
            <StyledText className="font-JakartaMedium text-gray-500">Ganhos totais</StyledText>
            <StyledText className="mt-1 font-JakartaBold text-2xl">
              R$ {stats.totalEarnings}
            </StyledText>
          </StyledView>

          <StyledView className="w-[48%] rounded-xl bg-white p-4 shadow-sm">
            <StyledText className="font-JakartaMedium text-gray-500">Avaliação</StyledText>
            <StyledView className="mt-1 flex-row items-center">
              <StyledText className="mr-1 font-JakartaBold text-2xl">
                {stats.rating.toFixed(1)}
              </StyledText>
              <StyledImage source={icons.star} className="h-5 w-5" />
            </StyledView>
          </StyledView>
        </StyledView>

        <StyledText className="mb-3 font-JakartaBold text-xl">Sua Localização</StyledText>
        <StyledView className="mb-5 h-[300px] overflow-hidden rounded-xl">
          <Map />
        </StyledView>

        <StyledText className="mb-3 font-JakartaBold text-xl">Próximas Consultas</StyledText>
        {doctorData?.upcomingConsultations && doctorData.upcomingConsultations.length > 0 ? (
          doctorData.upcomingConsultations.map((consultation: ConsultationDetails) => (
            <StyledTouchableOpacity
              key={consultation.consultationId}
              onPress={() =>
                router.navigate({
                  pathname: '/(doctor)/consultation/[id]',
                  params: { id: consultation.consultationId },
                } as any)
              }
              className="mb-3 rounded-xl bg-white p-4 shadow-sm">
              <StyledView className="flex-row items-center justify-between">
                <StyledText className="font-JakartaSemiBold">
                  {consultation.patient.name}
                </StyledText>
                <StyledText className="font-JakartaSemiBold text-primary-500">
                  {formatTime(consultation.scheduledTime)}
                </StyledText>
              </StyledView>
              <StyledText className="mt-1 text-gray-500">
                {consultation.complaint.substring(0, 50)}...
              </StyledText>
            </StyledTouchableOpacity>
          ))
        ) : (
          <StyledView className="items-center justify-center rounded-xl bg-white p-5">
            <StyledImage source={images.noResult} className="h-40 w-40" />
            <StyledText className="mt-2 text-gray-500">Nenhuma consulta agendada</StyledText>
          </StyledView>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default DoctorDashboard;
