import GoogleTextInput from 'components/GoogleTextInput';
import RideLayout from 'components/RideLayout';
import { icons } from '../../constants';
import { Text, View } from 'react-native';
import { useLocationStore } from 'store';
import CustomButton from 'components/CustomButton';
import { router } from 'expo-router';

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
          handlePress={() => setUserLocation(location)}
        />
      </View>
      <View className="my-3 ">
        <Text className="mb-3 font-JakartaSemiBold text-lg">Para </Text>
        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={() => setDestinationLocation(location)}
        />
      </View>

      <CustomButton
        title="Buscar Corrida"
        onPress={() => router.push('/(root)/confirm-ride')}
        className="mt-5"
      />
    </RideLayout>
  );
};

export default FindRide;
