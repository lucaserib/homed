import CustomButton from 'components/CustomButton';
import GoogleTextInput from 'components/GoogleTextInput';
import RideLayout from 'components/RideLayout';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useLocationStore } from 'store';

import { icons } from '../../constants';

const FindRide = () => {
  const { userAddress, destinationAddress, setDestinationLocation, setUserLocation } =
    useLocationStore();
  return (
    <RideLayout title="Ride" snapPoints={['85%']}>
      <View className="my-3 ">
        <Text className="mb-3 font-JakartaSemiBold text-lg">De </Text>
        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="#f5f5f5"
          handlePress={(location) => setUserLocation(location)}
        />
      </View>
      <View className="my-3 ">
        <Text className="mb-3 font-JakartaSemiBold text-lg">Para </Text>
        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>

      <CustomButton
        title="Buscar Corrida"
        onPress={() =>
          router.push({
            pathname: '/(root)/confirm-ride',
          } as any)
        }
        className="mt-5"
      />
    </RideLayout>
  );
};

export default FindRide;
