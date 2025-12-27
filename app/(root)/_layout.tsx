import { Stack } from 'expo-router';

const LayoutRoot = () => {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F9FAFB' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="confirm-consultation" />
      <Stack.Screen name="consultation-details" />
      <Stack.Screen name="medical-record" />
      <Stack.Screen name="request-consultation" />
      <Stack.Screen name="select-doctor" />
      <Stack.Screen name="find-doctor" />
    </Stack>
  );
};
export default LayoutRoot;
