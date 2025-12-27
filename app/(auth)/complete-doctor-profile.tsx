import { useUser } from '@clerk/clerk-expo';
import CustomButton from 'components/CustomButton';
import InputField from 'components/InputField';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import { maskCPF, maskCNPJ } from 'lib/mask';
import React, { useState, useCallback } from 'react';
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

const CompleteDoctorProfile = () => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phone: '',
    dateOfBirth: new Date(1980, 0, 1),
    specialty: '',
    licenseNumber: '',
    cpf: '',
    cnpj: '',
    companyName: '',
    address: '',
    hourlyRate: '150',
    serviceRadius: '10',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!form.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
      isValid = false;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
      isValid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
      isValid = false;
    }

    if (!form.specialty.trim()) {
      newErrors.specialty = 'Especialidade é obrigatória';
      isValid = false;
    }

    if (!form.licenseNumber.trim()) {
      newErrors.licenseNumber = 'CRM é obrigatório';
      isValid = false;
    }

    if (!form.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
      isValid = false;
    }

    if (!form.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
      isValid = false;
    }

    if (!form.companyName.trim()) {
      newErrors.companyName = 'Razão Social é obrigatória';
      isValid = false;
    }

    if (!form.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
      isValid = false;
    }

    const today = new Date();
    const birthDate = new Date(form.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 21) {
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

      await fetchAPI('/doctor/register', {
        method: 'POST',
        body: JSON.stringify({
          clerkId: user.id,
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
          pricePerConsultation: parseFloat(form.hourlyRate || '0'),
          profileImage: profileImage,
        }),
      });

      Alert.alert(
        'Sucesso',
        'Cadastro completado! Sua conta está em análise.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/pending-approval') }]
      );
    } catch (err: any) {
      console.log(err);
      Alert.alert('Erro', 'Erro ao completar cadastro. Tente novamente.');
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
            Completar Cadastro Médico
          </Text>
        </View>

        <View className="p-5">
          <Text className="mb-5 text-base text-gray-500">
            Precisamos de mais algumas informações para concluir seu cadastro médico.
          </Text>

          <View className="mb-5 items-center">
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {profileImage || user?.imageUrl ? (
                  <Image source={{ uri: profileImage || user?.imageUrl }} className="h-full w-full" />
                ) : (
                  <Image source={icons.doctor} className="h-8 w-8" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                <Image source={icons.plus} className="h-4 w-4" tintColor="white" />
              </View>
            </TouchableOpacity>
            <Text className="mt-2 text-center text-sm text-gray-500">Foto de perfil</Text>
          </View>

          <InputField
            label="Nome"
            placeholder="Digite seu nome"
            icon={icons.person}
            value={form.firstName}
            onChangeText={(value) => setForm({ ...form, firstName: value })}
          />
          {errors.firstName && <Text className="mt-1 text-sm text-danger-600">{errors.firstName}</Text>}

          <InputField
            label="Sobrenome"
            placeholder="Digite seu sobrenome"
            icon={icons.person}
            value={form.lastName}
            onChangeText={(value) => setForm({ ...form, lastName: value })}
          />
          {errors.lastName && <Text className="mt-1 text-sm text-danger-600">{errors.lastName}</Text>}

          <InputField
            label="Telefone"
            placeholder="Digite seu telefone"
            icon={icons.phone}
            value={form.phone}
            onChangeText={(value) => setForm({ ...form, phone: value })}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text className="mt-1 text-sm text-danger-600">{errors.phone}</Text>}

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
            {errors.dateOfBirth && <Text className="mt-1 text-sm text-danger-600">{errors.dateOfBirth}</Text>}
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
            label="Especialidade"
            placeholder="Digite sua especialidade"
            icon={icons.specialty}
            value={form.specialty}
            onChangeText={(value) => setForm({ ...form, specialty: value })}
          />
          {errors.specialty && <Text className="mt-1 text-sm text-danger-600">{errors.specialty}</Text>}

          <InputField
            label="CRM"
            placeholder="Digite seu CRM"
            icon={icons.license}
            value={form.licenseNumber}
            onChangeText={(value) => setForm({ ...form, licenseNumber: value })}
          />
          {errors.licenseNumber && <Text className="mt-1 text-sm text-danger-600">{errors.licenseNumber}</Text>}

          <InputField
            label="CPF"
            placeholder="Digite seu CPF"
            icon={icons.document}
            value={form.cpf}
            onChangeText={(value) => setForm({ ...form, cpf: maskCPF(value) })}
            keyboardType="numeric"
            maxLength={14}
          />
          {errors.cpf && <Text className="mt-1 text-sm text-danger-600">{errors.cpf}</Text>}

          <InputField
            label="CNPJ"
            placeholder="Digite seu CNPJ"
            icon={icons.document}
            value={form.cnpj}
            onChangeText={(value) => setForm({ ...form, cnpj: maskCNPJ(value) })}
            keyboardType="numeric"
            maxLength={18}
          />
          {errors.cnpj && <Text className="mt-1 text-sm text-danger-600">{errors.cnpj}</Text>}

          <InputField
            label="Razão Social"
            placeholder="Digite a razão social"
            icon={icons.building}
            value={form.companyName}
            onChangeText={(value) => setForm({ ...form, companyName: value })}
          />
          {errors.companyName && <Text className="mt-1 text-sm text-danger-600">{errors.companyName}</Text>}

          <InputField
            label="Endereço"
            placeholder="Digite seu endereço"
            icon={icons.marker}
            value={form.address}
            onChangeText={(value) => setForm({ ...form, address: value })}
          />
          {errors.address && <Text className="mt-1 text-sm text-danger-600">{errors.address}</Text>}

          <InputField
            label="Valor por Hora (R$)"
            placeholder="Digite seu valor por hora"
            icon={icons.dollar}
            value={form.hourlyRate}
            onChangeText={(value) => setForm({ ...form, hourlyRate: value })}
            keyboardType="numeric"
          />

          <InputField
            label="Raio de Serviço (km)"
            placeholder="Digite o raio de serviço"
            icon={icons.marker}
            value={form.serviceRadius}
            onChangeText={(value) => setForm({ ...form, serviceRadius: value })}
            keyboardType="numeric"
          />

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

export default CompleteDoctorProfile;
