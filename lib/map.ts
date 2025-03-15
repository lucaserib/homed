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
  console.log('Gerando marcadores para motoristas:', data);

  return data.map((driver, index) => {
    const validUserLat = isNaN(userLatitude) ? -20.2834 : userLatitude;
    const validUserLng = isNaN(userLongitude) ? -50.2466 : userLongitude;

    const distanceMultiplier = (index + 1) * 0.002;
    const angle = (index * 45) % 360;

    const angleRad = angle * (Math.PI / 180);

    const latOffset = Math.cos(angleRad) * distanceMultiplier;
    const lngOffset = Math.sin(angleRad) * distanceMultiplier;

    let driverId: number;
    try {
      driverId = Number(driver.driver_id);
      if (isNaN(driverId)) {
        console.warn(
          `Driver ID inválido encontrado: ${driver.driver_id}, usando ${index + 1} como fallback`
        );
        driverId = index + 1;
      }
    } catch (e) {
      driverId = index + 1;
    }

    console.log(
      `Motorista ${driver.first_name} (ID: ${driverId}) posicionado em: ${validUserLat + latOffset}, ${validUserLng + lngOffset}`
    );

    return {
      latitude: validUserLat + latOffset,
      longitude: validUserLng + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      id: driverId,
      first_name: driver.first_name,
      last_name: driver.last_name,
      profile_image_url: driver.profile_image_url || '',
      car_image_url: driver.car_image_url || '',
      car_seats: driver.car_seats || 4,
      rating: driver.rating || 4.5,
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
  // Valores padrão para São Francisco como fallback
  const defaultLat = -20.2834;
  const defaultLng = -50.2466;

  const validUserLat = userLatitude && !isNaN(userLatitude) ? userLatitude : defaultLat;
  const validUserLng = userLongitude && !isNaN(userLongitude) ? userLongitude : defaultLng;

  if (
    !destinationLatitude ||
    !destinationLongitude ||
    isNaN(destinationLatitude) ||
    isNaN(destinationLongitude)
  ) {
    return {
      latitude: validUserLat,
      longitude: validUserLng,
      latitudeDelta: 0.05, // Aumentado para mostrar mais contexto
      longitudeDelta: 0.05,
    };
  }

  const minLat = Math.min(validUserLat, destinationLatitude);
  const maxLat = Math.max(validUserLat, destinationLatitude);
  const minLng = Math.min(validUserLng, destinationLongitude);
  const maxLng = Math.max(validUserLng, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.5; // Aumentado o padding para melhor visualização
  const longitudeDelta = (maxLng - minLng) * 1.5;

  const latitude = (validUserLat + destinationLatitude) / 2;
  const longitude = (validUserLng + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta: latitudeDelta || 0.05,
    longitudeDelta: longitudeDelta || 0.05,
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
  // Verificar e validar coordenadas
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude ||
    isNaN(userLatitude) ||
    isNaN(userLongitude) ||
    isNaN(destinationLatitude) ||
    isNaN(destinationLongitude)
  ) {
    return markers.map((marker) => {
      const estimatedTime = 5 + Math.random() * 15; // Entre 5 e 20 minutos
      const estimatedPrice = (estimatedTime * 0.5).toFixed(2);
      return { ...marker, time: estimatedTime, price: estimatedPrice };
    });
  }

  console.log(
    `Calculando tempo para ${markers.length} motoristas da localização (${userLatitude}, ${userLongitude}) para (${destinationLatitude}, ${destinationLongitude})`
  );

  try {
    const timesPromises = markers.map(async (marker, index) => {
      try {
        console.log(`Processando motorista ${marker.id} (${marker.first_name})`);

        // Tente a API Routes primeiro
        let timeToUser = 0;
        let timeToDestination = 0;
        let apiSuccess = false;

        try {
          // Primeira tentativa com Routes API
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
          console.log(
            `Resposta da API para ${marker.id}:`,
            JSON.stringify(dataToUser).substring(0, 200) + '...'
          );

          if (dataToUser.routes && dataToUser.routes.length > 0 && dataToUser.routes[0].duration) {
            timeToUser = parseInt(dataToUser.routes[0].duration.split('s')[0]); // Duração em segundos
            apiSuccess = true;
          }

          // Segunda chamada
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
          if (
            dataToDestination.routes &&
            dataToDestination.routes.length > 0 &&
            dataToDestination.routes[0].duration
          ) {
            timeToDestination = parseInt(dataToDestination.routes[0].duration.split('s')[0]); // Duração em segundos
            apiSuccess = true;
          }
        } catch (apiError) {
          console.warn(`Erro na chamada da API Routes para motorista ${marker.id}:`, apiError);
          apiSuccess = false;
        }

        // Se a API falhar, tente usar a API Directions legada
        if (!apiSuccess) {
          try {
            console.log(`Tentando API Directions legada para motorista ${marker.id}`);
            // Tentativa com API Directions legada
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
              apiSuccess = true;
            }

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
              apiSuccess = true;
            }
          } catch (legacyError) {
            console.warn(
              `Erro também na API Directions legada para motorista ${marker.id}:`,
              legacyError
            );
            apiSuccess = false;
          }
        }

        // Se ambas as APIs falharem, use estimativa
        if (!apiSuccess) {
          timeToUser = estimateTime(marker.latitude, marker.longitude, userLatitude, userLongitude);
          timeToDestination = estimateTime(
            userLatitude,
            userLongitude,
            destinationLatitude,
            destinationLongitude
          );
          console.log(
            `Usando tempo estimado para motorista ${marker.id}: ${timeToUser / 60}min para usuário, ${timeToDestination / 60}min para destino`
          );
        }

        const totalTime = (timeToUser + timeToDestination) / 60; // Total time in minutes
        const price = (totalTime * 0.5).toFixed(2); // Calculate price based on time

        console.log(`Motorista ${marker.id} processado: tempo=${totalTime}min, preço=$${price}`);

        return { ...marker, time: totalTime, price };
      } catch (error) {
        console.error(`Erro processando motorista ${marker.id}:`, error);
        // Falha completa - use valores razoáveis
        const estimatedTime = 5 + Math.floor(Math.random() * 15); // Entre 5-20 minutos
        const estimatedPrice = (estimatedTime * 0.5).toFixed(2);
        return { ...marker, time: estimatedTime, price: estimatedPrice };
      }
    });

    const results = await Promise.all(timesPromises);
    console.log(
      `Tempos calculados para ${results.length} motoristas:`,
      results.map((r) => `${r.id}: ${r.time}min, $${r.price}`).join(', ')
    );
    return results;
  } catch (error) {
    console.error('Erro geral calculando tempos dos motoristas:', error);
    // Em caso de erro geral, retornar estimativas
    return markers.map((marker, index) => {
      const estimatedTime = 5 + index; // Motoristas diferentes recebem tempos diferentes
      const estimatedPrice = (estimatedTime * 0.5).toFixed(2);
      return { ...marker, time: estimatedTime, price: estimatedPrice };
    });
  }
};

// Função auxiliar para estimar o tempo de viagem com base na distância (caso a API falhe)
function estimateTime(startLat: number, startLng: number, endLat: number, endLng: number): number {
  // Calcular distância usando a fórmula de Haversine
  const R = 6371; // Raio da Terra em km
  const dLat = deg2rad(endLat - startLat);
  const dLon = deg2rad(endLng - startLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(startLat)) *
      Math.cos(deg2rad(endLat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distância em km

  // Estimar tempo em segundos (assumindo velocidade média de 40 km/h em ambiente urbano)
  return Math.round((distance / 40) * 3600);
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
