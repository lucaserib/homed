import { useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';
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
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons, images } from '../../../constants';
import { fetchAPI } from 'lib/fetch';
import { useLocationStore } from 'store';
import { connectSocket, disconnectSocket } from 'lib/socket';

const DoctorDashboard = () => {
  const { user } = useUser();
  const { setUserLocation, userLatitude, userLongitude } = useLocationStore();
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const initialize = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização para receber chamados.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });

      // Fetch doctor profile to get availability status
      try {
        if (user?.emailAddresses[0]?.emailAddress) {
           const res = await fetchAPI(`/doctor/check?email=${encodeURIComponent(user.emailAddresses[0].emailAddress)}`);
           if (res.success && res.data) {
             setDoctorProfile(res.data);
             setIsAvailable(res.data.isAvailable);

             // Connect to WebSocket
             if (res.data.id) {
               const socket = connectSocket(res.data.id, 'doctor');
               
               socket.on('consultation:new', (data: any) => {
                 Alert.alert(
                   'Nova Solicitação',
                   `Paciente ${data.patientName} solicitou atendimento próximo a você.`,
                   [
                     {
                       text: 'Ver Detalhes',
                       onPress: () => router.push('/(doctor)/consultation-requests'),
                     },
                     {
                       text: 'Ignorar',
                       style: 'cancel',
                     },
                   ]
                 );
               });
             }
           }
        }
      } catch (error) {
        console.error("Error fetching doctor profile", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      disconnectSocket();
    };
  }, [user]);

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
      console.error("Error toggling availability", error);
      setIsAvailable(!newValue); // Revert on error
      Alert.alert("Erro", "Não foi possível atualizar sua disponibilidade.");
    }
  };

  if (loading || !userLatitude || !userLongitude) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4C7C68" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
          className="h-full w-full"
          showsUserLocation={true}
          userInterfaceStyle="light"
          initialRegion={{
            latitude: userLatitude || 0,
            longitude: userLongitude || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        />

        {/* Header Overlay */}
        <SafeAreaView className="absolute top-0 w-full px-5">
          <View className="flex flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-md shadow-neutral-200">
            <View className="flex flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100 overflow-hidden">
                <Image
                  source={{ uri: user?.imageUrl || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
                  className="h-full w-full"
                />
              </View>
              <View className="ml-3">
                <Text className="font-JakartaSemiBold text-lg text-gray-900">
                  Olá, Dr. {user?.firstName}
                </Text>
                <Text className={`text-sm font-JakartaMedium ${isAvailable ? 'text-green-500' : 'text-gray-500'}`}>
                  {isAvailable ? '● Online' : '○ Offline'}
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
        </SafeAreaView>

        {/* Bottom Status Overlay */}
        <View className="absolute bottom-24 w-full px-5">
          <View className="rounded-2xl bg-white p-5 shadow-lg shadow-neutral-300">
            <Text className="mb-2 font-JakartaBold text-xl text-gray-900">
              {isAvailable ? 'Aguardando chamados...' : 'Você está offline'}
            </Text>
            <Text className="font-Jakarta text-gray-500">
              {isAvailable 
                ? 'Fique atento, novos pacientes podem solicitar atendimento a qualquer momento.' 
                : 'Ative sua disponibilidade para começar a receber solicitações de consulta.'}
            </Text>
            
            {isAvailable && (
              <View className="mt-4 flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#4C7C68" className="mr-2" />
                <Text className="text-primary-500 font-JakartaMedium">Procurando pacientes na região...</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default DoctorDashboard;
