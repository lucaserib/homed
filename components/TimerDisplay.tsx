import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

interface TimerDisplayProps {
  startTime: string;
  hourlyRate: number;
  onUpdate?: (elapsedMinutes: number, currentPrice: number) => void;
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const calculatePrice = (elapsedMinutes: number, hourlyRate: number): number => {
  if (elapsedMinutes <= 60) {
    return hourlyRate;
  } else {
    const extraMinutes = elapsedMinutes - 60;
    const extraCharge = (extraMinutes / 60) * hourlyRate;
    return hourlyRate + extraCharge;
  }
};

const TimerDisplay = ({ startTime, hourlyRate, onUpdate }: TimerDisplayProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(hourlyRate);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const diffMs = now.getTime() - start.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffMs / 60000);

      setElapsedSeconds(diffSeconds);

      const price = calculatePrice(diffMinutes, hourlyRate);
      setCurrentPrice(price);

      if (onUpdate) {
        onUpdate(diffMinutes, price);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, hourlyRate, onUpdate]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  return (
    <View
      className="bg-primary-500 rounded-3xl p-6"
      style={{
        shadowColor: '#4C7C68',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      }}>
      <Text className="font-JakartaMedium text-sm text-white/80 text-center">
        Tempo de Atendimento
      </Text>
      <Text className="font-JakartaBold text-5xl text-white text-center my-4">
        {formatTime(elapsedSeconds)}
      </Text>

      <View className="border-t border-white/20 pt-4">
        <Text className="font-JakartaMedium text-xs text-white/80 text-center">
          Valor Acumulado
        </Text>
        <Text className="font-JakartaBold text-3xl text-white text-center mt-1">
          R$ {currentPrice.toFixed(2)}
        </Text>
        <Text className="font-JakartaMedium text-xs text-white/60 text-center mt-2">
          {elapsedMinutes <= 60
            ? `Primeira hora: R$ ${hourlyRate.toFixed(2)}`
            : `Hora extra: +R$ ${((elapsedMinutes - 60) / 60 * hourlyRate).toFixed(2)}`}
        </Text>
      </View>
    </View>
  );
};

export default TimerDisplay;
