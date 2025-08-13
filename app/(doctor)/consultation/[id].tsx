import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';

import { icons } from '../../../constants';
import { fetchAPI } from '../../../lib/fetch';
import type { ConsultationDetails } from '../../../types/consultation';

const ConsultationDetailsScreen = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const response = await fetchAPI(`/(api)/consultation/${params.id}`);
        if (response?.data) {
          setConsultation(response.data);
        } else {
          Alert.alert('Erro', 'Consulta não encontrada');
        }
      } catch (error) {
        console.error('Error fetching consultation:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados da consulta');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [params.id]);

  const handleAccept = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(`/(api)/consultation/${params.id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ doctorId: user?.id }),
      });

      if (response?.data) {
        setConsultation(response.data);
        Alert.alert('Sucesso', 'Consulta aceita com sucesso!');
      }
    } catch (error) {
      console.error('Error accepting consultation:', error);
      Alert.alert('Erro', 'Não foi possível aceitar a consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(`/(api)/consultation/${params.id}/decline`, {
        method: 'POST',
        body: JSON.stringify({ doctorId: user?.id }),
      });

      if (response?.data) {
        Alert.alert('Aviso', 'Consulta recusada', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch (error) {
      console.error('Error declining consultation:', error);
      Alert.alert('Erro', 'Não foi possível recusar a consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async () => {
    try {
      router.navigate({
        pathname: '/(doctor)/active-consultation',
        params: { id: params.id },
      } as any);
    } catch (error) {
      console.error('Error navigating to active consultation:', error);
    }
  };

  const handleOpenChat = () => {
    router.navigate({
      pathname: '/(doctor)/(tabs)/chat',
      params: { consultationId: params.id },
    } as any);
  };

  const handleViewMedicalRecord = () => {
    router.navigate({
      pathname: '/(doctor)/medical-record/[id]',
      params: { id: params.id },
    } as any);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definido';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} às ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const getStatusText = () => {
    if (!consultation) return '';

    switch (consultation.status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Agendada';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-general-500">
        <ActivityIndicator size="large" color="#0286FF" />
      </SafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 p-5">
        <View className="mb-5 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Image source={icons.backArrow} className="h-6 w-6" />
          </TouchableOpacity>
          <Text className="font-JakartaBold text-2xl">Detalhes da Consulta</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="mb-3 text-center font-JakartaSemiBold text-lg">
            Consulta não encontrada
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-full bg-primary-500 px-5 py-3">
            <Text className="text-center font-JakartaBold text-white">Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <ScrollView className="p-5">
        <View className="mb-5 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Image source={icons.backArrow} className="h-6 w-6" />
          </TouchableOpacity>
          <Text className="font-JakartaBold text-2xl">Detalhes da Consulta</Text>
        </View>

        {/* Status da Consulta */}
        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-2 font-JakartaSemiBold text-xl">Status</Text>
          <View
            className={`rounded-full px-4 py-2 ${
              consultation.status === 'pending'
                ? 'bg-yellow-100'
                : consultation.status === 'accepted'
                  ? 'bg-blue-100'
                  : consultation.status === 'in_progress'
                    ? 'bg-green-100'
                    : consultation.status === 'completed'
                      ? 'bg-gray-100'
                      : 'bg-red-100'
            }`}
            style={{ alignSelf: 'flex-start' }}>
            <Text
              className={`font-JakartaSemiBold ${
                consultation.status === 'pending'
                  ? 'text-yellow-800'
                  : consultation.status === 'accepted'
                    ? 'text-blue-800'
                    : consultation.status === 'in_progress'
                      ? 'text-green-800'
                      : consultation.status === 'completed'
                        ? 'text-gray-800'
                        : 'text-red-800'
              }`}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Informações do Paciente */}
        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaSemiBold text-xl">Informações do Paciente</Text>

          <View className="mb-2">
            <Text className="font-JakartaMedium text-gray-500">Nome</Text>
            <Text className="font-JakartaSemiBold text-lg">{consultation.patient.name}</Text>
          </View>

          <View className="mb-2">
            <Text className="font-JakartaMedium text-gray-500">Local</Text>
            <Text className="font-JakartaSemiBold">{consultation.originAddress}</Text>
          </View>

          {consultation.status === 'in_progress' && (
            <TouchableOpacity
              onPress={handleOpenChat}
              className="mt-2 flex-row items-center justify-center rounded-full bg-primary-500 px-5 py-3">
              <Image source={icons.chat} className="mr-2 h-5 w-5" tintColor="white" />
              <Text className="font-JakartaBold text-white">Chat com Paciente</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Detalhes da Consulta */}
        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaSemiBold text-xl">Detalhes da Consulta</Text>

          <View className="mb-2">
            <Text className="font-JakartaMedium text-gray-500">Queixa do Paciente</Text>
            <Text className="font-JakartaSemiBold">{consultation.complaint}</Text>
          </View>

          <View className="mb-2">
            <Text className="font-JakartaMedium text-gray-500">Data Agendada</Text>
            <Text className="font-JakartaSemiBold">{formatDate(consultation.scheduledTime)}</Text>
          </View>

          {consultation.startTime && (
            <View className="mb-2">
              <Text className="font-JakartaMedium text-gray-500">Início</Text>
              <Text className="font-JakartaSemiBold">{formatDate(consultation.startTime)}</Text>
            </View>
          )}

          {consultation.endTime && (
            <View className="mb-2">
              <Text className="font-JakartaMedium text-gray-500">Fim</Text>
              <Text className="font-JakartaSemiBold">{formatDate(consultation.endTime)}</Text>
            </View>
          )}

          {consultation.status === 'completed' && (
            <TouchableOpacity
              onPress={handleViewMedicalRecord}
              className="mt-3 flex-row items-center justify-center rounded-full bg-primary-500 px-5 py-3">
              <Text className="font-JakartaBold text-white">Ver Prontuário</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Ações */}
        {consultation.status === 'pending' && (
          <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
            <Text className="mb-3 font-JakartaSemiBold text-xl">Ações</Text>

            <View className="flex-row">
              <TouchableOpacity
                onPress={handleAccept}
                className="mr-2 flex-1 rounded-full bg-primary-500 px-5 py-3">
                <Text className="text-center font-JakartaBold text-white">Aceitar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDecline}
                className="flex-1 rounded-full bg-general-700 px-5 py-3">
                <Text className="text-center font-JakartaBold text-gray-700">Recusar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {consultation.status === 'accepted' && (
          <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
            <Text className="mb-3 font-JakartaSemiBold text-xl">Ações</Text>

            <TouchableOpacity
              onPress={handleStartConsultation}
              className="rounded-full bg-success-500 px-5 py-3">
              <Text className="text-center font-JakartaBold text-white">Iniciar Atendimento</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConsultationDetailsScreen;
