import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import * as Location from 'expo-location';

export const useDoctorLocation = (
  socket: Socket | null,
  doctorId: string | null,
  isAvailable: boolean,
) => {
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!socket || !doctorId || !isAvailable) {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      return;
    }

    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        (location) => {
          const { latitude, longitude } = location.coords;

          socket.emit('doctor:updateLocation', {
            doctorId,
            latitude,
            longitude,
          });

          console.log(`Location updated: ${latitude}, ${longitude}`);
        },
      );
    };

    startLocationTracking();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [socket, doctorId, isAvailable]);
};

export const setDoctorAvailability = (
  socket: Socket | null,
  doctorId: string,
  isAvailable: boolean,
) => {
  if (!socket) return;

  socket.emit('doctor:setAvailability', {
    doctorId,
    isAvailable,
  });

  console.log(`Doctor availability set to: ${isAvailable}`);
};
