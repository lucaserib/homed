import { useUser } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useConsultationNotifications } from '../../hooks/useConsultationNotifications';
import { ConsultationService } from '../../services/ConsultationService';
import { icons, images } from '../../constants';

interface ConsultationDetails {
  consultationId: string;
  status: string;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    profileImageUrl?: string;
    rating: number;
    latitude?: number;
    longitude?: number;
  };
}

export default function TrackingConsultationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [doctorLocation, setDoctorLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { socket, connected } = useWebSocket('patient');
  const {
    acceptedConsultation,
    consultationStarted,
    consultationCompleted,
    doctorLocation: realtimeDoctorLocation,
  } = useConsultationNotifications(socket);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const loadConsultation = async () => {
    if (!id) return;

    try {
      const response = await ConsultationService.getConsultationDetails(id);
      setConsultation(response.data);

      if (response.data.doctor?.latitude && response.data.doctor?.longitude) {
        setDoctorLocation({
          latitude: response.data.doctor.latitude,
          longitude: response.data.doctor.longitude,
        });
      }
    } catch (error) {
      console.error('Error loading consultation:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da consulta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultation();
  }, [id]);

  useEffect(() => {
    if (acceptedConsultation && acceptedConsultation.consultationId === id) {
      setEstimatedArrival(acceptedConsultation.estimatedArrival || null);
      loadConsultation();
    }
  }, [acceptedConsultation]);

  useEffect(() => {
    if (realtimeDoctorLocation) {
      setDoctorLocation({
        latitude: realtimeDoctorLocation.latitude,
        longitude: realtimeDoctorLocation.longitude,
      });
      setEstimatedArrival(realtimeDoctorLocation.estimatedArrival);
    }
  }, [realtimeDoctorLocation]);

  useEffect(() => {
    if (consultationStarted && consultationStarted.consultationId === id) {
      Alert.alert('Consulta Iniciada', 'O médico iniciou o atendimento');
    }
  }, [consultationStarted]);

  useEffect(() => {
    if (consultationCompleted && consultationCompleted.consultationId === id) {
      Alert.alert(
        'Consulta Finalizada',
        'O atendimento foi concluído. Obrigado por usar o HomeMD!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(root)/(tabs)/home'),
          },
        ],
      );
    }
  }, [consultationCompleted]);

  useEffect(() => {
    if (
      consultation &&
      doctorLocation &&
      mapRef.current &&
      consultation.status === 'accepted'
    ) {
      mapRef.current.fitToCoordinates(
        [
          {
            latitude: consultation.originLatitude,
            longitude: consultation.originLongitude,
          },
          doctorLocation,
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        },
      );
    }
  }, [doctorLocation, consultation]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4C7C68" />
        </View>
      </SafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-5">
          <Text className="font-JakartaBold text-xl text-gray-900">
            Consulta não encontrada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPending = consultation.status === 'pending';
  const isAccepted = consultation.status === 'accepted';
  const isInProgress = consultation.status === 'in_progress';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex-1">
        <View className="absolute left-0 right-0 top-0 z-10 bg-primary-500 px-5 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Image source={icons.backArrow} className="h-6 w-6" tintColor="#FFFFFF" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <View
                className={`mr-2 h-3 w-3 rounded-full ${connected ? 'bg-success-400' : 'bg-danger-400'}`}
              />
              <Text className="font-JakartaSemiBold text-xs text-white">
                {connected ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {isAccepted && doctorLocation ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            className="flex-1"
            initialRegion={{
              latitude: consultation.originLatitude,
              longitude: consultation.originLongitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}>
            <Marker
              coordinate={{
                latitude: consultation.originLatitude,
                longitude: consultation.originLongitude,
              }}
              title="Seu endereço"
              pinColor="red"
            />

            <Marker
              coordinate={doctorLocation}
              title={`Dr. ${consultation.doctor?.firstName}`}>
              <View className="items-center">
                <Animated.View
                  style={{
                    transform: [{ scale: pulseAnim }],
                  }}
                  className="absolute h-12 w-12 rounded-full bg-primary-300 opacity-50"
                />
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-500 border-4 border-white">
                  <Image source={icons.person} className="h-6 w-6" tintColor="#FFFFFF" />
                </View>
              </View>
            </Marker>

            {consultation.originLatitude &&
              consultation.originLongitude &&
              doctorLocation && (
                <MapViewDirections
                  origin={{
                    latitude: doctorLocation.latitude,
                    longitude: doctorLocation.longitude,
                  }}
                  destination={{
                    latitude: consultation.originLatitude,
                    longitude: consultation.originLongitude,
                  }}
                  apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY || ''}
                  strokeWidth={4}
                  strokeColor="#4C7C68"
                />
              )}
          </MapView>
        ) : (
          <View className="flex-1 items-center justify-center bg-gray-100">
            <Image source={images.noResult} className="mb-4 h-32 w-32" />
            <Text className="font-JakartaBold text-lg text-gray-900">
              {isPending ? 'Aguardando médico...' : 'Atendimento em andamento'}
            </Text>
          </View>
        )}

        <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-6 rounded-t-3xl shadow-lg">
          {isPending && (
            <View className="items-center">
              <ActivityIndicator size="large" color="#4C7C68" />
              <Text className="mt-4 font-JakartaBold text-lg text-gray-900">
                Procurando médicos disponíveis
              </Text>
              <Text className="mt-2 text-center font-JakartaMedium text-sm text-gray-600">
                Aguarde enquanto notificamos os médicos próximos a você
              </Text>
            </View>
          )}

          {(isAccepted || isInProgress) && consultation.doctor && (
            <>
              <View className="mb-4 flex-row items-center">
                <Image
                  source={
                    consultation.doctor.profileImageUrl
                      ? { uri: consultation.doctor.profileImageUrl }
                      : images.noResult
                  }
                  className="h-16 w-16 rounded-full"
                />
                <View className="ml-4 flex-1">
                  <Text className="font-JakartaBold text-lg text-gray-900">
                    Dr. {consultation.doctor.firstName} {consultation.doctor.lastName}
                  </Text>
                  <Text className="mt-1 font-JakartaMedium text-sm text-gray-600">
                    {consultation.doctor.specialty}
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <Image source={icons.star} className="mr-1 h-4 w-4" tintColor="#FBBF24" />
                    <Text className="font-JakartaBold text-sm text-gray-700">
                      {consultation.doctor.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>

              {estimatedArrival && isAccepted && (
                <View className="mb-4 rounded-xl bg-primary-50 p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-JakartaBold text-base text-primary-700">
                      Chegada estimada
                    </Text>
                    <Text className="font-JakartaBold text-2xl text-primary-700">
                      {estimatedArrival} min
                    </Text>
                  </View>
                </View>
              )}

              {isInProgress && (
                <View className="rounded-xl bg-success-50 p-4">
                  <Text className="text-center font-JakartaBold text-base text-success-700">
                    Atendimento em andamento
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
