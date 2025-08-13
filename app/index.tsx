import { useAuth } from '@clerk/clerk-expo';
import { Redirect, router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

const Home = () => {
  const { isSignedIn, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);

  useEffect(() => {
    async function checkUserType() {
      if (!isSignedIn || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchAPI(`/(api)/doctor/check/${userId}`);
        setIsDoctor(!!response.data);
      } catch (error) {
        console.error('Erro ao verificar tipo de usuário:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkUserType();
  }, [isSignedIn, userId]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (isDoctor) {
    return <Redirect href="/(doctor)/(tabs)/dashboard" />;
  }

  return <Redirect href="/(root)/(tabs)/home" />;
};

export default Home;
