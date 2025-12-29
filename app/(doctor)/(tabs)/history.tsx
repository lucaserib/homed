import { useState, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { icons, images } from 'constants';
import EmptyState from 'components/EmptyState';
import LoadingScreen from 'components/LoadingScreen';
import StatusBadge from 'components/StatusBadge';
import { useDoctorConsultations } from 'hooks/useDoctorConsultations';
import { fetchAPI } from 'lib/fetch';
import { format } from 'date-fns';

const DoctorHistory = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  const { consultations, loading, refetch } = useDoctorConsultations(
    doctorProfile?.id || '',
    'completed'
  );

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        if (user?.emailAddresses[0]?.emailAddress) {
          const res = await fetchAPI(
            `/doctor/check?email=${encodeURIComponent(user.emailAddresses[0].emailAddress)}`
          );
          if (res.success && res.data) {
            setDoctorProfile(res.data);
          }
        }
      } catch (error) {
        console.error('Error fetching doctor profile', error);
      }
    };

    fetchDoctorProfile();
  }, [user]);

  const filteredConsultations = consultations.filter((c) =>
    c.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && consultations.length === 0) {
    return <LoadingScreen fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 py-4 bg-white border-b border-gray-100">
        <Text className="font-JakartaBold text-2xl text-gray-900 mb-4">
          Histórico de Consultas
        </Text>

        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Image source={icons.search} className="h-5 w-5 mr-3" tintColor="#6B7280" />
          <TextInput
            placeholder="Buscar por paciente..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 font-JakartaMedium text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <FlatList
        data={filteredConsultations}
        keyExtractor={(item) => item.consultationId}
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === 'ios' ? 120 : 95 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(doctor)/medical-record/${item.consultationId}`)}
            className="mb-4 bg-white rounded-2xl p-5 border border-gray-100"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="font-JakartaBold text-lg text-gray-900">
                  {item.patient?.name || 'Paciente'}
                </Text>
                <Text className="font-JakartaMedium text-sm text-gray-500 mt-1">
                  {item.createdAt
                    ? format(new Date(item.createdAt), "dd/MM/yyyy 'às' HH:mm")
                    : 'Data não disponível'}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <View className="border-t border-gray-100 pt-3 mt-3 flex-row justify-between">
              <View>
                <Text className="font-JakartaMedium text-xs text-gray-500">Duração</Text>
                <Text className="font-JakartaBold text-sm text-gray-900">
                  {item.duration ? `${item.duration} min` : 'N/A'}
                </Text>
              </View>
              <View>
                <Text className="font-JakartaMedium text-xs text-gray-500">Valor</Text>
                <Text className="font-JakartaBold text-sm text-primary-500">
                  {item.totalPrice ? `R$ ${item.totalPrice.toFixed(2)}` : 'N/A'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Nenhuma consulta realizada"
            description={
              searchQuery
                ? 'Nenhum resultado encontrado para sua busca'
                : 'Suas consultas finalizadas aparecerão aqui'
            }
            image={images.noResult}
          />
        }
      />
    </SafeAreaView>
  );
};

export default DoctorHistory;
