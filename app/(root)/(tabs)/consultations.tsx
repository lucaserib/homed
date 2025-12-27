import { useUser } from '@clerk/clerk-expo';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFetch } from '../../../lib/fetch';
import { ConsultationDetails } from '../../../types/consultation';
import EmptyState from '../../../components/EmptyState';
import LoadingScreen from '../../../components/LoadingScreen';
import StatusBadge from '../../../components/StatusBadge';
import { images, icons } from '../../../constants';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const Consultations = () => {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: consultations,
    loading,
    refetch,
  } = useFetch<ConsultationDetails[]>(user?.id ? `/consultations/patient/${user.id}` : null);

  // Encontra a consulta ativa (pending, accepted, started)
  const activeConsultation = consultations?.find(
    (c) => c.status === 'pending' || c.status === 'accepted' || c.status === 'started'
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRequestConsultation = () => {
    router.push('/(root)/request-consultation' as any);
  };

  if (loading && !consultations) {
    return <LoadingScreen message="Carregando atendimento..." fullScreen />;
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Buscando médico',
          description: 'Aguardando resposta dos médicos próximos',
          icon: icons.search,
          color: '#EAB308',
        };
      case 'accepted':
        return {
          title: 'Médico a caminho',
          description: 'O médico está se deslocando até você',
          icon: icons.doctor,
          color: '#3B82F6',
        };
      case 'started':
        return {
          title: 'Atendimento em andamento',
          description: 'O médico está realizando o atendimento',
          icon: icons.checkmark,
          color: '#10B981',
        };
      default:
        return {
          title: 'Status desconhecido',
          description: '',
          icon: icons.calendar,
          color: '#6B7280',
        };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 bg-gray-50">
        {/* Header fixo */}
        <View className="border-b border-gray-200 bg-white px-5 pb-4 pt-2">
          <Text className="font-JakartaBold text-2xl text-gray-900">Consultas</Text>
          <Text className="mt-1 font-JakartaMedium text-sm text-gray-500">
            Acompanhe suas consultas em tempo real
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4C7C68" />
          }
          className="flex-1"
          contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 115 : 95 }}>
          {activeConsultation ? (
            <View className="px-5 pt-5">
              {/* Status Card */}
              <LinearGradient
                colors={[
                  getStatusInfo(activeConsultation.status).color,
                  getStatusInfo(activeConsultation.status).color + 'CC',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="mb-6 rounded-3xl p-6"
                style={{
                  shadowColor: getStatusInfo(activeConsultation.status).color,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 12,
                }}>
                <View className="items-center">
                  <View
                    className="mb-4 h-20 w-20 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                    <Image
                      source={getStatusInfo(activeConsultation.status).icon}
                      className="h-10 w-10"
                      tintColor="#FFFFFF"
                    />
                  </View>
                  <Text className="mb-2 font-JakartaBold text-2xl text-white">
                    {getStatusInfo(activeConsultation.status).title}
                  </Text>
                  <Text className="text-center font-JakartaMedium text-sm text-white/90">
                    {getStatusInfo(activeConsultation.status).description}
                  </Text>
                </View>
              </LinearGradient>

              {/* Doctor Info Card */}
              {activeConsultation.doctor && (
                <View
                  className="mb-5 rounded-2xl border border-gray-100 bg-white p-5"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                  <View className="mb-4 flex-row items-center">
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                      <Image source={icons.doctor} className="h-5 w-5" tintColor="#FFFFFF" />
                    </View>
                    <Text className="ml-3 font-JakartaBold text-base text-gray-900">
                      Informações do Médico
                    </Text>
                  </View>

                  <View className="flex-row items-center">
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
                          activeConsultation.doctor.profileImage
                            ? { uri: activeConsultation.doctor.profileImage }
                            : icons.doctor
                        }
                        className="h-16 w-16"
                        resizeMode="cover"
                      />
                    </View>

                    <View className="ml-4 flex-1">
                      <Text className="font-JakartaBold text-lg text-gray-900">
                        Dr. {activeConsultation.doctor.firstName}{' '}
                        {activeConsultation.doctor.lastName}
                      </Text>
                      <View className="mt-1 self-start rounded-lg bg-primary-50 px-2 py-1">
                        <Text className="font-JakartaSemiBold text-xs text-primary-700">
                          {activeConsultation.doctor.specialty || 'Clínico Geral'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Consultation Details Card */}
              <View
                className="mb-5 rounded-2xl border border-gray-100 bg-white p-5"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                }}>
                <View className="mb-4 flex-row items-center">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                    <Image source={icons.list} className="h-5 w-5" tintColor="#4C7C68" />
                  </View>
                  <Text className="ml-3 font-JakartaBold text-base text-gray-900">
                    Detalhes da Consulta
                  </Text>
                </View>

                {activeConsultation.complaint && (
                  <View className="mb-4">
                    <Text className="mb-2 font-JakartaSemiBold text-sm text-gray-600">
                      Sintomas relatados:
                    </Text>
                    <View className="rounded-xl bg-gray-50 p-3">
                      <Text className="font-JakartaMedium text-sm leading-5 text-gray-700">
                        {activeConsultation.complaint}
                      </Text>
                    </View>
                  </View>
                )}

                <View>
                  <Text className="mb-2 font-JakartaSemiBold text-sm text-gray-600">
                    Local do atendimento:
                  </Text>
                  <View className="rounded-xl bg-gray-50 p-3">
                    <Text className="font-JakartaMedium text-sm leading-5 text-gray-700">
                      {activeConsultation.originAddress}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              {activeConsultation.status === 'started' && (
                <TouchableOpacity
                  className="mb-4 rounded-2xl border border-primary-500 bg-primary-500 p-4"
                  activeOpacity={0.8}
                  style={{
                    shadowColor: '#4C7C68',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 6,
                  }}>
                  <Text className="text-center font-JakartaBold text-base text-white">
                    Enviar Mensagem ao Médico
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="px-5 pt-8">
              <EmptyState
                title="Nenhum atendimento ativo"
                description="Você não tem atendimentos em andamento no momento"
                image={images.noResult}
                actionLabel="Solicitar Atendimento"
                onAction={handleRequestConsultation}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Consultations;
