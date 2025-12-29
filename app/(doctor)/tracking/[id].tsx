import { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import CustomButton from 'components/CustomButton';
import LoadingScreen from 'components/LoadingScreen';
import MapViewWithRoute from 'components/MapViewWithRoute';
import { ConsultationService } from 'services/ConsultationService';
import { useLocationStore } from 'store';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TrackingScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userLatitude, userLongitude } = useLocationStore();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const data = await ConsultationService.getConsultationDetails(id);
        setConsultation(data);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar a consulta');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id]);

  useEffect(() => {
    if (!userLatitude || !userLongitude || !consultation) return;

    const dist = calculateDistance(
      userLatitude,
      userLongitude,
      consultation.originLatitude,
      consultation.originLongitude
    );

    setDistance(dist);
    setCanStart(dist < 0.1);
  }, [userLatitude, userLongitude, consultation]);

  const handleStartConsultation = async () => {
    try {
      await ConsultationService.startConsultation(id);
      router.replace(`/(doctor)/active-consultation/${id}`);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível iniciar o atendimento');
    }
  };

  if (loading) return <LoadingScreen fullScreen />;

  if (!consultation || !userLatitude || !userLongitude) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="font-JakartaBold text-xl">Localização indisponível</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1">
      <MapViewWithRoute
        doctorLocation={{
          latitude: userLatitude,
          longitude: userLongitude,
        }}
        patientLocation={{
          latitude: consultation.originLatitude,
          longitude: consultation.originLongitude,
        }}
        showRoute={true}
        onRouteReady={(result) => {
          setDistance(result.distance);
          setDuration(result.duration);
        }}
      />

      <SafeAreaView className="absolute bottom-0 w-full">
        <View
          className="mx-5 mb-5 bg-white rounded-3xl p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="font-JakartaMedium text-xs text-gray-500">Distância</Text>
              <Text className="font-JakartaBold text-2xl text-gray-900">
                {distance?.toFixed(1) || '~'} km
              </Text>
            </View>
            <View>
              <Text className="font-JakartaMedium text-xs text-gray-500">
                Tempo estimado
              </Text>
              <Text className="font-JakartaBold text-2xl text-primary-500">
                {duration ? `${Math.round(duration)} min` : '~'}
              </Text>
            </View>
          </View>

          <CustomButton
            title={canStart ? 'Cheguei - Iniciar Atendimento' : 'Dirigindo até o paciente...'}
            onPress={handleStartConsultation}
            disabled={!canStart}
            bgVariant={canStart ? 'success' : 'light'}
          />

          {!canStart && (
            <Text className="font-JakartaMedium text-xs text-gray-500 text-center mt-2">
              Você poderá iniciar quando estiver a menos de 100m
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default TrackingScreen;
