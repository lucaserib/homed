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
import React, { useState } from 'react';
import { icons, images } from '../../constants';
import InputField from 'components/InputField';
import CustomButton from 'components/CustomButton';
import { Link, router } from 'expo-router';
import OAuth from 'components/OAuth';
import { useSignUp } from '@clerk/clerk-expo';
import ReactNativeModal from 'react-native-modal';
import { fetchAPI } from 'lib/fetch';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { maskCPF } from 'lib/mask';

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
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
      setProfileImage(result.assets[0].uri);
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
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setVerification({
        ...verification,
        state: 'pending',
      });
    } catch (err: any) {
      console.log(err);
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
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === 'complete') {
        const { createdSessionId, createdUserId } = completeSignUp;

        const formattedDate = form.dateOfBirth.toISOString();

        let imageUrl = null;
        if (profileImage) {
          const uploadResponse = await fetchAPI('/(api)/upload/image', {
            method: 'POST',
            body: JSON.stringify({
              image: profileImage,
              folder: 'patients',
              publicId: `patient_${createdUserId}`,
            }),
          });

          if (uploadResponse.success) {
            imageUrl = uploadResponse.imageUrl;
          }
        }

        await fetchAPI('/(api)/user', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            clerkId: createdUserId,
            dateOfBirth: formattedDate,
            gender: form.gender,
            cpf: form.cpf.replace(/[^\d]/g, ''),
            address: form.address,
            profileImageUrl: imageUrl,
          }),
        });

        await setActive({ session: createdSessionId });
        setVerification({ ...verification, state: 'success' });
      } else {
        setVerification({ ...verification, error: 'Verificação falhou', state: 'failed' });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors?.[0]?.longMessage || 'Erro de verificação',
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
            onChangeText={(value) => {
              setForm({ ...form, name: value });
              if (errors.name) {
                setErrors({ ...errors, name: '' });
              }
            }}
          />
          {errors.name ? <Text className="mt-1 text-sm text-danger-600">{errors.name}</Text> : null}

          <InputField
            placeholderTextColor="gray"
            label="Email"
            placeholder="Digite seu Email"
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
          {errors.email ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.email}</Text>
          ) : null}

          <InputField
            placeholderTextColor="gray"
            label="Senha"
            placeholder="Digite sua senha"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => {
              setForm({ ...form, password: value });
              if (errors.password) {
                setErrors({ ...errors, password: '' });
              }
            }}
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
            onChangeText={(value) => {
              setForm({ ...form, phone: value });
              if (errors.phone) {
                setErrors({ ...errors, phone: '' });
              }
            }}
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

          {/* Gênero */}
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
            onChangeText={(value) => {
              const maskedValue = maskCPF(value);
              setForm({ ...form, cpf: maskedValue });
              if (errors.cpf) {
                setErrors({ ...errors, cpf: '' });
              }
            }}
            keyboardType="numeric"
            maxLength={14} // 11 dígitos + 3 caracteres de formatação
          />
          {errors.cpf ? <Text className="mt-1 text-sm text-danger-600">{errors.cpf}</Text> : null}

          <InputField
            placeholderTextColor="gray"
            label="Endereço"
            placeholder="Digite seu endereço completo"
            icon={icons.marker}
            value={form.address}
            onChangeText={(value) => {
              setForm({ ...form, address: value });
              if (errors.address) {
                setErrors({ ...errors, address: '' });
              }
            }}
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

          <OAuth />

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
              onChangeText={(code) => setVerification({ ...verification, code, error: '' })}
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

            <Text className="text-center font-JakartaExtraBold text-3xl">Verificado</Text>

            <Text className="mt-2 text-center font-Jakarta text-base text-gray-400">
              Sua conta foi verificada com sucesso.
            </Text>

            <CustomButton
              title="Ir para Página Principal"
              onPress={() => router.replace('/(root)/(tabs)/home')}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
