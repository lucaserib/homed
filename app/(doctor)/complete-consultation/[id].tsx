import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import CustomButton from 'components/CustomButton';
import LoadingScreen from 'components/LoadingScreen';
import { ConsultationService } from 'services/ConsultationService';
import { MedicalRecordService } from 'services/MedicalRecordService';

const calculateFinalPrice = (startTime: string, hourlyRate: number): number => {
  const now = new Date();
  const start = new Date(startTime);
  const diffMs = now.getTime() - start.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  let price = hourlyRate;

  if (diffMin > 60) {
    const extraMin = diffMin - 60;
    price = hourlyRate + (extraMin / 60) * hourlyRate;
  }

  return price;
};

const CompleteConsultation = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
  });

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const data = await ConsultationService.getConsultationDetails(id);
        setConsultation(data);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id]);

  const handleSubmit = async () => {
    if (!form.diagnosis || !form.treatment) {
      Alert.alert('Atenção', 'Por favor, preencha diagnóstico e tratamento');
      return;
    }

    setSubmitting(true);

    try {
      await ConsultationService.completeConsultation(id);

      await MedicalRecordService.createRecord({
        consultationId: id,
        patientId: consultation.patientId,
        doctorId: consultation.doctorId,
        diagnosis: form.diagnosis,
        treatment: form.treatment,
        notes: form.notes,
      });

      const finalPrice = calculateFinalPrice(
        consultation.startTime,
        consultation.doctor?.hourlyRate || 100
      );

      Alert.alert(
        'Consulta Finalizada!',
        `Atendimento concluído com sucesso.\n\nValor: R$ ${finalPrice.toFixed(2)}`,
        [{ text: 'OK', onPress: () => router.replace('/(doctor)/(tabs)/dashboard') }]
      );
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível finalizar a consulta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen fullScreen />;

  if (!consultation) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="font-JakartaBold text-xl">Consulta não encontrada</Text>
      </SafeAreaView>
    );
  }

  const finalPrice = calculateFinalPrice(
    consultation.startTime || new Date().toISOString(),
    consultation.doctor?.hourlyRate || 100
  );

  const duration = consultation.startTime
    ? Math.floor((new Date().getTime() - new Date(consultation.startTime).getTime()) / 60000)
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5">
        <View
          className="mt-5 bg-green-50 rounded-2xl p-6 border-2 border-green-200"
          style={{
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}>
          <Text className="font-JakartaMedium text-sm text-green-700 text-center">
            Valor Total da Consulta
          </Text>
          <Text className="font-JakartaBold text-4xl text-green-600 text-center my-2">
            R$ {finalPrice.toFixed(2)}
          </Text>
          <Text className="font-JakartaMedium text-xs text-green-600 text-center">
            Duração: {duration} minutos
          </Text>
        </View>

        <View className="mt-6">
          <Text className="font-JakartaBold text-xl text-gray-900 mb-4">Prontuário Médico</Text>

          <View className="mb-4">
            <Text className="font-JakartaSemiBold text-sm text-gray-700 mb-2">
              Diagnóstico *
            </Text>
            <TextInput
              placeholder="Ex: Gripe comum, faringite..."
              value={form.diagnosis}
              onChangeText={(text) => setForm({ ...form, diagnosis: text })}
              multiline
              numberOfLines={3}
              className="bg-gray-50 rounded-xl p-4 font-JakartaMedium text-base text-gray-900 border border-gray-200"
              style={{ textAlignVertical: 'top' }}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-4">
            <Text className="font-JakartaSemiBold text-sm text-gray-700 mb-2">
              Tratamento/Prescrição *
            </Text>
            <TextInput
              placeholder="Medicamentos, repouso, orientações..."
              value={form.treatment}
              onChangeText={(text) => setForm({ ...form, treatment: text })}
              multiline
              numberOfLines={4}
              className="bg-gray-50 rounded-xl p-4 font-JakartaMedium text-base text-gray-900 border border-gray-200"
              style={{ textAlignVertical: 'top' }}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-4">
            <Text className="font-JakartaSemiBold text-sm text-gray-700 mb-2">
              Observações Adicionais
            </Text>
            <TextInput
              placeholder="Informações complementares..."
              value={form.notes}
              onChangeText={(text) => setForm({ ...form, notes: text })}
              multiline
              numberOfLines={3}
              className="bg-gray-50 rounded-xl p-4 font-JakartaMedium text-base text-gray-900 border border-gray-200"
              style={{ textAlignVertical: 'top' }}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-5 bg-white border-t border-gray-100">
        <CustomButton
          title={submitting ? 'Salvando...' : 'Concluir e Salvar'}
          onPress={handleSubmit}
          disabled={submitting}
          bgVariant="success"
          className="mt-4"
        />
      </View>
    </SafeAreaView>
  );
};

export default CompleteConsultation;
