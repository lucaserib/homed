import { useUser } from '@clerk/clerk-expo';
import CustomButton from 'components/CustomButton';
import InputField from 'components/InputField';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import { maskCPF } from 'lib/mask';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Text,
  ScrollView,
  View,
  Image,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { icons, images } from '../../constants';

const CompleteProfile = () => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phone: '',
    dateOfBirth: new Date(2000, 0, 1),
    gender: 'male',
    cpf: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, name: value }));
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
  }, [errors.name]);

  const handlePhoneChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, phone: value }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  }, [errors.phone]);

  const handleAddressChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, address: value }));
    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
  }, [errors.address]);
  
  const handleCpfChange = useCallback((value: string) => {
    const maskedValue = maskCPF(value);
    setForm(prev => ({ ...prev, cpf: maskedValue }));
    if (errors.cpf) setErrors(prev => ({ ...prev, cpf: '' }));
  }, [errors.cpf]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
      isValid = false;
    }

    if (!form.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
      isValid = false;
    } else if (form.cpf.replace(/[^\d]/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
      isValid = false;
    }

    if (!form.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
      isValid = false;
    }

    const today = new Date();
    const birthDate = new Date(form.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
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

  const onSubmit = async () => {
    if (!user) return;
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = form.dateOfBirth.toISOString();

      await fetchAPI('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          clerkId: user.id,
          dateOfBirth: formattedDate,
          gender: form.gender,
          cpf: form.cpf.replace(/[^\d]/g, ''),
          address: form.address,
          profileImageUrl: profileImage,
        }),
      });

      router.replace('/(root)/(tabs)/home');
    } catch (err: any) {
      console.log(err);
      Alert.alert('Erro', 'Erro ao completar cadastro. Tente novamente.');
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
            Completar Cadastro
          </Text>
        </View>

        <View className="p-5">
          <Text className="mb-5 text-base text-gray-500">
            Parece que seu cadastro não foi concluído. Por favor, preencha os dados abaixo para continuar.
          </Text>

          <View className="mb-5 items-center">
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {profileImage || user?.imageUrl ? (
                  <Image source={{ uri: profileImage || user?.imageUrl }} className="h-full w-full" />
                ) : (
                  <Image source={icons.person} className="h-8 w-8" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                <Image source={icons.plus} className="h-4 w-4" tintColor="white" />
              </View>
            </TouchableOpacity>
            <Text className="mt-2 text-center text-sm text-gray-500">Foto de perfil</Text>
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
            title={isSubmitting ? 'Salvando...' : 'Concluir Cadastro'}
            onPress={onSubmit}
            className="mt-6"
            disabled={isSubmitting}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default CompleteProfile;
