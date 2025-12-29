import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Image } from 'react-native';
import { icons } from '../constants';
import CustomButton from './CustomButton';

interface ConsultationRequestModalProps {
  visible: boolean;
  consultationId: string;
  patientName: string;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  complaint?: string;
  distance?: number;
  expiresAt: string;
  timeoutSeconds: number;
  onAccept: () => void;
  onDecline: () => void;
  onTimeout?: () => void;
}

const ConsultationRequestModal = ({
  visible,
  consultationId,
  patientName,
  originAddress,
  distance,
  complaint,
  expiresAt,
  timeoutSeconds,
  onAccept,
  onDecline,
  onTimeout,
}: ConsultationRequestModalProps) => {
  const [remainingSeconds, setRemainingSeconds] = useState(timeoutSeconds);

  useEffect(() => {
    if (!visible) {
      setRemainingSeconds(timeoutSeconds);
      return;
    }

    const expiresAtTime = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAtTime - now) / 1000));

      setRemainingSeconds(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onTimeout?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, expiresAt, timeoutSeconds, onTimeout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (remainingSeconds > 40) return '#4C7C68';
    if (remainingSeconds > 20) return '#EAB308';
    return '#F56565';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/60 justify-end">
        <View
          className="bg-white rounded-t-3xl p-6 pb-8"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-JakartaBold text-2xl text-gray-900">
              Nova Solicitação
            </Text>
            <View
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: getProgressColor() }}
            >
              <Text className="font-JakartaBold text-lg text-white">
                {formatTime(remainingSeconds)}
              </Text>
            </View>
          </View>

          <View className="bg-gray-50 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
                <Image source={icons.person} className="w-6 h-6" tintColor="#4C7C68" />
              </View>
              <View className="flex-1">
                <Text className="font-JakartaSemiBold text-lg text-gray-900">
                  {patientName}
                </Text>
                {distance && (
                  <Text className="font-JakartaMedium text-sm text-gray-600">
                    {distance.toFixed(1)} km de distância
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row items-start mb-3">
              <Image source={icons.marker} className="w-5 h-5 mr-2 mt-0.5" tintColor="#6B7280" />
              <Text className="font-JakartaMedium text-sm text-gray-700 flex-1">
                {originAddress}
              </Text>
            </View>

            {complaint && (
              <View className="flex-row items-start">
                <Image source={icons.chat} className="w-5 h-5 mr-2 mt-0.5" tintColor="#6B7280" />
                <Text className="font-JakartaMedium text-sm text-gray-700 flex-1">
                  {complaint}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <CustomButton
                title="Recusar"
                onPress={onDecline}
                bgVariant="outline"
                textVariant="primary"
              />
            </View>
            <View className="flex-1">
              <CustomButton
                title="Aceitar"
                onPress={onAccept}
                bgVariant="success"
                textVariant="default"
              />
            </View>
          </View>

          <View className="mt-4 px-2">
            <View
              className="h-1 bg-gray-200 rounded-full overflow-hidden"
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${(remainingSeconds / timeoutSeconds) * 100}%`,
                  backgroundColor: getProgressColor(),
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConsultationRequestModal;
