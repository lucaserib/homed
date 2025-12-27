import React from 'react';
import { View, Text, Image } from 'react-native';
import { images } from '../constants';
import CustomButton from './CustomButton';

interface EmptyStateProps {
  title: string;
  description?: string;
  image?: any;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  image = images.noResult,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-6 py-12">
      <View
        className="mb-6 h-48 w-48 items-center justify-center rounded-3xl bg-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}>
        <Image source={image} className="h-32 w-32" resizeMode="contain" />
      </View>

      <Text className="font-JakartaBold text-xl text-center text-gray-900 mb-2 px-4">
        {title}
      </Text>

      {description && (
        <Text className="font-JakartaMedium text-sm text-center text-gray-500 mb-8 px-4 leading-5">
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <View className="w-full px-4">
          <CustomButton
            title={actionLabel}
            onPress={onAction}
            bgVariant="primary"
          />
        </View>
      )}
    </View>
  );
}
