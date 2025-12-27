// LocationService.ts - Location service following JhaguarClean best practices

import * as Location from 'expo-location';

interface LocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

const SAO_PAULO_FALLBACK: LocationResult = {
  latitude: -23.55052,
  longitude: -46.633308,
  address: 'São Paulo, SP (localização de fallback)',
};

class LocationService {
  private static instance: LocationService;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async getCurrentLocation(): Promise<LocationResult> {
    try {
      console.log('🔄 Iniciando solicitação de localização...');

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Status da permissão:', status);

      if (status !== 'granted') {
        console.log('❌ Permissão de localização negada');
        throw new Error('Location permission denied');
      }

      console.log('📍 Obtendo posição atual...');

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      console.log('📍 Localização obtida:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      // Use Expo's reverse geocode
      const address = await this.reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      console.log('✅ Localização do usuário atualizada com sucesso');

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      };

    } catch (error) {
      console.error('❌ Erro ao obter localização:', error);
      throw error;
    }
  }

  private async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      console.log('📍 Obtendo endereço via reverse geocode...');

      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const addressString = `${addr?.name || ''}, ${addr?.street || ''}, ${addr?.city || ''}, ${addr?.region || ''}`
          .replace(/, ,/g, ',')
          .replace(/^,|,$/g, '')
          .trim();

        console.log('📍 Endereço obtido:', addressString);
        return addressString || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.warn('⚠️ Falha ao obter endereço:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }

  async getCurrentLocationWithFallback(): Promise<LocationResult> {
    try {
      return await this.getCurrentLocation();
    } catch (error) {
      console.warn('⚠️ Falha ao obter localização real, usando fallback:', error);
      return SAO_PAULO_FALLBACK;
    }
  }

  getFallbackLocation(): LocationResult {
    return SAO_PAULO_FALLBACK;
  }
}

export default LocationService;
