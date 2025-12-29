import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { icons } from 'constants';
import CustomButton from 'components/CustomButton';
import LoadingScreen from 'components/LoadingScreen';
import StatusBadge from 'components/StatusBadge';
import { ConsultationService } from 'services/ConsultationService';
import { useLocationStore } from 'store';
import { openGoogleMaps, openWaze } from 'lib/navigation';

const ConsultationRequest = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const { userLatitude, userLongitude } = useLocationStore();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const data = await ConsultationService.getConsultationDetails(id);
        setConsultation(data);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar a consulta');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id]);

  const handleExportToMaps = () => {
    if (consultation) {
      openGoogleMaps(consultation.originLatitude, consultation.originLongitude);
    }
  };

  const handleExportToWaze = () => {
    if (consultation) {
      openWaze(consultation.originLatitude, consultation.originLongitude);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await ConsultationService.acceptConsultation(id, {
        doctorId: user?.id || '',
        doctorLatitude: userLatitude || 0,
        doctorLongitude: userLongitude || 0,
      });

      Alert.alert(
        'Consulta Aceita!',
        'Você aceitou a solicitação. Dirija-se ao endereço do paciente.',
        [{ text: 'OK', onPress: () => router.replace(`/(doctor)/tracking/${id}`) }]
      );
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível aceitar a consulta');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Recusar Consulta',
      'Tem certeza que deseja recusar esta solicitação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ConsultationService.declineConsultation(id, user?.id || '');
              Alert.alert('Recusado', 'Consulta recusada com sucesso', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível recusar');
            }
          },
        },
      ]
    );
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
      <ScrollView className="flex-1">
        <View
          className="mx-5 mt-5 bg-primary-50 rounded-3xl p-6 border-2 border-primary-200"
          style={{
            shadowColor: '#4C7C68',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}>
          <View className="flex-row items-center mb-4">
            <View className="h-16 w-16 rounded-full overflow-hidden bg-white mr-4">
              <Image
                source={{
                  uri: consultation.patient?.image || 'https://via.placeholder.com/100',
                }}
                className="h-full w-full"
              />
            </View>
            <View className="flex-1">
              <Text className="font-JakartaBold text-xl text-gray-900">
                {consultation.patient?.name || 'Paciente'}
              </Text>
              <StatusBadge status={consultation.status} size="sm" />
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-3">
            <View className="flex-row items-start mb-3">
              <Image source={icons.map} className="h-5 w-5 mr-3 mt-1" tintColor="#4C7C68" />
              <View className="flex-1">
                <Text className="font-JakartaMedium text-xs text-gray-500">Endereço</Text>
                <Text className="font-JakartaSemiBold text-sm text-gray-900">
                  {consultation.originAddress}
                </Text>
              </View>
            </View>

            {consultation.distance !== undefined && (
              <View className="flex-row items-center">
                <Image source={icons.target} className="h-5 w-5 mr-3" tintColor="#10B981" />
                <View className="flex-1">
                  <Text className="font-JakartaMedium text-xs text-gray-500">Distância</Text>
                  <Text className="font-JakartaBold text-sm text-green-600">
                    {consultation.distance?.toFixed(1) || '~'} km de você
                  </Text>
                </View>
              </View>
            )}
          </View>

          {consultation.complaint && (
            <View className="bg-white rounded-2xl p-4">
              <Text className="font-JakartaMedium text-xs text-gray-500 mb-2">
                Queixa Principal
              </Text>
              <Text className="font-JakartaMedium text-base text-gray-900">
                {consultation.complaint}
              </Text>
            </View>
          )}
        </View>

        <View className="px-5 mt-6">
          <Text className="font-JakartaBold text-lg text-gray-900 mb-3">Exportar Endereço</Text>

          <View className="flex-row mb-4">
            <CustomButton
              title="Google Maps"
              onPress={handleExportToMaps}
              bgVariant="light"
              textVariant="primary"
              className="flex-1 mr-2"
              IconLeft={() => (
                <Image source={icons.map} className="h-5 w-5 mr-2" tintColor="#4C7C68" />
              )}
            />
            <CustomButton
              title="Waze"
              onPress={handleExportToWaze}
              bgVariant="light"
              textVariant="primary"
              className="flex-1 ml-2"
              IconLeft={() => (
                <Image source={icons.target} className="h-5 w-5 mr-2" tintColor="#4C7C68" />
              )}
            />
          </View>
        </View>

        <View className="px-5 mt-4 mb-8">
          <CustomButton
            title={accepting ? 'Aceitando...' : 'Aceitar Consulta'}
            onPress={handleAccept}
            disabled={accepting}
            bgVariant="success"
            className="mb-3"
          />
          <CustomButton
            title="Recusar"
            onPress={handleDecline}
            bgVariant="outline"
            textVariant="danger"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConsultationRequest;
