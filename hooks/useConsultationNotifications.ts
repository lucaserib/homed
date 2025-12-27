import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Alert } from 'react-native';

interface ConsultationNotification {
  consultationId: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  doctorProfileImage?: string;
  originAddress?: string;
  originLatitude?: number;
  originLongitude?: number;
  complaint?: string;
  estimatedArrival?: number;
  distance?: number;
  createdAt?: string;
}

interface UseConsultationNotificationsReturn {
  newConsultations: ConsultationNotification[];
  acceptedConsultation: ConsultationNotification | null;
  declinedConsultation: ConsultationNotification | null;
  consultationStarted: ConsultationNotification | null;
  consultationCompleted: ConsultationNotification | null;
  doctorLocation: { latitude: number; longitude: number; estimatedArrival: number } | null;
  clearNotifications: () => void;
}

export const useConsultationNotifications = (
  socket: Socket | null,
): UseConsultationNotificationsReturn => {
  const [newConsultations, setNewConsultations] = useState<ConsultationNotification[]>([]);
  const [acceptedConsultation, setAcceptedConsultation] =
    useState<ConsultationNotification | null>(null);
  const [declinedConsultation, setDeclinedConsultation] =
    useState<ConsultationNotification | null>(null);
  const [consultationStarted, setConsultationStarted] =
    useState<ConsultationNotification | null>(null);
  const [consultationCompleted, setConsultationCompleted] =
    useState<ConsultationNotification | null>(null);
  const [doctorLocation, setDoctorLocation] = useState<{
    latitude: number;
    longitude: number;
    estimatedArrival: number;
  } | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('consultation:new', (data: ConsultationNotification) => {
      console.log('New consultation request:', data);
      setNewConsultations((prev) => [data, ...prev]);
      Alert.alert('Nova Consulta', `Pedido de ${data.patientName} em ${data.originAddress}`);
    });

    socket.on('consultation:accepted', (data: ConsultationNotification) => {
      console.log('Consultation accepted:', data);
      setAcceptedConsultation(data);
      Alert.alert(
        'Consulta Aceita!',
        `${data.doctorName} está indo até você. Chegada em ${data.estimatedArrival} minutos.`,
      );
    });

    socket.on('consultation:declined', (data: ConsultationNotification) => {
      console.log('Consultation declined:', data);
      setDeclinedConsultation(data);
    });

    socket.on('consultation:started', (data: ConsultationNotification) => {
      console.log('Consultation started:', data);
      setConsultationStarted(data);
      Alert.alert('Consulta Iniciada', 'O médico iniciou o atendimento.');
    });

    socket.on('consultation:completed', (data: ConsultationNotification) => {
      console.log('Consultation completed:', data);
      setConsultationCompleted(data);
      Alert.alert('Consulta Finalizada', 'O atendimento foi concluído.');
    });

    socket.on(
      'consultation:doctorLocation',
      (data: {
        consultationId: string;
        patientId: string;
        doctorLatitude: number;
        doctorLongitude: number;
        estimatedArrival: number;
      }) => {
        console.log('Doctor location updated:', data);
        setDoctorLocation({
          latitude: data.doctorLatitude,
          longitude: data.doctorLongitude,
          estimatedArrival: data.estimatedArrival,
        });
      },
    );

    return () => {
      socket.off('consultation:new');
      socket.off('consultation:accepted');
      socket.off('consultation:declined');
      socket.off('consultation:started');
      socket.off('consultation:completed');
      socket.off('consultation:doctorLocation');
    };
  }, [socket]);

  const clearNotifications = () => {
    setAcceptedConsultation(null);
    setDeclinedConsultation(null);
    setConsultationStarted(null);
    setConsultationCompleted(null);
    setDoctorLocation(null);
  };

  return {
    newConsultations,
    acceptedConsultation,
    declinedConsultation,
    consultationStarted,
    consultationCompleted,
    doctorLocation,
    clearNotifications,
  };
};
