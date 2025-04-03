// app/(doctor)/_layout.tsx
import { Stack } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import { View, ActivityIndicator } from 'react-native';

const DoctorLayout = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
      return;
    }

    const checkDoctorStatus = async () => {
      try {
        const response = await fetchAPI(`/(api)/doctor/check/${user?.id}`);

        if (!response.data) {
          router.replace('/(root)/(tabs)/home');
        }
      } catch (error) {
        console.error('Erro ao verificar status de médico:', error);
        router.replace('/(root)/(tabs)/home');
      }
    };

    if (isSignedIn) {
      checkDoctorStatus();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || !isSignedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="availability"
        options={{
          headerTitle: 'Disponibilidade',
          headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
        }}
      />
      <Stack.Screen
        name="active-consultation"
        options={{
          headerTitle: 'Consulta Ativa',
          headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
        }}
      />
      <Stack.Screen
        name="consultation/[id]"
        options={{
          headerTitle: 'Detalhes da Consulta',
          headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
        }}
      />
      <Stack.Screen
        name="medical-record/[id]"
        options={{
          headerTitle: 'Prontuário Médico',
          headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
        }}
      />
    </Stack>
  );
};

export default DoctorLayout;
