import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useLocationStore } from 'store';

const Map = () => {
  const { userLatitude, userLongitude } = useLocationStore();

  // For now, show a simple placeholder that doesn't break
  if (Platform.OS === 'web') {
    return (
      <View className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-100">
        <Text className="font-JakartaMedium text-lg text-gray-600">
          Mapa disponível apenas no mobile
        </Text>
        <Text className="mt-2 font-JakartaRegular text-sm text-gray-500">
          Use o app mobile para ver o mapa e localização
        </Text>
      </View>
    );
  }

  // Mobile placeholder - will be implemented later
  return (
    <View className="flex h-full w-full items-center justify-center rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200">
      <Text className="font-JakartaMedium text-lg text-blue-600">
        🗺️ Mapa em desenvolvimento
      </Text>
      <Text className="mt-2 font-JakartaRegular text-sm text-blue-500">
        Localização: {userLatitude ? `${userLatitude.toFixed(4)}, ${userLongitude.toFixed(4)}` : 'Carregando...'}
      </Text>
      <Text className="mt-1 font-JakartaRegular text-xs text-blue-400">
        Mapa de médicos será implementado aqui
      </Text>
    </View>
  );
};

export default Map;