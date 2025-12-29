import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { icons } from 'constants';
import CustomButton from 'components/CustomButton';
import { useUserStore } from 'store';
import { useDoctorStats } from 'hooks/useDoctorStats';
import { fetchAPI } from 'lib/fetch';

const DoctorProfile = () => {
  const { signOut, user } = useClerk();
  const { userName, clearUserData } = useUserStore();
  const [doctorData, setDoctorData] = useState<any>(null);

  const { stats, loading } = useDoctorStats(doctorData?.id || '');

  const formatPrice = (value: any): string => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isNaN(num) ? '0.00' : num.toFixed(2);
  };

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        if (user?.emailAddresses[0]?.emailAddress) {
          const res = await fetchAPI(
            `/doctor/check?email=${encodeURIComponent(user.emailAddresses[0].emailAddress)}`
          );
          if (res.success && res.data) {
            setDoctorData(res.data);
          }
        }
      } catch (error) {
        console.error('Error fetching doctor profile', error);
      }
    };

    fetchDoctorProfile();
  }, [user]);

  const handleSignOut = async () => {
    clearUserData();
    await signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 120 : 95 }}>
        <View className="items-center pt-6 pb-8 bg-primary-50">
          <View
            className="h-28 w-28 rounded-full overflow-hidden bg-white border-4 border-white"
            style={{
              shadowColor: '#4C7C68',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}>
            <Image
              source={{
                uri: user?.imageUrl || doctorData?.profileImageUrl,
              }}
              className="h-full w-full"
            />
          </View>

          <Text className="font-JakartaBold text-2xl text-gray-900 mt-4">
            Dr. {userName || 'Médico'}
          </Text>
          <Text className="font-JakartaMedium text-sm text-gray-600">
            {doctorData?.specialty || 'Clínico Geral'}
          </Text>
          <Text className="font-JakartaMedium text-xs text-gray-500 mt-1">
            CRM: {doctorData?.licenseNumber || 'N/A'}
          </Text>

          <View className="flex-row items-center mt-3">
            <Image source={icons.star} className="h-4 w-4 mr-1" />
            <Text className="font-JakartaBold text-base text-yellow-600">
              {stats?.rating ? formatPrice(stats.rating).slice(0, -1) : '0.0'}
            </Text>
          </View>
        </View>

        <View className="flex-row px-5 -mt-6">
          <View
            className="flex-1 bg-white rounded-2xl p-4 mr-2 border border-gray-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text className="font-JakartaMedium text-xs text-gray-500">Consultas</Text>
            <Text className="font-JakartaBold text-2xl text-primary-500 mt-1">
              {stats?.totalConsultations || 0}
            </Text>
          </View>

          <View
            className="flex-1 bg-white rounded-2xl p-4 ml-2 border border-gray-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text className="font-JakartaMedium text-xs text-gray-500">Ganhos</Text>
            <Text className="font-JakartaBold text-xl text-green-500 mt-1">
              R$ {formatPrice(stats?.monthEarnings)}
            </Text>
          </View>
        </View>

        <View className="px-5 mt-8">
          <Text className="font-JakartaBold text-lg text-gray-900 mb-4">Configurações</Text>

          <TouchableOpacity
            onPress={() => router.push('/(doctor)/availability')}
            className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border border-gray-100">
            <View className="flex-row items-center">
              <Image source={icons.calendar} className="h-5 w-5 mr-3" tintColor="#4C7C68" />
              <Text className="font-JakartaMedium text-base text-gray-900">
                Gerenciar Disponibilidade
              </Text>
            </View>
            <Image source={icons.arrowUp} className="h-4 w-4 rotate-90" tintColor="#9CA3AF" />
          </TouchableOpacity>

          <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Image source={icons.dollar} className="h-5 w-5 mr-3" tintColor="#4C7C68" />
                <View>
                  <Text className="font-JakartaMedium text-base text-gray-900">Valor por Hora</Text>
                  <Text className="font-JakartaMedium text-sm text-gray-500">
                    R$ {formatPrice(doctorData?.hourlyRate)}/hora
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Image source={icons.map} className="h-5 w-5 mr-3" tintColor="#4C7C68" />
                <View>
                  <Text className="font-JakartaMedium text-base text-gray-900">
                    Raio de Atendimento
                  </Text>
                  <Text className="font-JakartaMedium text-sm text-gray-500">
                    {doctorData?.serviceRadius || 0} km
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 mt-8 mb-8">
          <CustomButton
            title="Sair da Conta"
            onPress={handleSignOut}
            bgVariant="danger"
            IconLeft={() => (
              <Image source={icons.out} className="h-5 w-5 mr-2" tintColor="white" />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorProfile;
