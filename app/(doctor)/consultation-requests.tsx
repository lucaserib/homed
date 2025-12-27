import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useConsultationNotifications } from '../../hooks/useConsultationNotifications';
import { useDoctorLocation, setDoctorAvailability } from '../../hooks/useDoctorLocation';
import { ConsultationService } from '../../services/ConsultationService';
import LocationService from '../../services/LocationService';
import { icons, images } from '../../constants';
import EmptyState from '../../components/EmptyState';

interface PendingConsultation {
  consultationId: string;
  patientId: string;
  patientName: string;
  patientProfileImage?: string;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  complaint?: string;
  createdAt: string;
}

export default function ConsultationRequestsScreen() {
  const { user } = useUser();
  const [isAvailable, setIsAvailable] = useState(false);
  const [consultations, setConsultations] = useState<PendingConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { socket, connected } = useWebSocket('doctor');
  const { newConsultations } = useConsultationNotifications(socket);

  useDoctorLocation(socket, user?.id || null, isAvailable);

  const loadConsultations = async () => {
    try {
      const locationService = LocationService.getInstance();
      const location = await locationService.getCurrentLocationWithFallback();
      
      // Fetch consultations within 20km (default)
      const data = await ConsultationService.getPendingConsultations(
        location.latitude,
        location.longitude,
        20
      );
      setConsultations(data.data || []);
    } catch (error) {
      console.error('Error loading consultations:', error);
      // Fallback to loading without location if location fails
      try {
        const data = await ConsultationService.getPendingConsultations();
        setConsultations(data.data || []);
      } catch (e) {
        console.error('Error loading consultations fallback:', e);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  useEffect(() => {
    if (newConsultations.length > 0) {
      loadConsultations();
    }
  }, [newConsultations]);

  const toggleAvailability = async () => {
    if (!user?.id) return;

    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);
    setDoctorAvailability(socket, user.id, newAvailability);

    if (newAvailability) {
      Alert.alert('Disponível', 'Você está disponível para receber pedidos de consulta');
    } else {
      Alert.alert('Indisponível', 'Você não receberá novos pedidos de consulta');
    }
  };

  const handleAccept = async (consultation: PendingConsultation) => {
    if (!user?.id) return;

    try {
      setProcessingId(consultation.consultationId);

      const locationService = LocationService.getInstance();
      const location = await locationService.getCurrentLocationWithFallback();

      await ConsultationService.acceptConsultation(consultation.consultationId, {
        doctorId: user.id,
        doctorLatitude: location.latitude,
        doctorLongitude: location.longitude,
      });

      Alert.alert('Sucesso!', 'Consulta aceita. O paciente foi notificado.');

      router.push({
        pathname: '/(doctor)/active-consultation',
        params: { id: consultation.consultationId },
      });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível aceitar a consulta');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (consultationId: string) => {
    if (!user?.id) return;

    try {
      setProcessingId(consultationId);
      await ConsultationService.declineConsultation(consultationId, user.id);
      await loadConsultations();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível recusar a consulta');
    } finally {
      setProcessingId(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConsultations();
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4C7C68" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="bg-primary-500 px-5 py-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-JakartaBold text-2xl text-white">Pedidos de Consulta</Text>
            <Text className="mt-1 font-JakartaMedium text-sm text-primary-100">
              {consultations.length} pedido(s) disponível(is)
            </Text>
          </View>
          <View className="flex-row items-center">
            <View
              className={`mr-2 h-3 w-3 rounded-full ${connected ? 'bg-success-400' : 'bg-danger-400'}`}
            />
            <Text className="font-JakartaSemiBold text-xs text-white">
              {connected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={toggleAvailability}
          className={`mt-4 flex-row items-center justify-center rounded-xl py-3 ${
            isAvailable ? 'bg-success-500' : 'bg-gray-400'
          }`}>
          <Image
            source={isAvailable ? icons.checkmark : icons.close}
            className="mr-2 h-5 w-5"
            tintColor="#FFFFFF"
          />
          <Text className="font-JakartaBold text-base text-white">
            {isAvailable ? 'Disponível' : 'Indisponível'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {consultations.length === 0 ? (
          <EmptyState
            title="Nenhum pedido no momento"
            description="Novos pedidos aparecerão aqui quando pacientes solicitarem atendimento"
            image={images.noResult}
          />
        ) : (
          consultations.map((consultation) => (
            <View
              key={consultation.consultationId}
              className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <View className="mb-4 flex-row items-center">
                <Image
                  source={
                    consultation.patientProfileImage
                      ? { uri: consultation.patientProfileImage }
                      : images.noResult
                  }
                  className="h-16 w-16 rounded-full"
                />
                <View className="ml-4 flex-1">
                  <Text className="font-JakartaBold text-lg text-gray-900">
                    {consultation.patientName}
                  </Text>
                  <Text className="mt-1 font-JakartaMedium text-sm text-gray-600">
                    Solicitado há {Math.floor((Date.now() - new Date(consultation.createdAt).getTime()) / 60000)} min
                  </Text>
                </View>
              </View>

              <View className="mb-4 rounded-xl bg-gray-50 p-3">
                <View className="mb-2 flex-row items-start">
                  <Image source={icons.pin} className="mr-2 mt-1 h-4 w-4" tintColor="#4C7C68" />
                  <Text className="flex-1 font-JakartaMedium text-sm text-gray-700">
                    {consultation.originAddress}
                  </Text>
                </View>

                {consultation.complaint && (
                  <View className="flex-row items-start">
                    <Image source={icons.chat} className="mr-2 mt-1 h-4 w-4" tintColor="#4C7C68" />
                    <Text className="flex-1 font-JakartaMedium text-sm text-gray-700">
                      {consultation.complaint}
                    </Text>
                  </View>
                )}
              </View>

              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Image source={icons.map} className="mr-2 h-5 w-5" tintColor="#4C7C68" />
                  <Text className="font-JakartaBold text-base text-primary-700">Ver Rota</Text>
                </View>
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => handleDecline(consultation.consultationId)}
                  disabled={processingId === consultation.consultationId}
                  className="flex-1 items-center rounded-xl border border-danger-300 bg-danger-50 py-3">
                  {processingId === consultation.consultationId ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <Text className="font-JakartaBold text-sm text-danger-600">Recusar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAccept(consultation)}
                  disabled={processingId === consultation.consultationId}
                  className="flex-1 items-center rounded-xl bg-primary-500 py-3">
                  {processingId === consultation.consultationId ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="font-JakartaBold text-sm text-white">Aceitar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
