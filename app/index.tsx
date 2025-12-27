import { useAuth, useUser, ClerkLoaded, ClerkLoading } from '@clerk/clerk-expo';
import { Redirect, router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import CustomButton from 'components/CustomButton';

const AuthenticatedApp = () => {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checkUserStatus = async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      console.log('🔓 Usuário não autenticado, redirecionando para welcome...');
      setTimeout(() => {
        router.replace('/(auth)/welcome');
      }, 100);
      return;
    }

    console.log('🔍 Verificando status do usuário autenticado...');

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const response = await fetchAPI('/sync/status');

      console.log('🔄 Sync Status:', response);

      if (response?.exists) {
        if (response.status === 'APPROVED') {
          if (response.role === 'doctor') {
            console.log('✅ Médico aprovado, redirecionando para dashboard...');
            router.replace('/(doctor)/(tabs)/dashboard');
          } else if (response.role === 'patient') {
            console.log('✅ Paciente aprovado, redirecionando para home...');
            router.replace('/(root)/(tabs)/home');
          }
        } else if (response.status === 'PENDING') {
          console.log('⏳ Conta pendente de aprovação...');
          await signOut();
          router.replace('/(auth)/pending-approval');
        } else if (response.status === 'REJECTED') {
          console.log('❌ Cadastro rejeitado');
          setErrorMessage('Seu cadastro foi rejeitado. Entre em contato com o suporte para mais informações.');
          setHasError(true);
        } else if (response.status === 'UNDER_REVIEW') {
          console.log('🔍 Cadastro em revisão...');
          await signOut();
          router.replace('/(auth)/pending-approval');
        }
      } else {
        console.warn('⚠️ Usuário autenticado no Clerk mas não encontrado no banco de dados');
        setErrorMessage('Sua conta não foi encontrada. Por favor, complete seu cadastro novamente.');
        setHasError(true);
      }
    } catch (error: any) {
      console.error('❌ Erro ao verificar status:', error);

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
      console.log('🚪 Realizando logout...');
      await signOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
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
