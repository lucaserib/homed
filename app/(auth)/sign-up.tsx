import { Text, ScrollView, View, Image } from 'react-native';
import React, { useState } from 'react';
import { icons, images } from '../../constants';
import InputField from 'components/InputField';
import CustomButton from 'components/CustomButton';
import { Link, router } from 'expo-router';
import OAuth from 'components/OAuth';
import { useSignUp } from '@clerk/clerk-expo';
import ReactNativeModal from 'react-native-modal';

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [verification, setVerification] = useState({
    state: 'success',
    error: '',
    code: '',
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setVerification({
        ...verification,
        state: 'pending',
      });
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (signUpAttempt.status === 'complete') {
        //TODO: Create a database user!

        await setActive({ session: signUpAttempt.createdSessionId });
        setVerification({ ...verification, state: 'success' });
      } else {
        setVerification({ ...verification, error: 'Verification failed', state: 'failed' });
      }
    } catch (err: any) {
      setVerification({ ...verification, error: err.errors[0].longMessage, state: 'failed' });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="w-ful relative h-[250px]">
          <Image source={images.signUpCar} className="z-0 h-[250px] w-full" />
          <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black">
            Criar Conta
          </Text>
        </View>

        <View className="p-5">
          <InputField
            placeholderTextColor="gray"
            label="Name"
            placeholder="Digite seu nome"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            placeholderTextColor="gray"
            label="Email"
            placeholder="Digite seu Email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            placeholderTextColor="gray"
            label="Password"
            placeholder="Digite sua senha"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <CustomButton title="Registrar" onPress={onSignUpPress} className="mt-6" />

          <OAuth />

          <Link href={'/sign-in'} className="mt-10 text-center text-lg text-general-200">
            <Text>Já tem uma conta? </Text>
            <Text className="text-primary-500">Clique para fazer o Login</Text>
          </Link>
        </View>

        {/* Verification Modal */}

        <ReactNativeModal isVisible={verification.state === 'success'}>
          <View className="min-h-[300px] rounded-2xl bg-white px-7 py-9">
            <Image source={images.check} className="mx-auto my-5 h-[110px] w-[110px]" />

            <Text className=" text-center font-JakartaBold text-3xl">Verificado</Text>

            <Text className="mt-2 text-center font-Jakarta text-base text-gray-400">
              Sua conta foi verificada com sucesso.
            </Text>

            <CustomButton
              title="Página Principal"
              onPress={() => router.replace('/(root)/(tabs)/home')}
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
