import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import LocationService from '../../../services/LocationService';
import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocationStore, useUserStore } from '../../../store';
import HomeHeader from '../../../components/HomeHeader';
import CustomButton from '../../../components/CustomButton';
import GoogleTextInput from '../../../components/GoogleTextInput';
import { images, icons } from '../../../constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

export default function Page() {
  const { userAddress, userLatitude, userLongitude, setUserLocation } = useLocationStore();
  const { userName, clearUserData } = useUserStore();
  const { signOut } = useAuth();
  const mapRef = useRef<MapView>(null);

  const handleSignOut = () => {
    clearUserData();
    signOut();
    router.replace('/(auth)/welcome');
  };

  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const locationService = LocationService.getInstance();
      const location = await locationService.getCurrentLocationWithFallback();
      setUserLocation(location);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      alert('Não foi possível obter sua localização. Por favor, digite o endereço manualmente.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRequestConsultation = () => {
    if (!userAddress) {
      alert('Por favor, selecione um endereço para o atendimento');
      return;
    }
    router.push('/(root)/request-consultation' as any);
  };

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const locationService = LocationService.getInstance();
        const location = await locationService.getCurrentLocationWithFallback();
        setUserLocation(location);
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        const locationService = LocationService.getInstance();
        const fallbackLocation = locationService.getFallbackLocation();
        setUserLocation(fallbackLocation);
      }
    };

    requestLocation();
  }, []);

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        <View className="absolute top-0 left-0 right-0 bottom-0">
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: userLatitude || -23.55052,
              longitude: userLongitude || -46.633308,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {userLatitude && userLongitude && (
              <Marker
                coordinate={{
                  latitude: userLatitude,
                  longitude: userLongitude,
                }}
                title="Sua localização"
              >
                <Image source={icons.pin} className="w-10 h-10" resizeMode="contain" />
              </Marker>
            )}
          </MapView>
        </View>

        <SafeAreaView className="flex-1" pointerEvents="box-none">
          <View className="px-5 pt-4">
            <HomeHeader userName={userName || 'Usuário'} onSignOut={handleSignOut} />
          </View>

          <View className="flex-1 justify-end pb-24 px-5" pointerEvents="box-none">
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
                    Solicitar Atendimento
                  </Text>
                  <Text className="mt-1 font-JakartaMedium text-xs text-gray-600">
                    Médico até você em minutos
                  </Text>
                </View>
              </View>

              <View className="mb-5">
                <GoogleTextInput
                  icon={icons.pin}
                  initialLocation={userAddress || 'Onde você precisa de atendimento?'}
                  containerStyle="bg-gray-50 border border-gray-100 rounded-xl"
                  textInputBackgroundColor="transparent"
                  handlePress={(location) => setUserLocation(location)}
                />

                <TouchableOpacity
                  onPress={handleUseCurrentLocation}
                  disabled={loadingLocation}
                  className="mt-3 flex-row items-center px-1"
                >
                  <Image source={icons.target} className="mr-2 h-4 w-4" tintColor="#4C7C68" />
                  <Text className="font-JakartaSemiBold text-sm text-primary-700">
                    {loadingLocation ? 'Buscando...' : 'Usar localização atual'}
                  </Text>
                </TouchableOpacity>
              </View>

              <CustomButton
                title="Continuar"
                onPress={handleRequestConsultation}
                className="w-full"
                disabled={!userAddress || loadingLocation}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}
