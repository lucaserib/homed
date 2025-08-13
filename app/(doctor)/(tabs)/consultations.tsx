// app/(doctor)/(tabs)/consultations.tsx
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';

import { icons, images } from '../../../constants';
import { useFetch, fetchAPI } from '../../../lib/fetch';

interface TabButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mr-2 rounded-full px-5 py-3 ${active ? 'bg-primary-500' : 'bg-gray-200'}`}>
    <Text className={`font-JakartaMedium ${active ? 'text-white' : 'text-gray-600'}`}>{title}</Text>
  </TouchableOpacity>
);

interface ConsultationCardProps {
  consultation: any; // Idealmente, seria um tipo específico
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onPress: () => void;
}

const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consultation,
  onAccept,
  onDecline,
  onPress,
}) => {
  const getStatusBadge = () => {
    switch (consultation.status) {
      case 'pending':
        return (
          <View className="rounded bg-yellow-100 px-2 py-1">
            <Text className="text-xs text-yellow-800">Pendente</Text>
          </View>
        );
      case 'accepted':
        return (
          <View className="rounded bg-blue-100 px-2 py-1">
            <Text className="text-xs text-blue-800">Agendada</Text>
          </View>
        );
      case 'in_progress':
        return (
          <View className="rounded bg-green-100 px-2 py-1">
            <Text className="text-xs text-green-800">Em andamento</Text>
          </View>
        );
      case 'completed':
        return (
          <View className="rounded bg-gray-100 px-2 py-1">
            <Text className="text-xs text-gray-800">Concluída</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View className="rounded bg-red-100 px-2 py-1">
            <Text className="text-xs text-red-800">Cancelada</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} className="mb-3 rounded-xl bg-white p-4 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-JakartaSemiBold text-lg">{consultation.patient.name}</Text>
        {getStatusBadge()}
      </View>

      <Text className="mb-2 text-gray-600" numberOfLines={2}>
        {consultation.complaint.substring(0, 100)}
        {consultation.complaint.length > 100 ? '...' : ''}
      </Text>

      <View className="mb-1 flex-row items-center">
        <Image source={icons.map} className="mr-1 h-4 w-4" />
        <Text className="text-sm text-gray-500" numberOfLines={1}>
          {consultation.originAddress}
        </Text>
      </View>

      {consultation.scheduledTime && (
        <View className="mb-2 flex-row items-center">
          <Image source={icons.marker} className="mr-1 h-4 w-4" />{' '}
          {/* Substituindo o ícone clock que não existe */}
          <Text className="text-sm text-gray-500">
            {new Date(consultation.scheduledTime).toLocaleDateString()} às{' '}
            {new Date(consultation.scheduledTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}

      {consultation.status === 'pending' && (
        <View className="mt-2 flex-row">
          <TouchableOpacity
            onPress={() => onAccept(consultation.consultationId)}
            className="mr-2 flex-1 rounded-lg bg-primary-500 px-4 py-2">
            <Text className="text-center font-JakartaMedium text-white">Aceitar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDecline(consultation.consultationId)}
            className="flex-1 rounded-lg bg-general-700 px-4 py-2">
            <Text className="text-center font-JakartaMedium text-gray-700">Recusar</Text>
          </TouchableOpacity>
        </View>
      )}

      {consultation.status === 'accepted' && (
        <TouchableOpacity
          onPress={() =>
            router.navigate({
              pathname: '/(doctor)/active-consultation',
              params: { id: consultation.consultationId },
            } as any)
          }
          className="mt-2 rounded-lg bg-success-500 px-4 py-2">
          <Text className="text-center font-JakartaMedium text-white">Iniciar Atendimento</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const DoctorConsultations: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('pending');

  const {
    data: consultationsResponse,
    loading,
    refetch,
  } = useFetch<{ data: any[] }>(`/(api)/consultation/doctor/${user?.id}?status=${activeTab}`);

  const consultations = consultationsResponse?.data || [];

  const handleAcceptConsultation = async (consultationId: string) => {
    try {
      await fetchAPI(`/(api)/consultation/${consultationId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ doctorId: user?.id }),
      });
      refetch();
    } catch (error) {
      console.error('Error accepting consultation:', error);
    }
  };

  const handleDeclineConsultation = async (consultationId: string) => {
    try {
      await fetchAPI(`/(api)/consultation/${consultationId}/decline`, {
        method: 'POST',
        body: JSON.stringify({ doctorId: user?.id }),
      });
      refetch();
    } catch (error) {
      console.error('Error declining consultation:', error);
    }
  };

  const handleConsultationPress = (consultation: any) => {
    router.navigate({
      pathname: '/(doctor)/consultation/[id]',
      params: { id: consultation.consultationId },
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <View className="p-5">
        <Text className="mb-5 font-JakartaBold text-2xl">Minhas Consultas</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          <TabButton
            title="Pendentes"
            active={activeTab === 'pending'}
            onPress={() => setActiveTab('pending')}
          />
          <TabButton
            title="Agendadas"
            active={activeTab === 'accepted'}
            onPress={() => setActiveTab('accepted')}
          />
          <TabButton
            title="Em andamento"
            active={activeTab === 'in_progress'}
            onPress={() => setActiveTab('in_progress')}
          />
          <TabButton
            title="Concluídas"
            active={activeTab === 'completed'}
            onPress={() => setActiveTab('completed')}
          />
        </ScrollView>

        {loading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#0286FF" />
          </View>
        ) : (
          <>
            {consultations && consultations.length > 0 ? (
              <FlatList
                data={consultations}
                keyExtractor={(item) => item.consultationId}
                renderItem={({ item }) => (
                  <ConsultationCard
                    consultation={item}
                    onAccept={handleAcceptConsultation}
                    onDecline={handleDeclineConsultation}
                    onPress={() => handleConsultationPress(item)}
                  />
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            ) : (
              <View className="items-center justify-center py-10">
                <Image source={images.noResult} className="h-40 w-40" resizeMode="contain" />
                <Text className="mt-2 text-gray-500">
                  {activeTab === 'pending'
                    ? 'Nenhuma consulta pendente'
                    : activeTab === 'accepted'
                      ? 'Nenhuma consulta agendada'
                      : activeTab === 'in_progress'
                        ? 'Nenhuma consulta em andamento'
                        : 'Nenhuma consulta concluída'}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default DoctorConsultations;
