import { useUser } from '@clerk/clerk-expo';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useFetch, fetchAPI } from 'lib/fetch';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';

type DayAvailability = {
  available: boolean;
  startTime: string;
  endTime: string;
};

type WeekAvailability = {
  [key: string]: DayAvailability;
};

const Availability = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [savingData, setSavingData] = useState(false);
  const [radius, setRadius] = useState(10);
  const [hourlyRate, setHourlyRate] = useState('150');
  const [isAvailable, setIsAvailable] = useState(false);
  const [receiveNotifications, setReceiveNotifications] = useState(true);

  // Horários de disponibilidade
  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const [availability, setAvailability] = useState<WeekAvailability>({
    Segunda: { available: true, startTime: '08:00', endTime: '18:00' },
    Terça: { available: true, startTime: '08:00', endTime: '18:00' },
    Quarta: { available: true, startTime: '08:00', endTime: '18:00' },
    Quinta: { available: true, startTime: '08:00', endTime: '18:00' },
    Sexta: { available: true, startTime: '08:00', endTime: '18:00' },
    Sábado: { available: false, startTime: '08:00', endTime: '12:00' },
    Domingo: { available: false, startTime: '08:00', endTime: '12:00' },
  });

  useEffect(() => {
    if (user?.id) {
      fetchAPI(`/doctor/${user.id}`)
        .then((response) => {
          if (response.data) {
            const doctorData = response.data;
            setRadius(doctorData.radius || 10);
            setHourlyRate(doctorData.hourlyRate?.toString() || '150');
            setIsAvailable(doctorData.isAvailable || false);
            setReceiveNotifications(doctorData.receiveNotifications !== false);

            if (doctorData.availability) {
              setAvailability(doctorData.availability);
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching doctor data:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados de disponibilidade');
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const toggleDayAvailability = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
      },
    }));
  };

  const updateDayTime = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const saveAvailability = async () => {
    if (!user?.id) return;

    if (isNaN(parseFloat(hourlyRate)) || parseFloat(hourlyRate) <= 0) {
      Alert.alert('Erro', 'Por favor, informe um valor por hora válido');
      return;
    }

    setSavingData(true);

    try {
      await fetchAPI(`/doctor/update-settings`, {
        method: 'POST',
        body: JSON.stringify({
          doctorId: user.id,
          radius,
          hourlyRate: parseFloat(hourlyRate),
          isAvailable,
          receiveNotifications,
          availability,
        }),
      });

      Alert.alert('Sucesso', 'Configurações de disponibilidade salvas com sucesso');
      router.back();
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados de disponibilidade');
    } finally {
      setSavingData(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4C7C68" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-5">
        <Text className="mb-5 font-JakartaBold text-2xl text-gray-900">Configurações de Disponibilidade</Text>

        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaSemiBold text-lg">Status Geral</Text>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-JakartaMedium">Disponível para consultas</Text>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#ADE5B9' }}
              thumbColor={isAvailable ? '#38A169' : '#999999'}
              onValueChange={() => setIsAvailable(!isAvailable)}
              value={isAvailable}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="font-JakartaMedium">Receber notificações</Text>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#ADE5B9' }}
              thumbColor={receiveNotifications ? '#38A169' : '#999999'}
              onValueChange={() => setReceiveNotifications(!receiveNotifications)}
              value={receiveNotifications}
            />
          </View>
        </View>

        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaSemiBold text-lg">Raio de Atendimento</Text>
          <Text className="mb-2 font-Jakarta text-gray-500">
            Define a distância máxima que você está disposto a se deslocar para atender pacientes.
          </Text>

          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-JakartaMedium">Raio: {radius} km</Text>
          </View>

          <Slider
            minimumValue={1}
            maximumValue={50}
            step={1}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor="#0286FF"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#0286FF"
          />

          <View className="mt-1 flex-row justify-between">
            <Text className="text-xs text-gray-500">1 km</Text>
            <Text className="text-xs text-gray-500">50 km</Text>
          </View>
        </View>

        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaSemiBold text-lg">Valor por Hora</Text>

          <View className="flex-row items-center">
            <Text className="mr-2 font-JakartaMedium">R$</Text>
            <TextInput
              className="flex-1 rounded-lg bg-gray-100 p-3 font-Jakarta"
              keyboardType="numeric"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="Valor por hora"
            />
          </View>
        </View>

        <View className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 font-JakartaSemiBold text-lg">Dias e Horários</Text>

          {daysOfWeek.map((day) => (
            <View key={day} className="mb-4 border-b border-gray-100 pb-3">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-JakartaMedium">{day}</Text>
                <Switch
                  trackColor={{ false: '#E0E0E0', true: '#ADE5B9' }}
                  thumbColor={availability[day].available ? '#38A169' : '#999999'}
                  onValueChange={() => toggleDayAvailability(day)}
                  value={availability[day].available}
                />
              </View>

              {availability[day].available && (
                <View className="flex-row items-center">
                  <View className="mr-3 flex-1">
                    <Text className="mb-1 font-Jakarta text-sm text-gray-500">Início</Text>
                    <TextInput
                      className="rounded-lg bg-gray-100 p-2 text-center font-Jakarta"
                      value={availability[day].startTime}
                      onChangeText={(value) => updateDayTime(day, 'startTime', value)}
                      placeholder="08:00"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="mb-1 font-Jakarta text-sm text-gray-500">Fim</Text>
                    <TextInput
                      className="rounded-lg bg-gray-100 p-2 text-center font-Jakarta"
                      value={availability[day].endTime}
                      onChangeText={(value) => updateDayTime(day, 'endTime', value)}
                      placeholder="18:00"
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={saveAvailability}
          disabled={savingData}
          className="mb-10 rounded-full bg-primary-500 p-4">
          {savingData ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-center font-JakartaBold text-white">Salvar Configurações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Availability;
