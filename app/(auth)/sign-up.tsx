import { useSignUp } from '@clerk/clerk-expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomButton from 'components/CustomButton';
import InputField from 'components/InputField';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { Link, router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import { maskCPF } from 'lib/mask';
import React, { useState, useCallback } from 'react';
import {
  Text,
  ScrollView,
  View,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';

import { icons, images } from '../../constants';

const SignUp = () => {
  const { isLoaded, signUp } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: new Date(2000, 0, 1),
    gender: 'male',
    cpf: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [verification, setVerification] = useState({
    state: 'default',
    error: '',
    code: '',
  });

  const handleNameChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, name: value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  }, [errors.name]);

  const handleEmailChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, email: value }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }, [errors.email]);

  const handlePasswordChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, password: value }));
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  }, [errors.password]);

  const handlePhoneChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, phone: value }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  }, [errors.phone]);

  const handleAddressChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, address: value }));
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }
  }, [errors.address]);

  const handleCpfChange = useCallback((value: string) => {
    const maskedValue = maskCPF(value);
    setForm(prev => ({ ...prev, cpf: maskedValue }));
    if (errors.cpf) {
      setErrors(prev => ({ ...prev, cpf: '' }));
    }
  }, [errors.cpf]);

  const handleVerificationCodeChange = useCallback((code: string) => {
    setVerification(prev => ({ ...prev, code, error: '' }));
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    } else if (form.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
      isValid = false;
    }

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

    if (!form.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (form.password.length < 8) {
      newErrors.password = 'A senha deve ter pelo menos 8 caracteres';
      isValid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
      isValid = false;
    } else {
      const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(form.phone)) {
        newErrors.phone = 'Formato de telefone inválido. Use (XX) XXXXX-XXXX';
        isValid = false;
      }
    }

    if (!form.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
      isValid = false;
    } else {
      const cpfClean = form.cpf.replace(/[^\d]/g, '');
      if (cpfClean.length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos';
        isValid = false;
      }
    }

    if (!form.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
      isValid = false;
    }

    const today = new Date();
    const birthDate = new Date(form.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 18) {
        newErrors.dateOfBirth = 'Você deve ter pelo menos 18 anos';
        isValid = false;
      }
    } else if (age < 18) {
      newErrors.dateOfBirth = 'Você deve ter pelo menos 18 anos';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const base64 = result.assets[0].base64;
      if (base64) {
        setProfileImage(`data:image/jpeg;base64,${base64}`);
      }
    }
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Iniciando registro de paciente...');

      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      console.log('📧 Preparando envio de código de verificação...');

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      console.log('✅ Código de verificação enviado para:', form.email);

      setVerification({
        ...verification,
        state: 'pending',
      });
    } catch (err: any) {
      console.error('❌ Erro ao criar conta:', err);
      Alert.alert('Erro', err.errors?.[0]?.longMessage || 'Erro ao criar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    if (isSubmitting) return;

    if (!verification.code.trim()) {
      setVerification({ ...verification, error: 'Código de verificação é obrigatório' });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔐 Iniciando verificação de email...');

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status !== 'complete') {
        setVerification({ ...verification, error: 'Código de verificação inválido', state: 'failed' });
        setIsSubmitting(false);
        return;
      }

      const { createdUserId } = completeSignUp;
      console.log('✅ Verificação completa. Clerk User ID:', createdUserId);

      console.log('📝 Criando paciente no banco de dados...');

      await fetchAPI('/auth/register/patient', {
        method: 'POST',
        body: JSON.stringify({
          clerkId: createdUserId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth.toISOString(),
          gender: form.gender,
          cpf: form.cpf,
          address: form.address,
          profileImageUrl: profileImage,
        }),
      });

      console.log('✅ Paciente criado no banco com status PENDING!');

      setVerification({ ...verification, state: 'success' });
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('❌ Erro no registro:', err);

      let message = 'Erro de verificação';
      if (err.status === 409 || err.message?.includes('Conflict')) {
        message = 'Esta conta já está registrada como Médico. Por favor, use outro email ou entre em contato com o suporte.';
      } else if (err.errors?.[0]?.longMessage) {
        message = err.errors[0].longMessage;
      } else if (err.message) {
        message = err.message;
      }

      setVerification({
        ...verification,
        error: message,
        state: 'failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenderChange = (gender: 'male' | 'female') => {
    setForm({ ...form, gender });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm({ ...form, dateOfBirth: selectedDate });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="w-ful relative h-[180px]">
          <Image source={images.signUpCar} className="z-0 h-[180px] w-full" />
          <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black">
            Criar Conta
          </Text>
        </View>

        <View className="p-5">
          <View className="mb-5 items-center">
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {profileImage ? (
                  <Image source={{ uri: profileImage }} className="h-full w-full" />
                ) : (
                  <Image source={icons.person} className="h-8 w-8" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                <Image source={icons.plus} className="h-4 w-4" tintColor="white" />
              </View>
            </TouchableOpacity>
            <Text className="mt-2 text-center text-sm text-gray-500">Adicionar foto</Text>
          </View>

          <InputField
            placeholderTextColor="gray"
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            icon={icons.person}
            value={form.name}
            onChangeText={handleNameChange}
          />
          {errors.name ? <Text className="mt-1 text-sm text-danger-600">{errors.name}</Text> : null}

          <InputField
            placeholderTextColor="gray"
            label="Email"
            placeholder="Digite seu Email"
            icon={icons.email}
            value={form.email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.email}</Text>
          ) : null}

          <InputField
            placeholderTextColor="gray"
            label="Senha"
            placeholder="Digite sua senha"
            icon={icons.lock}
            secureTextEntry
            value={form.password}
            onChangeText={handlePasswordChange}
          />
          {errors.password ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.password}</Text>
          ) : null}

          <InputField
            placeholderTextColor="gray"
            label="Telefone"
            placeholder="Digite seu telefone"
            icon={icons.phone}
            value={form.phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
          />
          {errors.phone ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.phone}</Text>
          ) : null}

          <View className="mb-3">
            <Text className="mb-1 font-JakartaSemiBold text-lg">Data de Nascimento</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center rounded-full border border-neutral-100 bg-neutral-100 p-4">
              <Image source={icons.calendar} className="mr-3 h-6 w-6" />
              <Text className="font-JakartaSemiBold text-[15px]">
                {format(form.dateOfBirth, 'dd/MM/yyyy', { locale: ptBR })}
              </Text>
            </TouchableOpacity>
            {errors.dateOfBirth ? (
              <Text className="mt-1 text-sm text-danger-600">{errors.dateOfBirth}</Text>
            ) : null}

            {showDatePicker && (
              <DateTimePicker
                value={form.dateOfBirth}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View className="mb-3">
            <Text className="mb-1 font-JakartaSemiBold text-lg">Gênero</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => handleGenderChange('male')}
                className={`flex-1 flex-row items-center justify-center rounded-full p-3 ${
                  form.gender === 'male' ? 'bg-primary-500' : 'bg-neutral-100'
                }`}>
                <Text
                  className={`font-JakartaSemiBold ${
                    form.gender === 'male' ? 'text-white' : 'text-gray-800'
                  }`}>
                  Masculino
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleGenderChange('female')}
                className={`flex-1 flex-row items-center justify-center rounded-full p-3 ${
                  form.gender === 'female' ? 'bg-primary-500' : 'bg-neutral-100'
                }`}>
                <Text
                  className={`font-JakartaSemiBold ${
                    form.gender === 'female' ? 'text-white' : 'text-gray-800'
                  }`}>
                  Feminino
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <InputField
            placeholderTextColor="gray"
            label="CPF"
            placeholder="Digite seu CPF"
            icon={icons.document}
            value={form.cpf}
            onChangeText={handleCpfChange}
            keyboardType="numeric"
            maxLength={14}
          />
          {errors.cpf ? <Text className="mt-1 text-sm text-danger-600">{errors.cpf}</Text> : null}

          <InputField
            placeholderTextColor="gray"
            label="Endereço"
            placeholder="Digite seu endereço completo"
            icon={icons.marker}
            value={form.address}
            onChangeText={handleAddressChange}
          />
          {errors.address ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.address}</Text>
          ) : null}

          <CustomButton
            title={isSubmitting ? 'Processando...' : 'Registrar'}
            onPress={onSignUpPress}
            className="mt-6"
            disabled={isSubmitting}
          />

          <Link href={'/(auth)/sign-in' as any} asChild>
            <Text className="mt-6 text-center text-lg text-general-700">
              Já tem uma conta?{' '}
              <Text className="font-JakartaSemiBold text-primary-500">Faça login</Text>
            </Text>
          </Link>
        </View>

        <ReactNativeModal
          isVisible={verification.state === 'pending'}
          onModalHide={() => {
            if (verification.state === 'success') setShowSuccessModal(true);
          }}>
          <View className="min-h-[300px] rounded-2xl bg-white px-7 py-9">
            <Text className="mb-2 font-JakartaExtraBold text-2xl">Verificação</Text>
            <Text className="mb-5 font-Jakarta">
              Enviamos um código de verificação para {form.email}
            </Text>

            <InputField
              label="Código"
              icon={icons.lock}
              placeholder="Digite seu Código"
              placeholderTextColor="gray"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={handleVerificationCodeChange}
            />

            {verification.error && (
              <Text className="mt-1 text-sm text-danger-600">{verification.error}</Text>
            )}

            <CustomButton
              title={isSubmitting ? 'Verificando...' : 'Verificar Email'}
              onPress={onVerifyPress}
              className="mt-5 bg-success-500"
              disabled={isSubmitting}
            />

            {isSubmitting && <ActivityIndicator size="small" color="#0286FF" className="mt-2" />}
          </View>
        </ReactNativeModal>

        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="min-h-[300px] rounded-2xl bg-white px-7 py-9">
            <Image source={images.check} className="mx-auto my-5 h-[110px] w-[110px]" />

            <Text className="text-center font-JakartaExtraBold text-3xl">Cadastro Enviado</Text>

            <Text className="mt-2 text-center font-Jakarta text-base text-gray-400">
              Seu cadastro foi enviado com sucesso e está em análise pela nossa equipe. Você
              receberá um email quando sua conta for aprovada.
            </Text>

            <CustomButton
              title="Voltar para Login"
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/(auth)/sign-in');
              }}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
