import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  accepted: {
    label: 'Aceito',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  in_progress: {
    label: 'Em Andamento',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  completed: {
    label: 'Concluído',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <View className={`${config.bg} ${config.border} border rounded-full self-start`}>
      <Text className={`${config.text} ${sizeClass} font-JakartaSemiBold`}>
        {config.label}
      </Text>
    </View>
  );
}
