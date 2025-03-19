import { Driver, MarkerData } from '../types/type';

const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: -20.2834, // Fernandópolis SP
      longitude: -50.2466, // Fernandópolis SP
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (!userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) return;

  try {
    const timesPromises = markers.map(async (marker) => {
      // Atualização para a Routes API em vez de Directions API
      const responseToUser = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey || '',
            'X-Goog-FieldMask': 'routes.duration',
          } as HeadersInit,
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: userLatitude,
                  longitude: userLongitude,
                },
              },
            },
            travelMode: 'DRIVE',
          }),
        }
      );

      const dataToUser = await responseToUser.json();
      let timeToUser = 0;

      if (dataToUser.routes && dataToUser.routes.length > 0 && dataToUser.routes[0].duration) {
        timeToUser = parseInt(dataToUser.routes[0].duration.split('s')[0]); // Duração em segundos
      } else {
        // Fallback para API Directions legada
        try {
          const legacyResponseToUser = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${googleApiKey}`
          );

          const legacyDataToUser = await legacyResponseToUser.json();
          if (
            legacyDataToUser.routes &&
            legacyDataToUser.routes.length > 0 &&
            legacyDataToUser.routes[0].legs &&
            legacyDataToUser.routes[0].legs.length > 0
          ) {
            timeToUser = legacyDataToUser.routes[0].legs[0].duration.value;
          }
        } catch (error) {
          console.error('Error using legacy Directions API:', error);
        }
      }

      // Segunda chamada para calcular o tempo da rota do usuário até o destino
      const responseToDestination = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey || '',
            'X-Goog-FieldMask': 'routes.duration',
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
        }
      );

      const dataToDestination = await responseToDestination.json();
      let timeToDestination = 0;

      if (
        dataToDestination.routes &&
        dataToDestination.routes.length > 0 &&
        dataToDestination.routes[0].duration
      ) {
        timeToDestination = parseInt(dataToDestination.routes[0].duration.split('s')[0]); // Duração em segundos
      } else {
        // Fallback para API Directions legada
        try {
          const legacyResponseToDestination = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${googleApiKey}`
          );

          const legacyDataToDestination = await legacyResponseToDestination.json();
          if (
            legacyDataToDestination.routes &&
            legacyDataToDestination.routes.length > 0 &&
            legacyDataToDestination.routes[0].legs &&
            legacyDataToDestination.routes[0].legs.length > 0
          ) {
            timeToDestination = legacyDataToDestination.routes[0].legs[0].duration.value;
          }
        } catch (error) {
          console.error('Error using legacy Directions API:', error);
        }
      }

      const totalTime = (timeToUser + timeToDestination) / 60; // Total time in minutes
      const price = (totalTime * 0.5).toFixed(2); // Calculate price based on time

      return { ...marker, time: totalTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error('Error calculating driver times:', error);
  }
};
