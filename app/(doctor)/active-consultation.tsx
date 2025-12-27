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
  Linking,
  Platform,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <View
      className="mb-5 rounded-2xl bg-white p-5 border border-gray-100"
      style={{
        shadowColor: '#4C7C68',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}>
      <Text className="mb-2 text-center font-JakartaBold text-lg text-gray-500 uppercase tracking-wider">Tempo de Consulta</Text>

      <Text className="mb-2 text-center font-JakartaExtraBold text-4xl text-primary-700">
        {formatTime(elapsedTime)}
      </Text>

      <Text className="mb-6 text-center font-JakartaMedium text-gray-600 bg-gray-50 py-2 px-4 rounded-full self-center overflow-hidden">
        Valor estimado: <Text className="font-JakartaBold text-gray-900">R$ {estimatedCost.toFixed(2)}</Text>
      </Text>

      <View className="flex-row justify-between gap-3">
        <TouchableOpacity
          onPress={togglePause}
          className={`flex-1 rounded-xl py-3.5 border-2 ${
            isPaused
              ? 'bg-primary-500 border-primary-500'
              : 'bg-white border-gray-200'
          }`}>
          <Text
            className={`text-center font-JakartaBold text-base ${
              isPaused ? 'text-white' : 'text-gray-700'
            }`}>
            {isPaused ? 'Continuar' : 'Pausar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFinish}
          className="flex-1 rounded-xl bg-success-500 py-3.5 border-2 border-success-500 shadow-sm">
          <Text className="text-center font-JakartaBold text-base text-white">Finalizar</Text>
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
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4C7C68" />
      </SafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center p-5">
        <Image source={icons.close} className="h-16 w-16 mb-4" tintColor="#9CA3AF" />
        <Text className="mb-4 text-center font-JakartaSemiBold text-lg text-gray-600">
          Consulta não encontrada ou não disponível
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-primary-500 px-8 py-3 shadow-md">
          <Text className="font-JakartaBold text-white">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-gray-50 rounded-xl">
          <Image source={icons.backArrow} className="h-5 w-5" />
        </TouchableOpacity>
        <Text className="font-JakartaBold text-xl text-gray-900">Consulta em Andamento</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 40 }}>
        {consultation.startTime && (
          <ConsultationTimer
            startTime={consultation.startTime}
            hourlyRate={consultation.doctor?.hourlyRate || 150}
            onFinish={handleFinishPress}
          />
        )}

        <View className="mb-5 rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-JakartaBold text-lg text-gray-900">Paciente</Text>
            <View className="bg-primary-50 px-3 py-1 rounded-full">
              <Text className="text-xs font-JakartaBold text-primary-700">Em atendimento</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="h-12 w-12 rounded-full bg-gray-200 items-center justify-center mr-4">
               <Image source={icons.person} className="h-6 w-6" tintColor="#6B7280" />
            </View>
            <View>
              <Text className="font-JakartaBold text-lg text-gray-900">{consultation.patient.name}</Text>
              <Text className="font-JakartaMedium text-sm text-gray-500">Paciente</Text>
            </View>
          </View>

          <View className="mb-4 bg-gray-50 p-3 rounded-xl">
            <View className="flex-row items-start">
              <Image source={icons.pin} className="h-4 w-4 mt-0.5 mr-2" tintColor="#4C7C68" />
              <Text className="flex-1 font-JakartaMedium text-sm text-gray-700 leading-5">
                {consultation.originAddress}
              </Text>
            </View>

            <View className="mt-3 flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                  const latLng = `${consultation.originLatitude},${consultation.originLongitude}`;
                  const label = consultation.originAddress;
                  const url = Platform.select({
                    ios: `${scheme}${label}@${latLng}`,
                    android: `${scheme}${latLng}(${label})`
                  });
                  if (url) Linking.openURL(url);
                }}
                className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-100 py-2">
                <Image source={icons.map} className="mr-2 h-4 w-4" tintColor="#3B82F6" />
                <Text className="font-JakartaSemiBold text-sm text-blue-600">Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const url = `waze://?ll=${consultation.originLatitude},${consultation.originLongitude}&navigate=yes`;
                  Linking.openURL(url).catch(() => {
                    Alert.alert('Erro', 'Waze não está instalado');
                  });
                }}
                className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-100 py-2">
                <Image source={icons.map} className="mr-2 h-4 w-4" tintColor="#3B82F6" />
                <Text className="font-JakartaSemiBold text-sm text-blue-600">Waze</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.navigate({
                pathname: '/(doctor)/(tabs)/chat',
                params: { consultationId: consultation.consultationId },
              } as any)
            }
            className="flex-row items-center justify-center rounded-xl bg-primary-500 px-5 py-3.5 shadow-sm">
            <Image source={icons.chat} className="mr-2 h-5 w-5" tintColor="white" />
            <Text className="font-JakartaBold text-white text-base">Chat com Paciente</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5 rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="h-8 w-8 rounded-lg bg-orange-50 items-center justify-center mr-3">
              <Image source={icons.list} className="h-4 w-4" tintColor="#F97316" />
            </View>
            <Text className="font-JakartaBold text-lg text-gray-900">Queixa Principal</Text>
          </View>
          <Text className="font-JakartaMedium text-gray-700 leading-6 bg-gray-50 p-4 rounded-xl">
            {consultation.complaint}
          </Text>
        </View>

        <View className="mb-5 rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="h-8 w-8 rounded-lg bg-blue-50 items-center justify-center mr-3">
              <Image source={icons.document} className="h-4 w-4" tintColor="#3B82F6" />
            </View>
            <Text className="font-JakartaBold text-lg text-gray-900">Prontuário Médico</Text>
          </View>

          <View className="mb-4">
            <Text className="mb-2 font-JakartaSemiBold text-gray-700 ml-1">Diagnóstico</Text>
            <TextInput
              className="rounded-xl bg-gray-50 p-4 font-JakartaMedium text-gray-900 min-h-[80px] border border-gray-200 focus:border-primary-500"
              placeholder="Descreva o diagnóstico clínico..."
              placeholderTextColor="#9CA3AF"
              value={diagnosis}
              onChangeText={setDiagnosis}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 font-JakartaSemiBold text-gray-700 ml-1">Tratamento</Text>
            <TextInput
              className="rounded-xl bg-gray-50 p-4 font-JakartaMedium text-gray-900 min-h-[80px] border border-gray-200 focus:border-primary-500"
              placeholder="Prescrições e orientações..."
              placeholderTextColor="#9CA3AF"
              value={treatment}
              onChangeText={setTreatment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View className="mb-2">
            <Text className="mb-2 font-JakartaSemiBold text-gray-700 ml-1">Observações (Opcional)</Text>
            <TextInput
              className="rounded-xl bg-gray-50 p-4 font-JakartaMedium text-gray-900 min-h-[80px] border border-gray-200 focus:border-primary-500"
              placeholder="Notas adicionais..."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View className="mb-8">
          {consultation.status === 'in_progress' && (
            <TouchableOpacity
              onPress={handleFinishPress}
              className="rounded-xl bg-success-500 p-4 shadow-md active:bg-success-600">
              <Text className="text-center font-JakartaBold text-white text-lg">Finalizar Consulta</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <ReactNativeModal
        isVisible={showFinishModal}
        onBackdropPress={() => setShowFinishModal(false)}
        useNativeDriver
        hideModalContentWhileAnimating>
        <View className="rounded-3xl bg-white p-6">
          <View className="items-center mb-4">
            <View className="h-16 w-16 rounded-full bg-success-50 items-center justify-center mb-4">
              <Image source={icons.checkmark} className="h-8 w-8" tintColor="#38A169" />
            </View>
            <Text className="text-center font-JakartaBold text-xl text-gray-900">Finalizar Atendimento?</Text>
          </View>
          
          <Text className="mb-6 text-center font-JakartaMedium text-gray-600 leading-5">
            Confirme se deseja encerrar a consulta. O valor será calculado e o paciente notificado.
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowFinishModal(false)}
              className="flex-1 rounded-xl bg-gray-100 py-3.5 border border-gray-200">
              <Text className="text-center font-JakartaBold text-gray-700">Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmFinish}
              className="flex-1 rounded-xl bg-success-500 py-3.5 shadow-sm">
              <Text className="text-center font-JakartaBold text-white">Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReactNativeModal>
    </SafeAreaView>
  );
};

export default ActiveConsultation;
