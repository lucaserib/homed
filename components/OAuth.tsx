import { useSSO } from '@clerk/clerk-expo';
import { googleOAuth } from 'cache';
import { router } from 'expo-router';
import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Image, Alert, ActivityIndicator } from 'react-native';

import CustomButton from './CustomButton';
import { icons } from '../constants/index';

const OAuth = () => {
  const [isReady, setIsReady] = useState(false);

  // Aguardar um momento antes de usar os hooks do Clerk
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500); // Aguardar mais tempo que o componente pai

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View className="mt-4">
        <View className="flex flex-row items-center justify-center gap-x-3">
          <View className="h-[1px] flex-1 bg-general-100" />
          <Text className="text-lg">Ou</Text>
          <View className="h-[1px] flex-1 bg-general-100" />
        </View>
        <View className="mt-5 items-center">
          <ActivityIndicator size="small" color="#0286FF" />
        </View>
      </View>
    );
  }

  return <OAuthContent />;
};

const OAuthContent = () => {
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
  }, [startSSOFlow]);

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
