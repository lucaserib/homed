import { useSignIn } from '@clerk/clerk-expo';
import CustomButton from 'components/CustomButton';
import InputField from 'components/InputField';
import { router } from 'expo-router';
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

const ResetPassword = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Formato de email inválido';
        isValid = false;
      }
    }

    if (!form.code.trim()) {
      newErrors.code = 'Código de verificação é obrigatório';
      isValid = false;
    }

    if (!form.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
      isValid = false;
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = 'A senha deve ter pelo menos 8 caracteres';
      isValid = false;
    }

    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!isLoaded) return;
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: form.code,
        password: form.newPassword,
      });

      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }

        setShowSuccessModal(true);
      } else {
        Alert.alert('Aviso', 'Não foi possível redefinir sua senha. Por favor, tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      Alert.alert('Erro', err.errors?.[0]?.longMessage || 'Erro ao redefinir senha');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-ful relative h-[180px]">
        <Image source={images.signUpCar} className="z-0 h-[180px] w-full" />
        <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black">
          Redefinir Senha
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
          Digite o código de verificação que enviamos por e-mail e sua nova senha.
        </Text>

        <InputField
          placeholderTextColor="gray"
          label="Email"
          placeholder="Digite seu email"
          icon={icons.email}
          value={form.email}
          onChangeText={(value) => {
            setForm({ ...form, email: value });
            if (errors.email) {
              setErrors({ ...errors, email: '' });
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? <Text className="mt-1 text-sm text-danger-600">{errors.email}</Text> : null}

        <InputField
          placeholderTextColor="gray"
          label="Código de Verificação"
          placeholder="Digite o código recebido por email"
          icon={icons.lock}
          value={form.code}
          onChangeText={(value) => {
            setForm({ ...form, code: value });
            if (errors.code) {
              setErrors({ ...errors, code: '' });
            }
          }}
          keyboardType="number-pad"
        />
        {errors.code ? <Text className="mt-1 text-sm text-danger-600">{errors.code}</Text> : null}

        <InputField
          placeholderTextColor="gray"
          label="Nova Senha"
          placeholder="Digite sua nova senha"
          icon={icons.lock}
          secureTextEntry
          value={form.newPassword}
          onChangeText={(value) => {
            setForm({ ...form, newPassword: value });
            if (errors.newPassword) {
              setErrors({ ...errors, newPassword: '' });
            }
          }}
        />
        {errors.newPassword ? (
          <Text className="mt-1 text-sm text-danger-600">{errors.newPassword}</Text>
        ) : null}

        <InputField
          placeholderTextColor="gray"
          label="Confirmar Nova Senha"
          placeholder="Confirme sua nova senha"
          icon={icons.lock}
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(value) => {
            setForm({ ...form, confirmPassword: value });
            if (errors.confirmPassword) {
              setErrors({ ...errors, confirmPassword: '' });
            }
          }}
        />
        {errors.confirmPassword ? (
          <Text className="mt-1 text-sm text-danger-600">{errors.confirmPassword}</Text>
        ) : null}

        <CustomButton
          title={isSubmitting ? 'Processando...' : 'Redefinir Senha'}
          onPress={handleResetPassword}
          className="mt-6"
          disabled={isSubmitting}
        />

        {isSubmitting && <ActivityIndicator size="small" color="#0286FF" className="mt-4" />}
      </View>

      <ReactNativeModal isVisible={showSuccessModal}>
        <View className="min-h-[300px] rounded-2xl bg-white px-7 py-9">
          <Image source={images.check} className="mx-auto my-5 h-[110px] w-[110px]" />

          <Text className="text-center font-JakartaExtraBold text-3xl">Senha Redefinida</Text>

          <Text className="mt-2 text-center font-Jakarta text-base text-gray-400">
            Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
          </Text>

          <CustomButton
            title="Ir para o Login"
            onPress={() => {
              setShowSuccessModal(false);
              router.replace('/(auth)/sign-in');
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </SafeAreaView>
  );
};

export default ResetPassword;
