import { useUser, useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useFetch, fetchAPI } from 'lib/fetch';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { icons } from '../../../constants';
import { Doctor } from '../../../types/consultation';

// Componente para os campos editáveis do perfil
interface EditableFieldProps {
  label: string;
  value: string;
  setValue: (text: string) => void;
  isEditing: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  setValue,
  isEditing,
  keyboardType = 'default',
}) => (
  <View className="mb-4">
    <Text className="mb-1 font-JakartaSemiBold">{label}</Text>
    {isEditing ? (
      <TextInput
        className="rounded-lg bg-gray-100 p-3 font-Jakarta"
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        placeholder={`Digite ${label.toLowerCase()}`}
      />
    ) : (
      <Text className="rounded-lg bg-gray-50 p-3 font-Jakarta">
        {value || `Nenhum ${label.toLowerCase()} registrado`}
      </Text>
    )}
  </View>
);

// Componente para representar um documento ou certificado
interface DocumentCardProps {
  title: string;
  date: string;
  onPress?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ title, date, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="mb-3 flex-row items-center rounded-lg bg-gray-100 p-3">
    {/* Usando o ícone apropriado ou um fallback */}
    <Image source={icons.document} className="mr-2 h-6 w-6" />
    <View className="flex-1">
      <Text className="font-JakartaSemiBold">{title}</Text>
      <Text className="text-xs text-gray-500">{date}</Text>
    </View>
    <Text className="font-JakartaMedium text-primary-500">Ver</Text>
  </TouchableOpacity>
);

// Componente principal de perfil do médico
const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Dados do perfil
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [crm, setCrm] = useState('');
  const [phone, setPhone] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Buscar dados do médico
  const { data: doctorDataResponse, refetch } = useFetch<{ data: Doctor }>(
    `/(api)/doctor/${user?.id}`
  );
  const doctorData = doctorDataResponse?.data;

  useEffect(() => {
    if (user) {
      setName(user.fullName || '');
      setPhone(user.primaryPhoneNumber?.phoneNumber || '');

      if (doctorData) {
        setSpecialty(doctorData.specialty || '');
        setBio(doctorData.bio || '');
        setCrm(doctorData.licenseNumber || '');
        setHourlyRate(doctorData.hourlyRate?.toString() || '150');
        setProfileImage(doctorData.profileImage || null);
        setLoading(false);
      }
    }
  }, [user, doctorData]);

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/sign-in');
  };

  const pickImage = async () => {
    if (!isEditing) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;

    setSaving(true);

    try {
      // Aqui seria necessário fazer upload da imagem para um serviço de armazenamento
      // e obter a URL pública, mas vamos simular isso
      const imageUrl = profileImage;

      await fetchAPI(`/(api)/doctor/update-profile`, {
        method: 'POST',
        body: JSON.stringify({
          doctorId: user.id,
          name,
          specialty,
          bio,
          crm,
          phone,
          hourlyRate: parseFloat(hourlyRate),
          profileImage: imageUrl,
        }),
      });

      // Atualizar dados do usuário no Clerk
      if (user.fullName !== name) {
        await user.update({
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
        });
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-general-500">
        <ActivityIndicator size="large" color="#0286FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <ScrollView className="p-5">
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="font-JakartaBold text-2xl">Meu Perfil</Text>

          {!isEditing ? (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="rounded-full bg-primary-500 px-4 py-2">
              <Text className="font-JakartaBold text-white">Editar</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                className="mr-2 rounded-full bg-gray-300 px-4 py-2">
                <Text className="font-JakartaBold text-gray-700">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveProfile}
                disabled={saving}
                className="rounded-full bg-success-500 px-4 py-2">
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="font-JakartaBold text-white">Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Foto de Perfil */}
        <TouchableOpacity
          onPress={pickImage}
          className="mb-5 items-center justify-center"
          disabled={!isEditing}>
          <View className="relative h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-gray-200">
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="h-full w-full" />
            ) : (
              <Text className="font-JakartaExtraBold text-4xl text-gray-400">
                {name.charAt(0).toUpperCase()}
              </Text>
            )}

            {isEditing && (
              <View className="absolute bottom-0 h-10 w-full items-center justify-center bg-black bg-opacity-50">
                <Text className="font-JakartaMedium text-white">Alterar foto</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Dados Pessoais */}
        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaBold text-xl">Dados Pessoais</Text>

          <EditableField
            label="Nome Completo"
            value={name}
            setValue={setName}
            isEditing={isEditing}
          />

          <EditableField label="CRM" value={crm} setValue={setCrm} isEditing={isEditing} />

          <EditableField
            label="Telefone"
            value={phone}
            setValue={setPhone}
            isEditing={isEditing}
            keyboardType="phone-pad"
          />

          <EditableField
            label="Especialidade"
            value={specialty}
            setValue={setSpecialty}
            isEditing={isEditing}
          />

          <EditableField
            label="Valor por Hora (R$)"
            value={hourlyRate}
            setValue={setHourlyRate}
            isEditing={isEditing}
            keyboardType="numeric"
          />
        </View>

        {/* Biografia */}
        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaBold text-xl">Biografia</Text>

          {isEditing ? (
            <TextInput
              className="rounded-lg bg-gray-100 p-3 font-Jakarta"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={5}
              placeholder="Descreva sua formação, experiência e áreas de atuação"
            />
          ) : (
            <Text className="rounded-lg bg-gray-50 p-3 font-Jakarta">
              {bio || 'Nenhuma biografia registrada'}
            </Text>
          )}
        </View>

        {/* Certificados e Documentos */}
        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaBold text-xl">Certificados e Documentos</Text>

          <DocumentCard title="Diploma de Medicina" date="Enviado em 12/03/2023" />

          <DocumentCard title="Certificado de Especialização" date="Enviado em 12/03/2023" />

          {isEditing && (
            <TouchableOpacity className="flex-row items-center justify-center rounded-lg border border-dashed border-gray-300 p-3">
              <Image source={icons.plus} className="mr-2 h-5 w-5" />
              <Text className="font-JakartaMedium text-gray-700">Adicionar documento</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Opções da Conta */}
        <View className="mb-10 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaBold text-xl">Conta</Text>

          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center rounded-lg p-3">
            <Image source={icons.out} className="mr-3 h-6 w-6" />
            <Text className="font-JakartaMedium text-red-500">Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
