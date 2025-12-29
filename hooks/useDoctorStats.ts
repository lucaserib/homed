import { useState, useEffect } from 'react';
import { fetchAPI } from '../lib/fetch';

interface DoctorStats {
  todayConsultations: number;
  monthEarnings: number;
  totalConsultations: number;
  rating: number;
}

export function useDoctorStats(doctorId: string) {
  const [stats, setStats] = useState<DoctorStats>({
    todayConsultations: 0,
    monthEarnings: 0,
    totalConsultations: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAPI(`/doctor/${doctorId}/stats`);
        setStats(data || {
          todayConsultations: 0,
          monthEarnings: 0,
          totalConsultations: 0,
          rating: 0,
        });
      } catch (err: any) {
        console.error('Error fetching doctor stats:', err);
        setError(err.message || 'Erro ao carregar estatísticas');
        setStats({
          todayConsultations: 0,
          monthEarnings: 0,
          totalConsultations: 0,
          rating: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [doctorId]);

  return { stats, loading, error };
}
