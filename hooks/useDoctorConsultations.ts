import { useState, useEffect, useCallback } from 'react';
import { ConsultationService } from '../services/ConsultationService';

interface Consultation {
  consultationId: string;
  patientId: string;
  doctorId?: string;
  patient: {
    name: string;
    image?: string;
  };
  status: string;
  complaint: string;
  originAddress: string;
  createdAt: string;
  duration?: number;
  totalPrice?: number;
}

export function useDoctorConsultations(doctorId: string, status?: string) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsultations = useCallback(async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await ConsultationService.getDoctorConsultations(
        doctorId,
        status
      );
      setConsultations(data || []);
    } catch (err: any) {
      console.error('Error fetching doctor consultations:', err);
      setError(err.message || 'Erro ao carregar consultas');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId, status]);

  useEffect(() => {
    fetchConsultations();

    const interval = setInterval(() => {
      fetchConsultations();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchConsultations]);

  return {
    consultations,
    loading,
    error,
    refetch: fetchConsultations,
  };
}
