import { useSignUp } from '@clerk/clerk-expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from 'components/CustomButton';
import InputField from 'components/InputField';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { Link, router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import { maskCPF, maskCNPJ } from 'lib/mask';
import React, { useState, useCallback } from 'react';
import { useOptimizedForm } from 'hooks/useOptimizedForm';
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

const DoctorSignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: new Date(1980, 0, 1),
    specialty: '',
    licenseNumber: '',
    cpf: '',
    cnpj: '',
    companyName: '', // Razão social
    address: '',
    hourlyRate: '150',
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

    if (!form.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
      isValid = false;
    } else {
      // Removendo a formatação para validar
      const cpfClean = form.cpf.replace(/[^\d]/g, '');
      if (cpfClean.length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos';
        isValid = false;
      }
    }

    if (!form.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
      isValid = false;
    } else {
      // Removendo a formatação para validar
      const cnpjClean = form.cnpj.replace(/[^\d]/g, '');
      if (cnpjClean.length !== 14) {
        newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
        isValid = false;
      }
    }

    if (!form.companyName.trim()) {
      newErrors.companyName = 'Razão Social é obrigatória';
      isValid = false;
    }

    if (!form.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
      isValid = false;
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

    // Verificar idade (deve ser maior que 21 anos para médicos)
    const today = new Date();
    const birthDate = new Date(form.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 21) {
        newErrors.dateOfBirth = 'Você deve ter pelo menos 21 anos';
        isValid = false;
      }
    } else if (age < 21) {
      newErrors.dateOfBirth = 'Você deve ter pelo menos 21 anos';
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
      // Armazenar base64 para upload
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
      console.log('🚀 Iniciando registro de médico...');

      await AsyncStorage.setItem('intendedRole', 'doctor');

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
      const errorMessage = err.errors?.[0]?.longMessage || 'Erro ao criar conta';

      if (errorMessage.includes("You're already signed in") || errorMessage.includes("already signed in")) {
        Alert.alert('Aviso', 'Você já está logado. Redirecionando...', [
          { text: 'OK', onPress: () => router.replace('/') }
        ]);
        return;
      }

      Alert.alert('Erro', errorMessage);
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

      const { createdSessionId, createdUserId } = completeSignUp;
      console.log('✅ Verificação completa. Clerk User ID:', createdUserId);

      const formattedDate = form.dateOfBirth.toISOString();

      let imageUrl = null;

      console.log('📝 Criando médico no banco de dados...');

      await fetchAPI('/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify({
          clerkId: createdUserId,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dateOfBirth: formattedDate,
          specialty: form.specialty,
          licenseNumber: form.licenseNumber,
          cpf: form.cpf.replace(/[^\d]/g, ''),
          cnpj: form.cnpj.replace(/[^\d]/g, ''),
          companyName: form.companyName,
          address: form.address,
          hourlyRate: parseFloat(form.hourlyRate || '0'),
          profileImageUrl: imageUrl,
        }),
      });

      console.log('✅ Médico criado no banco com status PENDING!');

      setVerification({ ...verification, state: 'success' });
    } catch (err: any) {
      console.error('❌ Erro no registro:', err);

      let message = 'Erro de verificação';
      if (err.status === 409 || err.message?.includes('Conflict')) {
        message = 'Esta conta já está registrada como Paciente. Por favor, use outro email ou entre em contato com o suporte.';
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
            Criar Conta Médica
          </Text>
        </View>

        <View className="p-5">
          {/* Foto de perfil */}
          <View className="mb-5 items-center">
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {profileImage ? (
                  <Image source={{ uri: profileImage }} className="h-full w-full" />
                ) : (
                  <Image source={icons.doctor} className="h-8 w-8" />
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

          {/* Data de Nascimento */}
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
            placeholder="Digite seu número do CRM"
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
            maxLength={14}
          />
          {errors.cpf ? <Text className="mt-1 text-sm text-danger-600">{errors.cpf}</Text> : null}

          <InputField
            placeholderTextColor="gray"
            label="CNPJ"
            placeholder="Digite seu CNPJ"
            icon={icons.document}
            value={form.cnpj}
            onChangeText={(value) => {
              const maskedValue = maskCNPJ(value);
              setForm({ ...form, cnpj: maskedValue });
              if (errors.cnpj) {
                setErrors({ ...errors, cnpj: '' });
              }
            }}
            keyboardType="numeric"
            maxLength={18}
          />
          {errors.cnpj ? <Text className="mt-1 text-sm text-danger-600">{errors.cnpj}</Text> : null}

          <InputField
            placeholderTextColor="gray"
            label="Razão Social"
            placeholder="Digite a razão social"
            icon={icons.building}
            value={form.companyName}
            onChangeText={(value) => {
              setForm({ ...form, companyName: value });
              if (errors.companyName) {
                setErrors({ ...errors, companyName: '' });
              }
            }}
          />
          {errors.companyName ? (
            <Text className="mt-1 text-sm text-danger-600">{errors.companyName}</Text>
          ) : null}

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

export default DoctorSignUp;
