import { useFetch } from 'lib/fetch';
import { calculateDriverTimes, calculateRegion, generateMarkersFromData } from 'lib/map';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from 'react-native-maps';
import { useLocationStore, useDriverStore } from 'store';
import { Driver, MarkerData } from 'types/type';

import { icons } from '../constants';

const Map = () => {
  const { data: drivers, loading, error } = useFetch<Driver[]>('/(api)/driver');

  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);

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
    const fetchRouteFromGoogleAPI = async () => {
      if (!userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) return;

      try {
        const response = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '',
            'X-Goog-FieldMask': 'routes.polyline.encodedPolyline',
          } as HeadersInit,
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: userLatitude,
                  longitude: userLongitude,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: destinationLatitude,
                  longitude: destinationLongitude,
                },
              },
            },
            travelMode: 'DRIVE',
          }),
        });

        const data = await response.json();

        if (data.routes && data.routes.length > 0 && data.routes[0].polyline) {
          const encodedPolyline = data.routes[0].polyline.encodedPolyline;
          const decodedCoords = decodePolyline(encodedPolyline);
          setRouteCoordinates(decodedCoords);
        } else {
          console.warn('No route data found:', data);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRouteFromGoogleAPI();
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
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
        <ActivityIndicator size="small" color="#000" />
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

  function decodePolyline(encoded: string) {
    if (!encoded) return [];

    const points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ height: '100%', width: '100%', borderRadius: 16 }}
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      showsUserLocation
      userInterfaceStyle="light"
      initialRegion={region}>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={selectedDriver === marker.id ? icons.selectedMarker : icons.marker}
        />
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#0286ff"
              strokeWidth={3}
              lineDashPattern={[0]}
            />
          )}
        </>
      )}
    </MapView>
  );
};

export default Map;
