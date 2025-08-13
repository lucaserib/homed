import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';

import { icons } from '../../constants';
import { fetchAPI } from '../../lib/fetch';
import type { ConsultationDetails } from '../../types/consultation';

interface ConsultationTimerProps {
  startTime: string;
  hourlyRate: number;
  onFinish: () => void;
}

const ConsultationTimer: React.FC<ConsultationTimerProps> = ({
  startTime,
  hourlyRate,
  onFinish,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (startTime && !isPaused) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(startTime);
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedTime(elapsed);

        const hoursFraction = elapsed / 3600;
        setEstimatedCost(hoursFraction * hourlyRate);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, hourlyRate, isPaused]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
      <Text className="mb-2 text-center font-JakartaBold text-xl">Tempo de Consulta</Text>

      <Text className="mb-3 text-center font-JakartaSemiBold text-3xl">
        {formatTime(elapsedTime)}
      </Text>

      <Text className="mb-5 text-center font-JakartaMedium">
        Valor estimado: R$ {estimatedCost.toFixed(2)}
      </Text>

      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={togglePause}
          className={`mr-2 flex-1 rounded-full px-5 py-3 ${isPaused ? 'bg-primary-500' : 'bg-gray-300'}`}>
          <Text
            className={`text-center font-JakartaBold ${isPaused ? 'text-white' : 'text-gray-700'}`}>
            {isPaused ? 'Continuar' : 'Pausar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFinish}
          className="flex-1 rounded-full bg-success-500 px-5 py-3">
          <Text className="text-center font-JakartaBold text-white">Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ActiveConsultation: React.FC = () => {
  const { user } = useUser();
  const params = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [showFinishModal, setShowFinishModal] = useState(false);

  useEffect(() => {
    const fetchConsultation = async () => {
      if (!params.id) {
        Alert.alert('Erro', 'ID da consulta não encontrado');
        return;
      }

      try {
        const response = await fetchAPI(`/(api)/consultation/${params.id}`);
        if (response?.data) {
          setConsultation(response.data);

          if (response.data.status !== 'in_progress') {
            startConsultation();
          }
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

  const startConsultation = async () => {
    try {
      const response = await fetchAPI(`/(api)/consultation/${params.id}/start`, {
        method: 'POST',
        body: JSON.stringify({
          doctorId: user?.id,
          startTime: new Date().toISOString(),
        }),
      });

      if (response?.data) {
        setConsultation(response.data);
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a consulta');
    }
  };

  const finishConsultation = async () => {
    try {
      const response = await fetchAPI(`/(api)/consultation/${params.id}/finish`, {
        method: 'POST',
        body: JSON.stringify({
          doctorId: user?.id,
          endTime: new Date().toISOString(),
          diagnosis,
          treatment,
          notes,
        }),
      });

      if (response?.data) {
        Alert.alert('Sucesso', 'Consulta finalizada com sucesso!');
        router.navigate({
          pathname: '/(doctor)/(tabs)/consultations',
        } as any);
      }
    } catch (error) {
      console.error('Error finishing consultation:', error);
      Alert.alert('Erro', 'Não foi possível finalizar a consulta');
    }
  };

  const handleFinishPress = () => {
    if (!diagnosis.trim() || !treatment.trim()) {
      Alert.alert('Aviso', 'Por favor, preencha o diagnóstico e tratamento antes de finalizar.');
      return;
    }
    setShowFinishModal(true);
  };

  const confirmFinish = () => {
    finishConsultation();
    setShowFinishModal(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-general-500">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  if (!consultation) {
    return (
      <View className="flex-1 items-center justify-center bg-general-500 p-5">
        <Text className="mb-4 text-center font-JakartaSemiBold text-lg">
          Consulta não encontrada ou não disponível
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-primary-500 px-5 py-3">
          <Text className="font-JakartaBold text-white">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-general-500 p-5">
      <View className="mb-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Image source={icons.backArrow} className="h-6 w-6" />
        </TouchableOpacity>
        <Text className="font-JakartaBold text-2xl">Consulta em Andamento</Text>
      </View>

      {consultation.startTime && (
        <ConsultationTimer
          startTime={consultation.startTime}
          hourlyRate={consultation.doctor?.hourlyRate || 150}
          onFinish={handleFinishPress}
        />
      )}

      <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <Text className="mb-3 font-JakartaBold text-xl">Informações do Paciente</Text>

        <View className="mb-2">
          <Text className="font-JakartaMedium text-gray-500">Nome</Text>
          <Text className="font-JakartaSemiBold text-lg">{consultation.patient.name}</Text>
        </View>

        <View className="mb-2">
          <Text className="font-JakartaMedium text-gray-500">Endereço</Text>
          <Text className="font-Jakarta">{consultation.originAddress}</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.navigate({
              pathname: '/(doctor)/(tabs)/chat',
              params: { consultationId: consultation.consultationId },
            } as any)
          }
          className="mt-2 flex-row items-center justify-center rounded-full bg-primary-500 px-5 py-3">
          <Image source={icons.chat} className="mr-2 h-5 w-5" tintColor="white" />
          <Text className="font-JakartaBold text-white">Chat com Paciente</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <Text className="mb-3 font-JakartaBold text-xl">Queixa do Paciente</Text>
        <Text className="font-Jakarta">{consultation.complaint}</Text>
      </View>

      <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <Text className="mb-3 font-JakartaBold text-xl">Prontuário</Text>

        <View className="mb-4">
          <Text className="mb-2 font-JakartaSemiBold">Diagnóstico</Text>
          <TextInput
            className="rounded-lg bg-gray-100 p-3 font-Jakarta"
            placeholder="Digite o diagnóstico"
            value={diagnosis}
            onChangeText={setDiagnosis}
            multiline
            numberOfLines={3}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 font-JakartaSemiBold">Tratamento</Text>
          <TextInput
            className="rounded-lg bg-gray-100 p-3 font-Jakarta"
            placeholder="Digite o tratamento recomendado"
            value={treatment}
            onChangeText={setTreatment}
            multiline
            numberOfLines={3}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 font-JakartaSemiBold">Observações Adicionais</Text>
          <TextInput
            className="rounded-lg bg-gray-100 p-3 font-Jakarta"
            placeholder="Digite observações adicionais (opcional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <Text className="mb-3 font-JakartaBold text-xl">Ações</Text>

        {consultation.status === 'in_progress' && (
          <TouchableOpacity onPress={handleFinishPress} className="rounded-xl bg-success-500 p-3">
            <Text className="text-center font-JakartaBold text-white">Finalizar Consulta</Text>
          </TouchableOpacity>
        )}
      </View>

      <ReactNativeModal
        isVisible={showFinishModal}
        onBackdropPress={() => setShowFinishModal(false)}>
        <View className="rounded-xl bg-white p-5">
          <Text className="mb-3 text-center font-JakartaBold text-xl">Finalizar Consulta</Text>
          <Text className="mb-5 text-center">
            Você tem certeza que deseja finalizar esta consulta? O paciente será cobrado pelo tempo
            de atendimento.
          </Text>

          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setShowFinishModal(false)}
              className="mr-2 flex-1 rounded-full bg-gray-200 px-5 py-3">
              <Text className="text-center font-JakartaSemiBold">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmFinish}
              className="flex-1 rounded-full bg-success-500 px-5 py-3">
              <Text className="text-center font-JakartaSemiBold text-white">Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReactNativeModal>
    </ScrollView>
  );
};

export default ActiveConsultation;
