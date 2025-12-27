import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DoctorHistory = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="font-JakartaBold text-xl">Histórico de Consultas</Text>
        <Text className="mt-2 text-gray-500">Em breve...</Text>
      </View>
    </SafeAreaView>
  );
};

export default DoctorHistory;
