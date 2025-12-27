import { useClerk } from '@clerk/clerk-expo';
import CustomButton from 'components/CustomButton';
import { router } from 'expo-router';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DoctorProfile = () => {
  const { signOut, user } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-5">
        <View className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden mb-4">
           <Image source={{ uri: user?.imageUrl }} className="h-full w-full" />
        </View>
        <Text className="font-JakartaBold text-2xl">Dr. {user?.firstName} {user?.lastName}</Text>
        <Text className="mb-8 text-gray-500">{user?.emailAddresses[0]?.emailAddress}</Text>
        
        <CustomButton
          title="Sair"
          onPress={handleSignOut}
          className="w-full bg-red-500"
        />
      </View>
    </SafeAreaView>
  );
};

export default DoctorProfile;
