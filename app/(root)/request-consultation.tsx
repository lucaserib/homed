import CustomButton from '../../components/CustomButton';
import GoogleTextInput from '../../components/GoogleTextInput';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View, TextInput, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationStore } from '../../store';
import { useUser } from '@clerk/clerk-expo';
import { ConsultationService } from '../../services/ConsultationService';
import { icons } from '../../constants';

const RequestConsultation = () => {
  const { user } = useUser();
  const { userAddress, userLatitude, userLongitude, setUserLocation } = useLocationStore();
  const [complaint, setComplaint] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'urgent'>('normal');
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!complaint.trim()) {
      alert('Por favor, descreva seus sintomas');
      return;
    }

    if (!user?.id || !userLatitude || !userLongitude) {
      alert('Erro ao obter suas informações. Tente novamente.');
      return;
    }

    setLoading(true);

    try {
      const fullComplaint = additionalNotes.trim()
        ? `${complaint.trim()}\n\nObservações: ${additionalNotes.trim()}`
        : complaint.trim();

      const fullAddress = addressComplement.trim()
        ? `${userAddress} - ${addressComplement.trim()}`
        : userAddress;

      const response = await ConsultationService.createConsultation({
        patientId: user.id,
        originAddress: fullAddress || userAddress || 'Endereço não informado',
        originLatitude: userLatitude,
        originLongitude: userLongitude,
        complaint: fullComplaint,
      });

      if (response.data?.consultationId) {
        Alert.alert(
          'Solicitação Enviada!',
          'Aguarde enquanto localizamos um médico próximo a você.',
          [
            {
              text: 'Acompanhar',
              onPress: () => {
                router.replace({
                  pathname: '/(root)/tracking-consultation',
                  params: { id: response.data.consultationId },
                });
              },
            },
          ]
        );
      } else {
        throw new Error('Erro ao criar consulta');
      }
    } catch (error: any) {
      console.error('Error creating consultation:', error);
      Alert.alert('Erro', error.message || 'Não foi possível solicitar a consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="h-full bg-gray-50" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View
        className="flex-row items-center border-b border-gray-200 bg-white px-5 py-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-gray-50"
          activeOpacity={0.7}>
          <Image source={icons.backArrow} className="h-5 w-5" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="font-JakartaBold text-xl text-gray-900">
            Solicitar Atendimento
          </Text>
          <Text className="font-JakartaMedium text-xs text-gray-500 mt-0.5">
            Preencha os detalhes para encontrar um médico
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>

        <View className="px-6 pt-6">
          {/* Location Section */}
          <View className="mb-6" style={{ zIndex: 100 }}>
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary-50 mr-2">
                  <Image source={icons.pin} className="h-4 w-4" tintColor="#4C7C68" />
                </View>
                <Text className="font-JakartaBold text-base text-gray-900">
                  Onde você está?
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddressInput(!showAddressInput)}
                activeOpacity={0.7}
                className="rounded-lg bg-primary-50 px-3 py-1.5">
                <Text className="font-JakartaSemiBold text-xs text-primary-700">
                  {showAddressInput ? 'Cancelar' : 'Alterar Local'}
                </Text>
              </TouchableOpacity>
            </View>

            {showAddressInput ? (
              <View
                className="rounded-xl border border-gray-200 bg-white"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                <GoogleTextInput
                  icon={icons.target}
                  initialLocation={userAddress || "Digite o endereço"}
                  containerStyle=""
                  textInputBackgroundColor="#FFFFFF"
                  handlePress={(location) => {
                    setUserLocation(location);
                    setShowAddressInput(false);
                  }}
                />
              </View>
            ) : (
              <View
                className="rounded-2xl border border-primary-100 bg-white p-4"
                style={{
                  shadowColor: '#4C7C68',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                <View className="flex-row items-start">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                    <Image source={icons.pin} className="h-5 w-5" tintColor="#4C7C68" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-JakartaSemiBold text-sm text-gray-900 mb-1">
                      Endereço Atual
                    </Text>
                    <Text className="font-JakartaMedium text-xs text-gray-600 leading-4">
                      {userAddress || "Localizando..."}
                    </Text>
                  </View>
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-success-100">
                    <Image source={icons.checkmark} className="h-3 w-3" tintColor="#38A169" />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Address Complement */}
          <View className="mb-6">
            <Text className="mb-3 font-JakartaBold text-base text-gray-900">
              Complemento <Text className="text-gray-400 font-JakartaMedium text-sm">(Opcional)</Text>
            </Text>
            <View
              className="rounded-xl border border-gray-200 bg-white p-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <TextInput
                className="font-JakartaMedium text-sm text-gray-900"
                placeholder="Ex: Apto 101, Bloco B, Portão Azul..."
                placeholderTextColor="#9CA3AF"
                value={addressComplement}
                onChangeText={setAddressComplement}
              />
            </View>
          </View>

          {/* Urgency Level */}
          <View className="mb-6">
             <View className="mb-3 flex-row items-center">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary-50 mr-2">
                  <Text className="text-lg">⚡</Text>
                </View>
                <Text className="font-JakartaBold text-base text-gray-900">
                  Nível de Urgência
                </Text>
              </View>

            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setUrgencyLevel('normal')}
                activeOpacity={0.7}
                className={`mr-3 flex-1 rounded-xl border-2 p-4 ${
                  urgencyLevel === 'normal' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'
                }`}
                style={{
                  shadowColor: urgencyLevel === 'normal' ? '#4C7C68' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: urgencyLevel === 'normal' ? 0.1 : 0.03,
                  shadowRadius: 8,
                  elevation: urgencyLevel === 'normal' ? 4 : 2,
                }}>
                <Text className={`font-JakartaBold text-base mb-1 ${
                  urgencyLevel === 'normal' ? 'text-primary-700' : 'text-gray-900'
                }`}>
                  Normal
                </Text>
                <Text className={`font-JakartaMedium text-xs ${
                  urgencyLevel === 'normal' ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  Atendimento de rotina
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setUrgencyLevel('urgent')}
                activeOpacity={0.7}
                className={`ml-3 flex-1 rounded-xl border-2 p-4 ${
                  urgencyLevel === 'urgent' ? 'border-warning-500 bg-warning-50' : 'border-gray-200 bg-white'
                }`}
                style={{
                  shadowColor: urgencyLevel === 'urgent' ? '#EAB308' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: urgencyLevel === 'urgent' ? 0.15 : 0.03,
                  shadowRadius: 8,
                  elevation: urgencyLevel === 'urgent' ? 4 : 2,
                }}>
                <Text className={`font-JakartaBold text-base mb-1 ${
                  urgencyLevel === 'urgent' ? 'text-warning-700' : 'text-gray-900'
                }`}>
                  Urgente
                </Text>
                <Text className={`font-JakartaMedium text-xs ${
                  urgencyLevel === 'urgent' ? 'text-warning-600' : 'text-gray-500'
                }`}>
                  Prioridade alta
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Symptoms Section */}
          <View className="mb-6">
            <View className="mb-3 flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary-50 mr-2">
                <Image source={icons.list} className="h-4 w-4" tintColor="#4C7C68" />
              </View>
              <Text className="font-JakartaBold text-base text-gray-900">
                O que você está sentindo? *
              </Text>
            </View>
            <View
              className="rounded-xl border border-gray-200 bg-white p-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <TextInput
                className="font-JakartaMedium text-sm text-gray-900 min-h-[120px]"
                placeholder="Descreva seus sintomas detalhadamente. Ex: Febre alta, dor de cabeça..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                value={complaint}
                onChangeText={setComplaint}
                textAlignVertical="top"
              />
            </View>
            <View className="mt-2 flex-row items-center justify-between px-1">
              <Text className="text-xs font-JakartaMedium text-gray-500">
                Mínimo de 10 caracteres
              </Text>
              {complaint.trim() && (
                <Text className="font-JakartaSemiBold text-xs text-primary-600">
                  {complaint.trim().length} caracteres
                </Text>
              )}
            </View>
          </View>

          {/* Additional Notes */}
          <View className="mb-6">
            <Text className="mb-3 font-JakartaBold text-base text-gray-900">
              Histórico Médico <Text className="text-gray-400 font-JakartaMedium text-sm">(Opcional)</Text>
            </Text>
            <View
              className="rounded-xl border border-gray-200 bg-white p-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <TextInput
                className="font-JakartaMedium text-sm text-gray-900 min-h-[80px]"
                placeholder="Alergias, medicamentos em uso, condições crônicas..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Info Alert */}
          <View
            className="mb-6 rounded-2xl border border-primary-200 bg-primary-50 p-4"
            style={{
              shadowColor: '#4C7C68',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View className="flex-row items-start">
              <View
                className="h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                <Image source={icons.search} className="h-4 w-4" tintColor="#4C7C68" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-JakartaBold text-sm mb-1 text-primary-800">
                  Como funciona?
                </Text>
                <Text className="font-JakartaMedium text-xs leading-4 text-primary-700">
                  Ao solicitar, notificaremos os médicos num raio de 20km. O primeiro a aceitar irá até você.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-5"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        }}>
        <CustomButton
          title={loading ? 'Solicitando...' : 'Encontrar Médico'}
          onPress={handleContinue}
          bgVariant="primary"
          disabled={!complaint.trim() || loading}
          IconLeft={loading ? () => <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
        />
      </View>
    </SafeAreaView>
  );
};

export default RequestConsultation;
