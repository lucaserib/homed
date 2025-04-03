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
import { useLocalSearchParams, router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '../../../lib/fetch';
import { icons } from '../../../constants';
import * as NativeWind from 'nativewind';
import type { ConsultationDetails } from '../../../types/consultation';

const styled = NativeWind.styled;

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

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
      <StyledSafeAreaView className="flex-1 items-center justify-center bg-general-500">
        <ActivityIndicator size="large" color="#0286FF" />
      </StyledSafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <StyledSafeAreaView className="flex-1 bg-general-500 p-5">
        <StyledView className="mb-5 flex-row items-center">
          <StyledTouchableOpacity onPress={() => router.back()} className="mr-3">
            <StyledImage source={icons.backArrow} className="h-6 w-6" />
          </StyledTouchableOpacity>
          <StyledText className="font-JakartaBold text-2xl">Detalhes da Consulta</StyledText>
        </StyledView>

        <StyledView className="flex-1 items-center justify-center">
          <StyledText className="mb-3 text-center font-JakartaSemiBold text-lg">
            Consulta não encontrada
          </StyledText>
          <StyledTouchableOpacity
            onPress={() => router.back()}
            className="rounded-full bg-primary-500 px-5 py-3">
            <StyledText className="text-center font-JakartaBold text-white">Voltar</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-general-500">
      <StyledScrollView className="p-5">
        <StyledView className="mb-5 flex-row items-center">
          <StyledTouchableOpacity onPress={() => router.back()} className="mr-3">
            <StyledImage source={icons.backArrow} className="h-6 w-6" />
          </StyledTouchableOpacity>
          <StyledText className="font-JakartaBold text-2xl">Detalhes da Consulta</StyledText>
        </StyledView>

        {/* Status da Consulta */}
        <StyledView className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <StyledText className="mb-2 font-JakartaSemiBold text-xl">Status</StyledText>
          <StyledView
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
            <StyledText
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
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Informações do Paciente */}
        <StyledView className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <StyledText className="mb-3 font-JakartaSemiBold text-xl">
            Informações do Paciente
          </StyledText>

          <StyledView className="mb-2">
            <StyledText className="font-JakartaMedium text-gray-500">Nome</StyledText>
            <StyledText className="font-JakartaSemiBold text-lg">
              {consultation.patient.name}
            </StyledText>
          </StyledView>

          <StyledView className="mb-2">
            <StyledText className="font-JakartaMedium text-gray-500">Local</StyledText>
            <StyledText className="font-JakartaSemiBold">{consultation.originAddress}</StyledText>
          </StyledView>

          {consultation.status === 'in_progress' && (
            <StyledTouchableOpacity
              onPress={handleOpenChat}
              className="mt-2 flex-row items-center justify-center rounded-full bg-primary-500 px-5 py-3">
              <StyledImage source={icons.chat} className="mr-2 h-5 w-5" tintColor="white" />
              <StyledText className="font-JakartaBold text-white">Chat com Paciente</StyledText>
            </StyledTouchableOpacity>
          )}
        </StyledView>

        {/* Detalhes da Consulta */}
        <StyledView className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <StyledText className="mb-3 font-JakartaSemiBold text-xl">
            Detalhes da Consulta
          </StyledText>

          <StyledView className="mb-2">
            <StyledText className="font-JakartaMedium text-gray-500">Queixa do Paciente</StyledText>
            <StyledText className="font-JakartaSemiBold">{consultation.complaint}</StyledText>
          </StyledView>

          <StyledView className="mb-2">
            <StyledText className="font-JakartaMedium text-gray-500">Data Agendada</StyledText>
            <StyledText className="font-JakartaSemiBold">
              {formatDate(consultation.scheduledTime)}
            </StyledText>
          </StyledView>

          {consultation.startTime && (
            <StyledView className="mb-2">
              <StyledText className="font-JakartaMedium text-gray-500">Início</StyledText>
              <StyledText className="font-JakartaSemiBold">
                {formatDate(consultation.startTime)}
              </StyledText>
            </StyledView>
          )}

          {consultation.endTime && (
            <StyledView className="mb-2">
              <StyledText className="font-JakartaMedium text-gray-500">Fim</StyledText>
              <StyledText className="font-JakartaSemiBold">
                {formatDate(consultation.endTime)}
              </StyledText>
            </StyledView>
          )}

          {consultation.status === 'completed' && (
            <StyledTouchableOpacity
              onPress={handleViewMedicalRecord}
              className="mt-3 flex-row items-center justify-center rounded-full bg-primary-500 px-5 py-3">
              <StyledText className="font-JakartaBold text-white">Ver Prontuário</StyledText>
            </StyledTouchableOpacity>
          )}
        </StyledView>

        {/* Ações */}
        {consultation.status === 'pending' && (
          <StyledView className="mb-5 rounded-xl bg-white p-5 shadow-sm">
            <StyledText className="mb-3 font-JakartaSemiBold text-xl">Ações</StyledText>

            <StyledView className="flex-row">
              <StyledTouchableOpacity
                onPress={handleAccept}
                className="mr-2 flex-1 rounded-full bg-primary-500 px-5 py-3">
                <StyledText className="text-center font-JakartaBold text-white">Aceitar</StyledText>
              </StyledTouchableOpacity>

              <StyledTouchableOpacity
                onPress={handleDecline}
                className="flex-1 rounded-full bg-general-700 px-5 py-3">
                <StyledText className="text-center font-JakartaBold text-gray-700">
                  Recusar
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        )}

        {consultation.status === 'accepted' && (
          <StyledView className="mb-5 rounded-xl bg-white p-5 shadow-sm">
            <StyledText className="mb-3 font-JakartaSemiBold text-xl">Ações</StyledText>

            <StyledTouchableOpacity
              onPress={handleStartConsultation}
              className="rounded-full bg-success-500 px-5 py-3">
              <StyledText className="text-center font-JakartaBold text-white">
                Iniciar Atendimento
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default ConsultationDetailsScreen;
