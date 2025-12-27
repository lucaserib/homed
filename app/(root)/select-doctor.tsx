import CustomButton from 'components/CustomButton';
import DriverCard from 'components/DriverCard';
import RideLayout from 'components/RideLayout';
import { router } from 'expo-router';
import React from 'react';
import { View, FlatList } from 'react-native';
import { useDriverStore } from 'store';

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  return (
    <RideLayout title="Choose a Driver" snapPoints={['65%', '85%']}>
      <FlatList
        data={drivers}
        renderItem={({ item }) => (
          <DriverCard
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(Number(item.id!))}
            item={item}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Escolha a corrida"
              onPress={() =>
                router.push({
                  pathname: '/(root)/confirm-consultation',
                } as any)
              }
            />
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;
