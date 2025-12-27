import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import SocketIOClient from 'socket.io-client';
export function useWebSocket(userType: 'patient' | 'doctor' = 'patient') {
  const { user } = useUser();
  const socketRef = useRef<SocketIOClient.Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/consultations`, {
      query: {
        userId: user.id,
        userType,
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const joinConsultation = (consultationId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('join:consultation', {
        consultationId,
        userId: user.id,
      });
    }
  };

  const leaveConsultation = (consultationId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('leave:consultation', {
        consultationId,
        userId: user.id,
      });
    }
  };

  const onConsultationAccepted = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('consultation:accepted', callback);
    }
  };

  const onConsultationDeclined = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('consultation:declined', callback);
    }
  };

  const onConsultationStarted = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('consultation:started', callback);
    }
  };

  const onConsultationFinished = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('consultation:finished', callback);
    }
  };

  const onDoctorLocationUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('doctor:location:update', callback);
    }
  };

  return {
    connected,
    joinConsultation,
    leaveConsultation,
    onConsultationAccepted,
    onConsultationDeclined,
    onConsultationStarted,
    onConsultationFinished,
    onDoctorLocationUpdate,
    socket: socketRef.current,
  };
}
