import { Text, ScrollView, View, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { icons, images } from '../../constants';
import InputField from 'components/InputField';
import CustomButton from 'components/CustomButton';
import { Link, router } from 'expo-router';
import OAuth from 'components/OAuth';
import { useSignUp } from '@clerk/clerk-expo';
import ReactNativeModal from 'react-native-modal';
import { fetchAPI } from 'lib/fetch';

const DoctorSignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModel, setshowSuccessModel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    hourlyRate: '100',
    serviceRadius: '10',
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

    if (!form.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
      isValid = false;
    } else if (form.firstName.length < 2) {
      newErrors.firstName = 'Nome deve ter pelo menos 2 caracteres';
      isValid = false;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
      isValid = false;
    } else if (form.lastName.length < 2) {
      newErrors.lastName = 'Sobrenome deve ter pelo menos 2 caracteres';
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

    if (!form.specialty.trim()) {
      newErrors.specialty = 'Especialidade é obrigatória';
      isValid = false;
    } else if (form.specialty.length < 3) {
      newErrors.specialty = 'Especialidade deve ter pelo menos 3 caracteres';
      isValid = false;
    }

    if (!form.licenseNumber.trim()) {
      newErrors.licenseNumber = 'CRM é obrigatório';
      isValid = false;
    } else {
      const crmRegex = /^[0-9]{5,6}(-[A-Z]{2})?$/;
      if (!crmRegex.test(form.licenseNumber)) {
        newErrors.licenseNumber = 'Número de CRM inválido';
        isValid = false;
      }
    }

    if (!form.hourlyRate.trim()) {
      newErrors.hourlyRate = 'Valor por hora é obrigatório';
      isValid = false;
    } else if (parseFloat(form.hourlyRate) < 100) {
      newErrors.hourlyRate = 'Valor por hora mínimo é R$ 100,00';
      isValid = false;
    }

    if (!form.serviceRadius.trim()) {
      newErrors.serviceRadius = 'Raio de serviço é obrigatório';
      isValid = false;
    } else if (parseFloat(form.serviceRadius) < 10) {
      newErrors.serviceRadius = 'Raio de serviço mínimo é 10 km';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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
        firstName: form.firstName,
        lastName: form.lastName,
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

        await fetchAPI('/(api)/doctor', {
          method: 'POST',
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            specialty: form.specialty,
            licenseNumber: form.licenseNumber,
            hourlyRate: form.hourlyRate,
            serviceRadius: form.serviceRadius,
            clerkId: createdUserId,
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

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="w-ful relative h-[250px]">
          <Image source={images.signUpCar} className="z-0 h-[250px] w-full" />
          <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black">
            Criar Conta Médica
          </Text>
        </View>

        <View className="p-5">
          <InputField
            placeholderTextColor="gray"
            label="Nome"
            placeholder="Digite seu nome"
            icon={icons.person}
            value={form.firstName}
            onChangeText={(value) => {
              setForm({ ...form, firstName: value });
              if (errors.firstName) {
                setErrors({ ...errors, firstName: '' });
              }
            }}
          />
          {errors.firstName ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.firstName}</Text>
          ) : null}

          <InputField
            placeholderTextColor="gray"
            label="Sobrenome"
            placeholder="Digite seu sobrenome"
            icon={icons.person}
            value={form.lastName}
            onChangeText={(value) => {
              setForm({ ...form, lastName: value });
              if (errors.lastName) {
                setErrors({ ...errors, lastName: '' });
              }
            }}
          />
          {errors.lastName ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.lastName}</Text>
          ) : null}

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

          <InputField
            placeholderTextColor="gray"
            label="Especialidade"
            placeholder="Digite sua especialidade"
            icon={icons.specialty}
            value={form.specialty}
            onChangeText={(value) => {
              setForm({ ...form, specialty: value });
              if (errors.specialty) {
                setErrors({ ...errors, specialty: '' });
              }
            }}
          />
          {errors.specialty ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.specialty}</Text>
          ) : null}

          <InputField
            placeholderTextColor="gray"
            label="Número de CRM"
            placeholder="Digite seu número do seu CRM"
            icon={icons.license}
            value={form.licenseNumber}
            onChangeText={(value) => {
              setForm({ ...form, licenseNumber: value });
              if (errors.licenseNumber) {
                setErrors({ ...errors, licenseNumber: '' });
              }
            }}
          />
          {errors.licenseNumber ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.licenseNumber}</Text>
          ) : null}

          <InputField
            placeholderTextColor="gray"
            label="Valor por Hora (R$)"
            placeholder="Digite seu valor por hora"
            icon={icons.dollar}
            value={form.hourlyRate}
            onChangeText={(value) => {
              setForm({ ...form, hourlyRate: value });
              if (errors.hourlyRate) {
                setErrors({ ...errors, hourlyRate: '' });
              }
            }}
            keyboardType="numeric"
          />
          {errors.hourlyRate ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.hourlyRate}</Text>
          ) : null}

          <InputField
            placeholderTextColor="gray"
            label="Raio de Serviço (km)"
            placeholder="Digite o raio de serviço"
            icon={icons.marker}
            value={form.serviceRadius}
            onChangeText={(value) => {
              setForm({ ...form, serviceRadius: value });
              if (errors.serviceRadius) {
                setErrors({ ...errors, serviceRadius: '' });
              }
            }}
            keyboardType="numeric"
          />
          {errors.serviceRadius ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.serviceRadius}</Text>
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
            if (verification.state === 'success') setshowSuccessModel(true);
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

        <ReactNativeModal isVisible={showSuccessModel}>
          <View className="min-h-[300px] rounded-2xl bg-white px-7 py-9">
            <Image source={images.check} className="mx-auto my-5 h-[110px] w-[110px]" />

            <Text className="text-center font-JakartaExtraBold text-3xl">Verificado</Text>

            <Text className="mt-2 text-center font-Jakarta text-base text-gray-400">
              Sua conta médica foi verificada com sucesso.
            </Text>

            <CustomButton
              title="Ir para o Dashboard"
              onPress={() =>
                router.replace({
                  pathname: '/(doctor)/(tabs)/dashboard',
                } as any)
              }
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default DoctorSignUp;
