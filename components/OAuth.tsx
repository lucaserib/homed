import { View, Text, Image, Alert } from 'react-native';
import React, { useCallback } from 'react';
import CustomButton from './CustomButton';
import { icons } from '../constants/index';
import { useSSO } from '@clerk/clerk-expo';
import { googleOAuth } from 'cache';
import { router } from 'expo-router';

const OAuth = () => {
  const { startSSOFlow } = useSSO();

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const result = await googleOAuth(startSSOFlow);

      if (result.success) {
        Alert.alert('Sucesso', result.message);
        router.push('/(root)/(tabs)/home');
      } else {
        Alert.alert('Erro', result.message);
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Erro', 'falha na autenticação');
    }
  }, []);
  return (
    <View>
      <View className="mt-4 flex flex-row items-center justify-center gap-x-3">
        <View className="h-[1px] flex-1 bg-general-100" />
        <Text className="text-lg">Ou</Text>
        <View className="h-[1px] flex-1 bg-general-100" />
      </View>
      <CustomButton
        title="Entre com Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image source={icons.google} resizeMode="contain" className="mx-2 h-5 w-5" />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;
