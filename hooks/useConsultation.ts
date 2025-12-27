import { useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';

interface CreateConsultationData {
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  complaint?: string;
}

export function useConsultation() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConsultation = useCallback(
    async (data: CreateConsultationData) => {
      if (!user) {
        setError('Usuário não autenticado');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/consultations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              patientId: user.id,
              ...data,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao criar consulta');
        }

        const consultation = await response.json();
        return consultation;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getConsultationDetails = useCallback(async (consultationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/consultations/${consultationId}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes da consulta');
      }

      const consultation = await response.json();
      return consultation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConsultationStatus = useCallback(
    async (consultationId: string, status: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/consultations/${consultationId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao atualizar status da consulta');
        }

        const consultation = await response.json();
        return consultation;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createConsultation,
    getConsultationDetails,
    updateConsultationStatus,
    loading,
    error,
  };
}
