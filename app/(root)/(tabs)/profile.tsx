import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { icons } from '../../../constants';
import { useUserStore } from '../../../store';

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { userName, clearUserData } = useUserStore();

  const handleSignOut = async () => {
    clearUserData();
    await signOut();
    router.replace('/(auth)/welcome');
  };

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';

  const menuItems = [
    {
      icon: icons.person,
      title: 'Informações Pessoais',
      subtitle: 'Nome, telefone e endereço',
      onPress: () => {},
      badge: null,
    },
    {
      icon: icons.calendar,
      title: 'Histórico Médico',
      subtitle: 'Consultas e tratamentos anteriores',
      onPress: () => {},
      badge: null,
    },
    {
      icon: icons.document,
      title: 'Receitas e Exames',
      subtitle: 'Documentos médicos salvos',
      onPress: () => {},
      badge: '3',
    },
    {
      icon: icons.building,
      title: 'Endereços Salvos',
      subtitle: 'Locais para atendimento',
      onPress: () => {},
      badge: null,
    },
    {
      icon: icons.phone,
      title: 'Contatos de Emergência',
      subtitle: 'Pessoas para avisar em emergências',
      onPress: () => {},
      badge: null,
    },
    {
      icon: icons.lock,
      title: 'Privacidade e Segurança',
      subtitle: 'Senha e configurações de conta',
      onPress: () => {},
      badge: null,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 bg-gray-50">
        {/* Header fixo */}
        <View className="bg-white border-b border-gray-200 px-5 pb-4 pt-2">
          <Text className="font-JakartaBold text-2xl text-gray-900">Perfil</Text>
          <Text className="font-JakartaMedium text-sm text-gray-500 mt-1">
            Gerencie sua conta
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 90 }}>
        {/* User Info Card */}
        <View className="mx-5 mt-5">
          <View
            className="rounded-3xl border border-primary-100 bg-white p-6"
            style={{
              shadowColor: '#4C7C68',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
            }}>
            <View className="flex-row items-center">
              <View
                className="h-20 w-20 items-center justify-center rounded-2xl bg-primary-500"
                style={{
                  shadowColor: '#4C7C68',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                <Text className="font-JakartaBold text-3xl text-white">
                  {(userName || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>

              <View className="ml-4 flex-1">
                <Text className="font-JakartaBold text-xl text-gray-900">
                  {userName || 'Usuário'}
                </Text>
                <Text className="font-JakartaMedium text-sm text-gray-500 mt-1">
                  {userEmail}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="mx-5 mt-5 flex-row">
          <View
            className="mr-2 flex-1 rounded-2xl border border-primary-100 bg-white p-4"
            style={{
              shadowColor: '#4C7C68',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <Image source={icons.calendar} className="h-5 w-5" tintColor="#4C7C68" />
            </View>
            <Text className="font-JakartaBold text-2xl text-gray-900">12</Text>
            <Text className="font-JakartaMedium text-xs text-gray-500 mt-1">
              Consultas realizadas
            </Text>
          </View>

          <View
            className="ml-2 flex-1 rounded-2xl border border-primary-100 bg-white p-4"
            style={{
              shadowColor: '#4C7C68',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <Image source={icons.star} className="h-5 w-5" tintColor="#4C7C68" />
            </View>
            <Text className="font-JakartaBold text-2xl text-gray-900">4.9</Text>
            <Text className="font-JakartaMedium text-xs text-gray-500 mt-1">
              Avaliação média
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mx-5 mt-5">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              activeOpacity={0.7}
              className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}>
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                <Image source={item.icon} className="h-5 w-5" tintColor="#4C7C68" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-JakartaBold text-base text-gray-900">
                  {item.title}
                </Text>
                <Text className="font-JakartaMedium text-xs text-gray-500 mt-0.5">
                  {item.subtitle}
                </Text>
              </View>
              {item.badge && (
                <View className="mr-2 h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                  <Text className="font-JakartaBold text-xs text-white">
                    {item.badge}
                  </Text>
                </View>
              )}
              <Image
                source={icons.arrowDown}
                className="h-4 w-4 -rotate-90"
                tintColor="#9CA3AF"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Help & Support Section */}
        <View className="mx-5 mt-5">
          <Text className="mb-3 font-JakartaBold text-base text-gray-900">
            Ajuda e Suporte
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Image source={icons.chat} className="h-5 w-5" tintColor="#3B82F6" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-JakartaBold text-base text-gray-900">
                Fale Conosco
              </Text>
              <Text className="font-JakartaMedium text-xs text-gray-500 mt-0.5">
                Atendimento 24/7
              </Text>
            </View>
            <View className="h-2 w-2 rounded-full bg-success-500" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <Text className="text-xl">❓</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-JakartaBold text-base text-gray-900">
                Central de Ajuda
              </Text>
              <Text className="font-JakartaMedium text-xs text-gray-500 mt-0.5">
                Perguntas frequentes
              </Text>
            </View>
            <Image
              source={icons.arrowDown}
              className="h-4 w-4 -rotate-90"
              tintColor="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View className="mx-5 mt-5 mb-3">
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.7}
            className="flex-row items-center justify-center rounded-2xl border border-danger-200 bg-danger-50 p-4"
            style={{
              shadowColor: '#F56565',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Image source={icons.out} className="h-5 w-5 mr-2" tintColor="#C53030" />
            <Text className="font-JakartaBold text-base text-danger-700">
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
