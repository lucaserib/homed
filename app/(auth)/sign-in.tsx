import { useSignIn, useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from 'components/CustomButton';
import InputField from 'components/InputField';
import OAuth from 'components/OAuth';
import { Link, router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import React, { useState, useCallback } from 'react';
import {
  Text,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { icons, images } from '../../constants';

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { userId } = useAuth();

  const [isDoctor, setIsDoctor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  // Otimizar callbacks para evitar re-renders
  const handleEmailChange = useCallback((email: string) => {
    setForm(prev => ({ ...prev, email }));
  }, []);

  const handlePasswordChange = useCallback((password: string) => {
    setForm(prev => ({ ...prev, password }));
  }, []);

  // Aguardar até que tudo esteja carregado
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0286FF" />
        <Text className="mt-2 text-gray-500">Carregando...</Text>
      </View>
    );
  }

  const onSignInPress = async () => {
    if (!signIn || !setActive || isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log(`🔐 Iniciando login como ${isDoctor ? 'Médico' : 'Paciente'}...`);

      await AsyncStorage.setItem('intendedRole', isDoctor ? 'doctor' : 'patient');

      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === 'complete') {
        console.log('✅ Autenticação completa. Session ID:', signInAttempt.createdSessionId);

        await setActive({ session: signInAttempt.createdSessionId });

        console.log('✅ Sessão ativada. Redirecionando...');

        router.replace('/');
      } else {
        console.warn('⚠️ Status de autenticação:', signInAttempt.status);
        Alert.alert('Erro', 'Falha na autenticação. Tente novamente.');
      }
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      const errorMessage = err.errors?.[0]?.message || 'Verifique seu email e senha e tente novamente.';
      Alert.alert('Erro de login', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative h-[250px] w-full">
          <Image source={images.signUpCar} className="z-0 h-[250px] w-full" />
          <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black">
            Seja bem-vindo!
          </Text>
        </View>

        <View className="p-5">
          {/* Seletor de tipo de usuário - SEM SHADOW PROBLEMÁTICO */}
          <View className="mb-4 flex-row justify-center rounded-xl bg-general-100 p-1">
            <TouchableOpacity
              onPress={() => setIsDoctor(false)}
              className={`flex-1 items-center rounded-lg py-3 ${
                !isDoctor ? 'bg-white' : ''
              }`}>
              <Text
                className={`font-JakartaSemiBold ${
                  !isDoctor ? 'text-primary-500' : 'text-secondary-700'
                }`}>
                Paciente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsDoctor(true)}
              className={`flex-1 items-center rounded-lg py-3 ${
                isDoctor ? 'bg-white' : ''
              }`}>
              <Text
                className={`font-JakartaSemiBold ${
                  isDoctor ? 'text-primary-500' : 'text-secondary-700'
                }`}>
                Médico
              </Text>
            </TouchableOpacity>
          </View>

          <InputField
            placeholderTextColor="gray"
            label="Email"
            placeholder="Digite seu email"
            icon={icons.email}
            value={form.email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField
            placeholderTextColor="gray"
            label="Senha"
            placeholder="Digite sua senha"
            icon={icons.lock}
            secureTextEntry
            value={form.password}
            onChangeText={handlePasswordChange}
          />

          <Link href={'/(auth)/forgot-password' as any} asChild>
            <Text className="mt-1 text-right font-JakartaMedium text-sm text-primary-500">
              Esqueceu sua senha?
            </Text>
          </Link>

          <CustomButton
            title={isSubmitting ? 'Processando...' : isDoctor ? 'Entrar como Médico' : 'Entrar'}
            onPress={onSignInPress}
            className="mt-6"
            disabled={isSubmitting}
          />

          {isSubmitting && <ActivityIndicator size="small" color="#0286FF" className="mt-2" />}

          <OAuth />

          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-center text-lg text-general-800">Não tem uma conta? </Text>
            {isDoctor ? (
              <Link href={'/(auth)/doctor-sign-up' as any} asChild>
                <Text className="text-center font-JakartaSemiBold text-lg text-primary-500">
                  Cadastre-se como Médico
                </Text>
              </Link>
            ) : (
              <Link href={'/(auth)/sign-up' as any} asChild>
                <Text className="text-center font-JakartaSemiBold text-lg text-primary-500">
                  Cadastre-se
                </Text>
              </Link>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;