import { useSignIn } from '@clerk/clerk-expo';
import CustomButton from 'components/CustomButton';
import InputField from 'components/InputField';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';

import { icons, images } from '../../constants';

const ForgotPassword = () => {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!isLoaded) return;
    if (isSubmitting) return;

    if (!email.trim()) {
      setError('Por favor, digite seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Formato de email inválido');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Erro ao solicitar redefinição de senha:', err);
      Alert.alert('Erro', err.errors?.[0]?.longMessage || 'Erro ao solicitar redefinição de senha');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-ful relative h-[180px]">
        <Image source={images.signUpCar} className="z-0 h-[180px] w-full" />
        <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black">
          Recuperar Senha
        </Text>
      </View>

      <View className="flex-1 p-5">
        <TouchableOpacity onPress={() => router.back()} className="mb-5">
          <View className="flex-row items-center">
            <Image source={icons.backArrow} className="h-5 w-5" />
            <Text className="ml-2 font-JakartaMedium text-gray-600">Voltar</Text>
          </View>
        </TouchableOpacity>

        <Text className="mb-6 font-Jakarta text-base text-gray-600">
          Digite seu email abaixo e enviaremos instruções para recuperar sua senha.
        </Text>

        <InputField
          placeholderTextColor="gray"
          label="Email"
          placeholder="Digite seu email"
          icon={icons.email}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {error ? <Text className="mt-1 text-sm text-danger-600">{error}</Text> : null}

        <CustomButton
          title={isSubmitting ? 'Enviando...' : 'Enviar Instruções'}
          onPress={handleResetPassword}
          className="mt-6"
          disabled={isSubmitting}
        />

        {isSubmitting && <ActivityIndicator size="small" color="#0286FF" className="mt-4" />}

        <Link href={'/(auth)/sign-in' as any} asChild>
          <Text className="mt-6 text-center text-lg text-general-700">
            Lembrou sua senha?{' '}
            <Text className="font-JakartaSemiBold text-primary-500">Faça login</Text>
          </Text>
        </Link>
      </View>

      <ReactNativeModal isVisible={showSuccessModal}>
        <View className="min-h-[300px] rounded-2xl bg-white px-7 py-9">
          <Image source={images.message} className="mx-auto my-5 h-[110px] w-[110px]" />

          <Text className="text-center font-JakartaExtraBold text-3xl">Email Enviado</Text>

          <Text className="mt-2 text-center font-Jakarta text-base text-gray-400">
            Enviamos um email com instruções para redefinir sua senha. Por favor, verifique sua
            caixa de entrada.
          </Text>

          <CustomButton
            title="Continuar para o Login"
            onPress={() => {
              setShowSuccessModal(false);
              router.replace('/(auth)/reset-password' as any);
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </SafeAreaView>
  );
};

export default ForgotPassword;
