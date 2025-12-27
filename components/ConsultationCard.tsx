import { formatDate, formatTime } from 'lib/utils';
import { Image, Text, View } from 'react-native';
import { Consultation } from 'types/type';
import { shadows } from 'helpers/shadows';

import { icons } from '../constants';

const ConsultationCard = ({ consultation }: { consultation: Consultation }) => {
  // Function to get status color and text
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      'pending': { text: 'Pendente', color: 'text-yellow-600' },
      'accepted': { text: 'Aceita', color: 'text-blue-600' },
      'in_progress': { text: 'Em Andamento', color: 'text-blue-700' },
      'completed': { text: 'Concluída', color: 'text-green-600' },
      'cancelled': { text: 'Cancelada', color: 'text-red-600' },
      'declined': { text: 'Recusada', color: 'text-red-500' }
    };
    return statusMap[status] || { text: status, color: 'text-gray-500' };
  };

  const statusDisplay = getStatusDisplay(consultation.status);

  return (
    <View className="mb-3 flex flex-row items-center justify-center rounded-lg bg-white p-4" style={shadows.sm}>
      <View className="flex flex-1 flex-col">
        {/* Header with consultation info */}
        <View className="mb-4 flex flex-row items-center justify-between">
          <View className="flex flex-1">
            <Text className="text-lg font-JakartaBold text-gray-800">
              Consulta Médica
            </Text>
            <Text className="text-sm font-JakartaRegular text-gray-500">
              {formatDate(consultation.createdAt)}
            </Text>
          </View>
          <View className="rounded-full bg-blue-50 px-3 py-1">
            <Text className={`text-sm font-JakartaMedium ${statusDisplay.color}`}>
              {statusDisplay.text}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View className="mb-3 flex flex-row items-center">
          <Image source={icons.to} className="h-4 w-4 mr-2" />
          <Text className="flex-1 text-sm font-JakartaMedium text-gray-700" numberOfLines={2}>
            {consultation.originAddress}
          </Text>
        </View>

        {/* Doctor info (if assigned) */}
        {consultation.doctor && (
          <View className="mb-3 flex flex-row items-center">
            <Image source={icons.person} className="h-4 w-4 mr-2" />
            <Text className="flex-1 text-sm font-JakartaMedium text-gray-700">
              Dr(a). {consultation.doctor.firstName} {consultation.doctor.lastName}
            </Text>
            <Text className="text-xs font-JakartaRegular text-blue-600">
              {consultation.doctor.specialty}
            </Text>
          </View>
        )}

        {/* Complaint (if provided) */}
        {consultation.complaint && (
          <View className="mb-3 flex flex-row items-start">
            <Image source={icons.list} className="h-4 w-4 mr-2 mt-0.5" />
            <Text className="flex-1 text-sm font-JakartaRegular text-gray-600" numberOfLines={2}>
              {consultation.complaint}
            </Text>
          </View>
        )}

        {/* Footer with payment and timing */}
        <View className="mt-2 pt-3 border-t border-gray-100">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center">
              <Text className="text-xs font-JakartaRegular text-gray-500">Pagamento: </Text>
              <Text className={`text-xs font-JakartaMedium capitalize ${
                consultation.paymentStatus === 'paid' ? 'text-green-600' : 
                consultation.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {consultation.paymentStatus === 'paid' ? 'Pago' : 
                 consultation.paymentStatus === 'pending' ? 'Pendente' : consultation.paymentStatus}
              </Text>
            </View>
            
            {consultation.totalPrice && (
              <Text className="text-sm font-JakartaBold text-green-600">
                R$ {consultation.totalPrice.toString()}
              </Text>
            )}
          </View>

          {consultation.duration && (
            <View className="mt-1">
              <Text className="text-xs font-JakartaRegular text-gray-500">
                Duração: {Math.round(consultation.duration)} minutos
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ConsultationCard;