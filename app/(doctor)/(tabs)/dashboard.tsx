import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { icons } from '../../../constants';
import { fetchAPI } from 'lib/fetch';
import { useLocationStore } from 'store';
import { connectSocket, disconnectSocket } from 'lib/socket';
import StatCard from 'components/StatCard';
import { useDoctorStats } from 'hooks/useDoctorStats';
import { useDoctorConsultations } from 'hooks/useDoctorConsultations';
import ConsultationRequestModal from 'components/ConsultationRequestModal';
import { calculateDistance } from 'lib/map';
import LocationService from 'services/LocationService';

const DoctorDashboard = () => {
  const { user } = useUser();
  const { setUserLocation, userLatitude, userLongitude } = useLocationStore();

  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);

  const mapRef = useRef<MapView>(null);

  const { stats, loading: statsLoading } = useDoctorStats(doctorProfile?.id || '');
  const { consultations: activeConsultations } = useDoctorConsultations(
    doctorProfile?.id || '',
    'in_progress'
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        const locationService = LocationService.getInstance();
        const location = await locationService.getCurrentLocationWithFallback();
        setUserLocation(location);

        if (user?.emailAddresses[0]?.emailAddress) {
          const res = await fetchAPI(
            `/doctor/check?email=${encodeURIComponent(user.emailAddresses[0].emailAddress)}`
          );
          if (res.success && res.data) {
            setDoctorProfile(res.data);
            setIsAvailable(res.data.isAvailable);

            if (res.data.id) {
              const socket = connectSocket(res.data.id, 'doctor');

              socket.on('consultation:new', (data: any) => {
                let distance = 0;

                if (userLatitude && userLongitude) {
                  distance = calculateDistance(
                    { lat: userLatitude, lng: userLongitude },
                    { lat: data.originLatitude, lng: data.originLongitude }
                  );
                }

                setCurrentRequest({ ...data, distance });
                setModalVisible(true);
              });

              socket.on('consultation:timeout', (data: any) => {
                if (currentRequest?.consultationId === data.consultationId) {
                  setModalVisible(false);
                  setCurrentRequest(null);
                }
              });

              socket.on('consultation:cancelled', () => {
                setModalVisible(false);
                setCurrentRequest(null);
                Alert.alert('Cancelada', 'O paciente cancelou a solicitação');
              });
            }
          }
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        Alert.alert('Erro', 'Não foi possível carregar o dashboard. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      disconnectSocket();
    };
  }, [user]);

  useEffect(() => {
    if (userLatitude && userLongitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLatitude, userLongitude]);

  const toggleAvailability = async () => {
    const newValue = !isAvailable;
    setIsAvailable(newValue);

    try {
      if (doctorProfile?.id) {
        await fetchAPI(`/doctor/${doctorProfile.id}/toggle-availability`, {
          method: 'PUT',
          body: JSON.stringify({ isAvailable: newValue }),
        });
      }
    } catch (error) {
      console.error('Error toggling availability', error);
      setIsAvailable(!newValue);
      Alert.alert('Erro', 'Não foi possível atualizar sua disponibilidade.');
    }
  };

  const handleAcceptConsultation = () => {
    if (currentRequest) {
      setModalVisible(false);
      router.push(`/(doctor)/consultation-request/${currentRequest.consultationId}`);
      setCurrentRequest(null);
    }
  };

  const handleDeclineConsultation = () => {
    setModalVisible(false);
    setCurrentRequest(null);
  };

  const handleTimeout = () => {
    setModalVisible(false);
    setCurrentRequest(null);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4C7C68" />
        <Text className="mt-4 font-JakartaMedium text-gray-600">Carregando...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        <View className="absolute top-0 left-0 right-0 bottom-0">
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: userLatitude || -23.55052,
              longitude: userLongitude || -46.633308,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          />
        </View>

        <SafeAreaView className="flex-1" pointerEvents="box-none">
          <View className="px-5 pt-4">
            <View className="flex flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-md shadow-neutral-200">
              <View className="flex flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100 overflow-hidden">
                  <Image
                    source={{
                      uri:
                        user?.imageUrl ||
                        doctorProfile?.profileImageUrl ||
                        'https://images.unsplash.com/photo-1537368910025-700350fe46c7',
                    }}
                    className="h-full w-full"
                  />
                </View>
                <View className="ml-3">
                  <Text className="font-JakartaSemiBold text-lg text-gray-900">
                    Dr. {doctorProfile?.firstName || 'Médico'}
                  </Text>
                  <Text
                    className={`text-sm font-JakartaMedium ${isAvailable ? 'text-green-500' : 'text-gray-500'}`}>
                    {isAvailable ? '● Disponível' : '○ Indisponível'}
                  </Text>
                </View>
              </View>

              <View className="items-center">
                <Switch
                  trackColor={{ false: '#767577', true: '#4C7C68' }}
                  thumbColor={isAvailable ? '#f4f3f4' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleAvailability}
                  value={isAvailable}
                />
              </View>
            </View>
          </View>

          <View
            className="flex-1 justify-end px-5"
            style={{ paddingBottom: Platform.OS === 'ios' ? 120 : 95 }}
            pointerEvents="box-none"
          >
            <View
              className="rounded-3xl bg-white px-5 py-6 shadow-lg shadow-black/10"
              style={{ elevation: 5 }}
            >
              <View className="mb-5 flex-row items-center">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary-500">
                  <Image source={icons.home} className="h-7 w-7" tintColor="#FFFFFF" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-JakartaBold text-lg text-gray-900">
                    Dashboard
                  </Text>
                  <Text className="mt-1 font-JakartaMedium text-xs text-gray-600">
                    {doctorProfile?.specialty || 'Médico'}
                    {doctorProfile?.licenseNumber ? ` • CRM ${doctorProfile.licenseNumber}` : ''}
                  </Text>
                </View>
              </View>

              {isAvailable ? (
                <View>
                  {!statsLoading && (
                    <View className="flex-row mb-4 gap-3">
                      <StatCard
                        icon={icons.calendar}
                        title="Hoje"
                        value={stats.todayConsultations}
                        color="primary"
                      />
                      <StatCard
                        icon={icons.dollar}
                        title="Mês"
                        value={`R$ ${stats.monthEarnings.toFixed(0)}`}
                        color="success"
                      />
                      <StatCard
                        icon={icons.star}
                        title="Rating"
                        value={stats.rating.toFixed(1)}
                        color="warning"
                      />
                    </View>
                  )}

                  {activeConsultations.length > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          `/(doctor)/active-consultation/${activeConsultations[0].consultationId}`
                        )
                      }
                      className="bg-primary-50 rounded-xl p-4 border-2 border-primary-200 mb-3">
                      <Text className="font-JakartaBold text-sm text-primary-700">
                        Consulta em Andamento
                      </Text>
                      <Text className="font-JakartaMedium text-xs text-gray-600 mt-1">
                        {activeConsultations[0].patient?.name || 'Paciente'}
                      </Text>
                      <Text className="font-JakartaSemiBold text-xs text-primary-600 mt-2">
                        Continuar Atendimento →
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#4C7C68" className="mr-2" />
                    <Text className="text-primary-500 font-JakartaMedium text-sm">
                      Aguardando chamados...
                    </Text>
                  </View>
                </View>
              ) : (
                <View>
                  <Text className="mb-2 font-JakartaBold text-xl text-gray-900">Você está offline</Text>
                  <Text className="font-Jakarta text-gray-500 mb-3">
                    Ative sua disponibilidade para começar a receber solicitações de consulta.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>

        {currentRequest && (
          <ConsultationRequestModal
            visible={modalVisible}
            consultationId={currentRequest.consultationId}
            patientName={currentRequest.patientName}
            originAddress={currentRequest.originAddress}
            originLatitude={currentRequest.originLatitude}
            originLongitude={currentRequest.originLongitude}
            complaint={currentRequest.complaint}
            distance={currentRequest.distance}
            expiresAt={currentRequest.expiresAt}
            timeoutSeconds={currentRequest.timeoutSeconds}
            onAccept={handleAcceptConsultation}
            onDecline={handleDeclineConsultation}
            onTimeout={handleTimeout}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

export default DoctorDashboard;
