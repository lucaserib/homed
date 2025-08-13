import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

const LayoutRoot = () => {
  return (
    <SafeAreaView className="mt-10 h-full">
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="find-ride" options={{ headerShown: false }} />
        <Stack.Screen name="confirm-ride" options={{ headerShown: false }} />
        <Stack.Screen name="book-ride" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
};
export default LayoutRoot;
