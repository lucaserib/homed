import { useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';

interface Location {
  latitude: number;
  longitude: number;
}

interface MapViewWithRouteProps {
  doctorLocation: Location;
  patientLocation: Location;
  showRoute?: boolean;
  onRouteReady?: (result: { distance: number; duration: number }) => void;
}

const MapViewWithRoute = ({
  doctorLocation,
  patientLocation,
  showRoute = true,
  onRouteReady,
}: MapViewWithRouteProps) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current && doctorLocation && patientLocation) {
      const coordinates = [doctorLocation, patientLocation];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  }, [doctorLocation, patientLocation]);

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
      className="flex-1"
      showsUserLocation={false}
      initialRegion={{
        latitude: doctorLocation.latitude,
        longitude: doctorLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}>
      <Marker
        coordinate={doctorLocation}
        title="Você"
        pinColor="#4C7C68"
      />

      <Marker
        coordinate={patientLocation}
        title="Paciente"
        pinColor="#F56565"
      />

      {showRoute && GOOGLE_MAPS_API_KEY && (
        <MapViewDirections
          origin={doctorLocation}
          destination={patientLocation}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={4}
          strokeColor="#4C7C68"
          onReady={(result) => {
            if (onRouteReady) {
              onRouteReady({
                distance: result.distance,
                duration: result.duration,
              });
            }
            if (mapRef.current) {
              mapRef.current.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
              });
            }
          }}
        />
      )}
    </MapView>
  );
};

export default MapViewWithRoute;
