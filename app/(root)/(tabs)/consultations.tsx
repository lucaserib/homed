import { View, Text, SafeAreaView, FlatList, Image, ActivityIndicator } from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Ride } from 'types/type';
import { useFetch } from 'lib/fetch';
import RideCard from 'components/RideCard';
import { images } from '../../../constants';

const History = () => {
  const { user } = useUser();
  const { data: recentRides, loading } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);
  return (
    <SafeAreaView>
      <FlatList
        data={recentRides}
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
            <Text className="my-5 font-JakartaBold text-2xl">All Rides</Text>
          </>
        )}
      />
    </SafeAreaView>
  );
};

export default History;
