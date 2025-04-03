import { Text, ScrollView, View, Image, Alert } from 'react-native';
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

  const [verification, setVerification] = useState({
    state: 'default',
    error: '',
    code: '',
  });

  const onSignUpPress = async () => {
    console.log('Clerk isLoaded:', isLoaded);
    if (!isLoaded) return <Text>Loading...</Text>;

    if (!isLoaded) return;

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.phone ||
      !form.specialty ||
      !form.licenseNumber ||
      !form.hourlyRate ||
      !form.serviceRadius
    ) {
      return Alert.alert('Erro', 'Todos os campos são obrigatórios');
    }

    const crmRegex = /^[0-9]{5,6}(-[A-Z]{2})?$/;
    if (!crmRegex.test(form.licenseNumber)) {
      return Alert.alert('Erro', 'Número de CRM inválido');
    }

    if (parseFloat(form.hourlyRate) < 100) {
      return Alert.alert('Erro', 'Valor por hora inválido');
    }

    if (parseFloat(form.serviceRadius) < 10) {
      return Alert.alert('Erro', 'Raio de serviço inválido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return Alert.alert('Erro', 'Formato de email inválido');
    }

    if (form.password.length < 8) {
      return Alert.alert('Erro', 'A senha deve ter pelo menos 8 caracteres');
    }

    const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(form.phone)) {
      return Alert.alert('Erro', 'Formato de telefone inválido. Use (XX) XXXXX-XXXX');
    }

    if (form.firstName.length < 2 || form.lastName.length < 2) {
      return Alert.alert('Erro', 'Nome e sobrenome devem ter pelo menos 2 caracteres');
    }

    if (form.specialty.length < 3) {
      return Alert.alert('Erro', 'Especialidade deve ter pelo menos 3 caracteres');
    }

    if (isNaN(parseFloat(form.hourlyRate)) || isNaN(parseFloat(form.serviceRadius))) {
      return Alert.alert('Erro', 'Valor por hora e raio de serviço devem ser números válidos');
    }

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
      Alert.alert('Error', err.errors[0].longMessage);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

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
            label="Nome"
            placeholder="Digite seu nome"
            icon={icons.person}
            value={form.firstName}
            onChangeText={(value) => setForm({ ...form, firstName: value })}
          />
          <InputField
            placeholderTextColor="gray"
            label="Sobrenome"
            placeholder="Digite seu sobrenome"
            icon={icons.person}
            value={form.lastName}
            onChangeText={(value) => setForm({ ...form, lastName: value })}
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
          <InputField
            placeholderTextColor="gray"
            label="Telefone"
            placeholder="Digite seu telefone"
            icon={icons.phone}
            value={form.phone}
            onChangeText={(value) => setForm({ ...form, phone: value })}
            keyboardType="phone-pad"
          />
          <InputField
            placeholderTextColor="gray"
            label="Especialidade"
            placeholder="Digite sua especialidade"
            icon={icons.specialty}
            value={form.specialty}
            onChangeText={(value) => setForm({ ...form, specialty: value })}
          />
          <InputField
            placeholderTextColor="gray"
            label="Número de CRM"
            placeholder="Digite seu número do seu CRM"
            icon={icons.license}
            value={form.licenseNumber}
            onChangeText={(value) => setForm({ ...form, licenseNumber: value })}
          />

          <InputField
            placeholderTextColor="gray"
            label="Valor por Hora"
            placeholder="Digite seu valor por hora"
            icon={icons.dollar}
            value={form.hourlyRate}
            onChangeText={(value) => setForm({ ...form, hourlyRate: value })}
            keyboardType="numeric"
          />
          <InputField
            placeholderTextColor="gray"
            label="Raio de Serviço"
            placeholder="Digite o raio de serviço"
            icon={icons.marker}
            value={form.serviceRadius}
            onChangeText={(value) => setForm({ ...form, serviceRadius: value })}
            keyboardType="numeric"
          />

          <CustomButton title="Registrar" onPress={onSignUpPress} className="mt-6" />

          <OAuth />

          <Link href={'/sign-in'} className="mt-10 text-center text-lg text-general-200">
            <Text>Já tem uma conta? </Text>
            <Text className="text-primary-500">Clique para fazer o Login</Text>
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
              onChangeText={(code) => setVerification({ ...verification, code })}
            />

            {verification.error && (
              <Text className="mt-1 text-sm text-red-500">{verification.error}</Text>
            )}

            <CustomButton
              title="Verificar Email"
              onPress={onVerifyPress}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>

        <ReactNativeModal isVisible={showSuccessModel}>
          <View className="min-h-[300px] rounded-2xl bg-white px-7 py-9">
            <Image source={images.check} className="mx-auto my-5 h-[110px] w-[110px]" />

            <Text className=" font-akartaBold text-center text-3xl">Verificado</Text>

            <Text className="mt-2 text-center font-Jakarta text-base text-gray-400">
              Sua conta foi verificada com sucesso.
            </Text>

            <CustomButton
              title="Ir para Página Principal"
              onPress={() =>
                router.replace({
                  pathname: '/(doctor)/(tabs)/dashboard',
                } as any)
              }
              className="mt-5 "
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default DoctorSignUp;
