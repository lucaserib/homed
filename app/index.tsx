import { useAuth, useUser, ClerkLoaded, ClerkLoading } from '@clerk/clerk-expo';
import { Redirect, router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import CustomButton from 'components/CustomButton';
import { useUserStore } from 'store';

const AuthenticatedApp = () => {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const { setUserData, clearUserData } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checkUserStatus = async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setTimeout(() => {
        router.replace('/(auth)/welcome');
      }, 100);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const response = await fetchAPI('/sync/status');

      if (response?.exists) {
        if (response.status === 'APPROVED') {
          if (response.role === 'doctor') {
            setUserData(response.name || 'Médico', 'doctor');
            router.replace('/(doctor)/(tabs)/dashboard');
          } else if (response.role === 'patient') {
            setUserData(response.name || 'Paciente', 'patient');
            router.replace('/(root)/(tabs)/home');
          }
        } else if (response.status === 'PENDING') {
          clearUserData();
          await signOut();
          router.replace('/(auth)/pending-approval');
        } else if (response.status === 'REJECTED') {
          clearUserData();
          setErrorMessage('Seu cadastro foi rejeitado. Entre em contato com o suporte para mais informações.');
          setHasError(true);
        } else if (response.status === 'UNDER_REVIEW') {
          clearUserData();
          await signOut();
          router.replace('/(auth)/pending-approval');
        }
      } else {
        clearUserData();
        setErrorMessage('Sua conta não foi encontrada. Por favor, complete seu cadastro novamente.');
        setHasError(true);
      }
    } catch (error: any) {

      if (error?.status === 401) {
        setErrorMessage('Sessão expirada. Por favor, faça login novamente.');
      } else if (error?.message?.includes('Network')) {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        setErrorMessage('Erro ao verificar sua conta. Tente novamente.');
      }

      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      clearUserData();
      await signOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, [isLoaded, isSignedIn]);

  if (hasError) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="mb-2 text-center font-JakartaBold text-xl text-gray-800">
          Ops! Algo deu errado
        </Text>
        <Text className="mb-6 text-center font-Jakarta text-base text-gray-600">
          {errorMessage}
        </Text>
        <CustomButton
          title="Tentar Novamente"
          onPress={checkUserStatus}
          className="w-full"
        />
        <CustomButton
          title="Fazer Logout"
          onPress={handleLogout}
          bgVariant="outline"
          textVariant="secondary"
          className="mt-4 w-full"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#0286FF" />
      <Text className="mt-4 font-Jakarta text-gray-500">Verificando conta...</Text>
    </View>
  );
};

const Home = () => {
  return (
    <>
      <ClerkLoading>
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#0286FF" />
        </View>
      </ClerkLoading>
      <ClerkLoaded>
        <AuthenticatedApp />
      </ClerkLoaded>
    </>
  );
};

export default Home;
