import { View, Text, Image, TouchableOpacity } from 'react-native';
import { icons } from '../constants';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Patient {
  name: string;
  image?: string;
}

interface ConsultationRequestCardProps {
  consultation: {
    consultationId: string;
    patient: Patient;
    complaint: string;
    originAddress: string;
    distance?: number;
    createdAt: string;
  };
  onPress: () => void;
}

const ConsultationRequestCard = ({
  consultation,
  onPress,
}: ConsultationRequestCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(consultation.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-4 bg-white rounded-2xl p-5 border-2 border-primary-100"
      style={{
        shadowColor: '#4C7C68',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}>
      <View className="flex-row items-start mb-3">
        <View className="h-14 w-14 rounded-full overflow-hidden bg-gray-100 mr-3">
          <Image
            source={{
              uri:
                consultation.patient.image ||
                'https://via.placeholder.com/100',
            }}
            className="h-full w-full"
          />
        </View>

        <View className="flex-1">
          <Text className="font-JakartaBold text-lg text-gray-900">
            {consultation.patient.name}
          </Text>
          <Text className="font-JakartaMedium text-xs text-gray-500 mt-1">
            {timeAgo}
          </Text>
        </View>

        {consultation.distance !== undefined && (
          <View className="bg-primary-50 rounded-full px-3 py-1.5">
            <Text className="font-JakartaBold text-xs text-primary-600">
              {consultation.distance.toFixed(1)} km
            </Text>
          </View>
        )}
      </View>

      <View className="bg-gray-50 rounded-xl p-3 mb-3">
        <View className="flex-row items-start">
          <Image
            source={icons.marker}
            className="h-4 w-4 mr-2 mt-0.5"
            tintColor="#6B7280"
          />
          <Text className="flex-1 font-JakartaMedium text-sm text-gray-700">
            {consultation.originAddress}
          </Text>
        </View>
      </View>

      {consultation.complaint && (
        <View className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
          <Text className="font-JakartaSemiBold text-xs text-yellow-800 mb-1">
            Queixa Principal
          </Text>
          <Text className="font-JakartaMedium text-sm text-gray-700" numberOfLines={2}>
            {consultation.complaint}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-end mt-3">
        <Text className="font-JakartaSemiBold text-sm text-primary-500">
          Ver Detalhes
        </Text>
        <Image
          source={icons.arrowUp}
          className="h-4 w-4 ml-1 rotate-90"
          tintColor="#4C7C68"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ConsultationRequestCard;
