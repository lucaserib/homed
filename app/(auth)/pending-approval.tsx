import CustomButton from 'components/CustomButton';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';

const PendingApproval = () => {
  const { signOut } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkApprovalStatus = async () => {
    setIsChecking(true);
    try {
      console.log('🔄 Verificando status de aprovação...');

      const response = await fetchAPI('/sync/status');

      console.log('📊 Status recebido:', response);

      if (response.exists && response.status === 'APPROVED') {
        Alert.alert(
          '🎉 Aprovado!',
          'Seu cadastro foi aprovado! Você será redirecionado para fazer login.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(auth)/sign-in');
              },
            },
          ]
        );
      } else if (response.exists && response.status === 'REJECTED') {
        Alert.alert(
          '❌ Cadastro Rejeitado',
          'Infelizmente seu cadastro foi rejeitado. Entre em contato com o suporte para mais informações.',
          [{ text: 'OK' }]
        );
      } else if (response.exists && response.status === 'PENDING') {
        Alert.alert(
          '⏳ Ainda em Análise',
          'Seu cadastro ainda está sendo analisado. Aguarde o email de confirmação.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '⚠️ Erro',
          'Não foi possível verificar seu status. Tente novamente mais tarde.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Erro ao verificar status:', error);
      Alert.alert(
        'Erro',
        'Não foi possível verificar seu status. Verifique sua conexão e tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-1 items-center justify-center px-6 py-12">
          <Image source={images.check} className="mb-8 h-32 w-32 opacity-60" resizeMode="contain" />

          <Text className="mb-3 text-center font-JakartaExtraBold text-3xl text-gray-900">
            Cadastro em Análise
          </Text>

          <View className="mb-8 w-full rounded-2xl bg-yellow-50 p-6">
            <Text className="mb-4 text-center font-JakartaSemiBold text-lg text-yellow-800">
              Aguarde a Aprovação
            </Text>

            <Text className="mb-4 text-center font-Jakarta text-base leading-6 text-gray-700">
              Seu cadastro foi enviado com sucesso e está sendo analisado pela nossa equipe de
              validação.
            </Text>

            <View className="mt-4">
              <View className="mb-3 flex-row items-start">
                <Text className="mr-2 font-JakartaBold text-lg text-primary-500">✓</Text>
                <Text className="flex-1 font-Jakarta text-sm text-gray-600">
                  Nossa equipe revisará seus dados e documentos
                </Text>
              </View>

              <View className="mb-3 flex-row items-start">
                <Text className="mr-2 font-JakartaBold text-lg text-primary-500">✓</Text>
                <Text className="flex-1 font-Jakarta text-sm text-gray-600">
                  Você receberá um email com o resultado em até 48 horas
                </Text>
              </View>

              <View className="flex-row items-start">
                <Text className="mr-2 font-JakartaBold text-lg text-primary-500">✓</Text>
                <Text className="flex-1 font-Jakarta text-sm text-gray-600">
                  Após aprovação, você poderá fazer login e acessar sua conta
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-8 w-full rounded-xl bg-blue-50 p-4">
            <Text className="text-center font-Jakarta text-sm text-blue-700">
              <Text className="font-JakartaBold">Importante:</Text> Verifique sua caixa de entrada e
              spam para não perder o email de aprovação.
            </Text>
          </View>

          <CustomButton
            title={isChecking ? 'Verificando...' : 'Verificar Status da Aprovação'}
            onPress={checkApprovalStatus}
            disabled={isChecking}
            className="mb-4 w-full bg-primary-500"
            IconLeft={
              isChecking
                ? () => <ActivityIndicator size="small" color="white" className="mr-2" />
                : undefined
            }
          />

          <CustomButton
            title="Voltar para Login"
            onPress={() => router.replace('/(auth)/sign-in')}
            bgVariant="outline"
            textVariant="primary"
            className="mb-4 w-full"
          />

          <CustomButton
            title="Ir para Início"
            onPress={() => router.replace('/(auth)/welcome')}
            bgVariant="outline"
            textVariant="secondary"
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PendingApproval;
