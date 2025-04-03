import { Text, SafeAreaView, ScrollView, View, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { icons, images } from '../../constants';
import InputField from 'components/InputField';
import CustomButton from 'components/CustomButton';
import { Link, useRouter } from 'expo-router';
import OAuth from 'components/OAuth';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { fetchAPI } from 'lib/fetch';

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { userId } = useAuth();
  const router = useRouter();
  const [isDoctor, setIsDoctor] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });

        if (isDoctor) {
          // Verificar se é médico
          try {
            // Usar o userId do hook useAuth após login
            const currentUserId = userId;
            if (!currentUserId) {
              throw new Error('User ID não disponível');
            }

            const response = await fetchAPI(`/(api)/doctor/check/${currentUserId}`);
            if (response.data) {
              router.replace({
                pathname: '/(doctor)/(tabs)/dashboard',
              } as any);
            } else {
              Alert.alert(
                'Erro de acesso',
                'Você não está registrado como médico. Deseja criar uma conta de médico?',
                [
                  {
                    text: 'Não',
                    style: 'cancel',
                    onPress: () => router.replace('/(root)/(tabs)/home'),
                  },
                  {
                    text: 'Sim',
                    onPress: () => router.replace('/(auth)/doctor-sign-up'),
                  },
                ]
              );
            }
          } catch (error) {
            console.error('Erro ao verificar status de médico:', error);
            Alert.alert('Erro', 'Não foi possível verificar seu status de médico.');
            router.replace('/(root)/(tabs)/home');
          }
        } else {
          router.replace('/(root)/(tabs)/home');
        }
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Erro de login', 'Verifique seu email e senha e tente novamente.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="w-ful relative h-[250px]">
          <Image source={images.signUpCar} className="z-0 h-[250px] w-full" />
          <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black">
            Seja bem-vindo!
          </Text>
        </View>

        <View className="p-5">
          {/* Seletor de tipo de usuário */}
          <View className="mb-4 flex-row justify-center rounded-xl bg-general-100 p-1">
            <TouchableOpacity
              onPress={() => setIsDoctor(false)}
              className={`flex-1 items-center rounded-lg py-3 ${!isDoctor ? 'bg-white shadow-sm' : ''}`}>
              <Text
                className={`font-JakartaSemiBold ${!isDoctor ? 'text-primary-500' : 'text-secondary-700'}`}>
                Paciente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsDoctor(true)}
              className={`flex-1 items-center rounded-lg py-3 ${isDoctor ? 'bg-white shadow-sm' : ''}`}>
              <Text
                className={`font-JakartaSemiBold ${isDoctor ? 'text-primary-500' : 'text-secondary-700'}`}>
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
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            placeholderTextColor="gray"
            label="Senha"
            placeholder="Digite sua senha"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <CustomButton
            title={isDoctor ? 'Entrar como Médico' : 'Entrar'}
            onPress={onSignInPress}
            className="mt-6"
          />

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
