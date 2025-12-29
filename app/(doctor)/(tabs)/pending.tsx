import { useState, useEffect, useCallback } from 'react';
import { View, FlatList, RefreshControl, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { ConsultationService } from 'services/ConsultationService';
import { fetchAPI } from 'lib/fetch';
import ConsultationRequestCard from 'components/ConsultationRequestCard';
import EmptyState from 'components/EmptyState';
import LoadingScreen from 'components/LoadingScreen';
import { useLocationStore } from 'store';
import { images } from 'constants';

const PendingRequests = () => {
  const { user } = useUser();
  const { userLatitude, userLongitude } = useLocationStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  const fetchPendingRequests = useCallback(async () => {
    try {
      if (doctorProfile?.serviceRadius && userLatitude && userLongitude) {
        const data = await ConsultationService.getPendingConsultations(
          userLatitude,
          userLongitude,
          doctorProfile.serviceRadius
        );
        setRequests(data || []);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [doctorProfile, userLatitude, userLongitude]);

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

  useEffect(() => {
    if (doctorProfile) {
      fetchPendingRequests();

      const interval = setInterval(fetchPendingRequests, 15000);
      return () => clearInterval(interval);
    }
  }, [doctorProfile, fetchPendingRequests]);

  const handleViewDetails = (id: string) => {
    router.push(`/(doctor)/consultation-request/${id}`);
  };

  if (loading && !doctorProfile) {
    return <LoadingScreen fullScreen message="Carregando pedidos..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 py-4 bg-white border-b border-gray-100">
        <Text className="font-JakartaBold text-2xl text-gray-900">
          Pedidos Pendentes
        </Text>
        <Text className="font-JakartaMedium text-sm text-gray-500 mt-1">
          {requests.length} {requests.length === 1 ? 'solicitação disponível' : 'solicitações disponíveis'}
        </Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.consultationId}
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === 'ios' ? 120 : 95 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPendingRequests();
            }}
            tintColor="#4C7C68"
          />
        }
        renderItem={({ item }) => (
          <ConsultationRequestCard
            consultation={item}
            onPress={() => handleViewDetails(item.consultationId)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum pedido no momento"
            description="Aguarde novas solicitações aparecerem aqui"
            image={images.noResult}
          />
        }
      />
    </SafeAreaView>
  );
};

export default PendingRequests;
