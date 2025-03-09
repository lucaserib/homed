import { Text, SafeAreaView, ScrollView, View, Image } from 'react-native';
import React, { useState } from 'react';
import { icons, images } from '../../constants';
import InputField from 'components/InputField';
import CustomButton from 'components/CustomButton';
import { Link } from 'expo-router';
import OAuth from 'components/OAuth';

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const onSignInPress = async () => {};

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
          <InputField
            placeholderTextColor="gray"
            label="Email"
            placeholder="Enter your email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            placeholderTextColor="gray"
            label="Password"
            placeholder="Enter your password"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <CustomButton title="Entrar" onPress={onSignInPress} className="mt-6" />

          <OAuth />

          <Link href={'/sign-up'} className="mt-10 text-center text-lg text-general-200">
            <Text>Não tem uma conta? </Text>
            <Text className="text-primary-500">Clique para criar</Text>
          </Link>
        </View>

        {/* Verification Model */}
      </View>
    </ScrollView>
  );
};

export default SignIn;
