import { useAuth, useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';
import RideCard from 'components/RideCard';
import { icons, images } from '../../../constants';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GoogleTextInput from 'components/GoogleTextInput';
import Map from 'components/Map';
import { useLocationStore } from 'store';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useFetch } from 'lib/fetch';
import { Ride } from 'types/type';

export default function Page() {
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const { user } = useUser();
  const { data: recentRides, loading } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);
  const [hasPermissions, setHasPermissions] = useState(false);
  const { signOut } = useAuth();
  const handleSignOut = () => {
    signOut();

    router.replace('/(auth)/sign-in');
  };

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);

    router.push('/(root)/find-ride');
  };

  useEffect(() => {
    const requestLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setHasPermissions(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync();

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        // latitude: -20.2834,
        // longitude: -50.2466,
        address: `${address[0].name}, ${address[0].region}`,
      });
    };
    requestLocation();
  }, []);

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="h-40 w-40"
                  alt="Nenhuma corrida encontrada."
                  resizeMode="contain"
                />
                <Text className="text-sm">Nenhuma corrida recente encontrada</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View className="my-5 flex flex-row items-center justify-between">
              <Text className="font-JakartaExtraBold text-2xl capitalize">
                Bem vindo,{' '}
                {user?.firstName || user?.emailAddresses[0].emailAddress.split('@')[0]}{' '}
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Image source={icons.out} className="h-6 w-6" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

            <>
              <Text className="mb-3 mt-5 font-JakartaBold text-xl">Sua Localização atual</Text>
              <View className=" flex h-[300px] flex-row items-center bg-transparent">
                <Map />
              </View>
            </>

            <Text className="mb-3 mt-5 font-JakartaBold text-xl">Corridas Recentes</Text>
          </>
        )}
      />
    </SafeAreaView>
  );
}
