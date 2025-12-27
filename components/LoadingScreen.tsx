import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = 'Carregando...',
  fullScreen = false,
}: LoadingScreenProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <View
          className="items-center justify-center rounded-3xl bg-white p-8"
          style={{
            shadowColor: '#4C7C68',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
          }}>
          <ActivityIndicator size="large" color="#4C7C68" />
          {message && (
            <Text className="mt-4 font-JakartaSemiBold text-base text-gray-700">
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="py-8 items-center">
      <ActivityIndicator size="small" color="#4C7C68" />
      {message && (
        <Text className="mt-3 font-JakartaMedium text-sm text-gray-600">
          {message}
        </Text>
      )}
    </View>
  );
}
