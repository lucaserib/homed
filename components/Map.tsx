import { useFetch } from 'lib/fetch';
import { icons } from '../constants';
import { calculateDriverTimes, calculateRegion, generateMarkersFromData } from 'lib/map';
import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useLocationStore, useDriverStore } from 'store';
import { Driver, MarkerData } from 'types/type';
import { ActivityIndicator, Text, View } from 'react-native';

const Map = () => {
  const { data: drivers, loading, error } = useFetch<Driver[]>('/(api)/driver');

  const { userLongitude, userLatitude, destinationLatitude, destinationLongitude } =
    useLocationStore();

  const { selectedDriver, setDrivers } = useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const region = calculateRegion({
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (Array.isArray(drivers) && drivers.length > 0) {
      if (!userLatitude || !userLongitude) {
        return;
      }

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      const idCounts: Record<string, number> = {};
      newMarkers.forEach((marker) => {
        const id = String(marker.id);
        idCounts[id] = (idCounts[id] || 0) + 1;
      });

      const duplicateIds = Object.entries(idCounts)
        .filter(([_, count]) => count > 1)
        .map(([id]) => id);

      if (duplicateIds.length > 0) {
        console.warn(`IDs duplicados encontrados: ${duplicateIds.join(', ')}. Corrigindo...`);

        const fixedMarkers = newMarkers.map((marker, index) => {
          const markerId = String(marker.id);
          if (duplicateIds.includes(markerId) || markerId === 'NaN') {
            return { ...marker, id: 1000 + index };
          }
          return marker;
        });

        setMarkers(fixedMarkers);
      } else {
        setMarkers(newMarkers);
      }
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      console.log('Iniciando cálculo de tempos para motoristas...');

      calculateDriverTimes({
        markers,
        userLongitude,
        userLatitude,
        destinationLatitude,
        destinationLongitude,
      })
        .then((driversWithTimes) => {
          if (driversWithTimes) {
            console.log(`Tempos calculados para ${driversWithTimes.length} motoristas`);
            setDrivers(driversWithTimes);
          } else {
            console.warn('calculateDriverTimes retornou undefined');
          }
        })
        .catch((err) => {
          console.error('Erro ao calcular tempos dos motoristas:', err);
        });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  if (loading || !userLatitude || !userLongitude) {
    return (
      <View className="flex w-full items-center justify-between">
        <ActivityIndicator size={'small'} color={'#000'} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex w-full items-center justify-between">
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ height: '100%', width: '100%', borderRadius: 16 }}
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      showsUserLocation={true}
      userInterfaceStyle="light"
      initialRegion={region}>
      {markers.map((marker) => (
        <Marker
          key={`marker-${marker.id}`} // Chave única garantida
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={selectedDriver === marker.id ? icons.selectedMarker : icons.marker}
        />
      ))}
    </MapView>
  );
};

export default Map;
