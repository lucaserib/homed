import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import CustomButton from 'components/CustomButton';
import TimerDisplay from 'components/TimerDisplay';
import LoadingScreen from 'components/LoadingScreen';
import { ConsultationService } from 'services/ConsultationService';

const ActiveConsultation = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const data = await ConsultationService.getConsultationDetails(id);
        setConsultation(data);
        if (data.doctor?.hourlyRate) {
          setCurrentPrice(data.doctor.hourlyRate);
        }
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id]);

  const handleTimerUpdate = (minutes: number, price: number) => {
    setElapsedMinutes(minutes);
    setCurrentPrice(price);
  };

  const handleComplete = () => {
    router.push(`/(doctor)/complete-consultation/${id}`);
  };

  if (loading) return <LoadingScreen fullScreen />;

  if (!consultation) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="font-JakartaBold text-xl">Consulta não encontrada</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5">
        <View className="mt-5">
          <TimerDisplay
            startTime={consultation.startTime || new Date().toISOString()}
            hourlyRate={consultation.doctor?.hourlyRate || 100}
            onUpdate={handleTimerUpdate}
          />
        </View>

        <View className="mt-6 bg-gray-50 rounded-2xl p-5">
          <Text className="font-JakartaBold text-lg text-gray-900 mb-4">
            Informações do Paciente
          </Text>

          <View className="mb-3">
            <Text className="font-JakartaMedium text-xs text-gray-500">Nome</Text>
            <Text className="font-JakartaSemiBold text-base text-gray-900">
              {consultation.patient?.name || 'Não informado'}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="font-JakartaMedium text-xs text-gray-500">Gênero</Text>
            <Text className="font-JakartaSemiBold text-base text-gray-900">
              {consultation.patient?.gender || 'Não informado'}
            </Text>
          </View>

          <View>
            <Text className="font-JakartaMedium text-xs text-gray-500">Idade</Text>
            <Text className="font-JakartaSemiBold text-base text-gray-900">
              {consultation.patient?.age || 'Não informado'}
            </Text>
          </View>
        </View>

        {consultation.complaint && (
          <View className="mt-6 bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
            <Text className="font-JakartaBold text-base text-gray-900 mb-2">
              Queixa Principal
            </Text>
            <Text className="font-JakartaMedium text-sm text-gray-700">
              {consultation.complaint}
            </Text>
          </View>
        )}

        {consultation.patient?.medicalHistory && (
          <View className="mt-6 bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <Text className="font-JakartaBold text-base text-gray-900 mb-2">
              Histórico Médico
            </Text>
            <Text className="font-JakartaMedium text-sm text-gray-700">
              {consultation.patient.medicalHistory}
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="px-5 pb-5 bg-white border-t border-gray-100">
        <CustomButton
          title="Finalizar Atendimento"
          onPress={handleComplete}
          bgVariant="danger"
          className="mt-4"
        />
      </View>
    </SafeAreaView>
  );
};

export default ActiveConsultation;
