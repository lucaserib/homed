import { useState, useCallback } from 'react';

interface FindDoctorsParams {
  latitude: number;
  longitude: number;
  radius?: number;
  specialty?: string;
}

export function useNearbyDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findNearbyDoctors = useCallback(async (params: FindDoctorsParams) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        latitude: params.latitude.toString(),
        longitude: params.longitude.toString(),
        ...(params.radius && { radius: params.radius.toString() }),
        ...(params.specialty && { specialty: params.specialty }),
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/consultations/nearby?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar médicos próximos');
      }

      const data = await response.json();
      setDoctors(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    doctors,
    findNearbyDoctors,
    loading,
    error,
  };
}
