import 'react-native-get-random-values';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'global.css';
import { useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from 'cache';
import { setTokenFunction } from 'lib/fetch';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

function TokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Configurar a função para obter o token do Clerk
    setTokenFunction(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Erro ao obter token:', error);
        return null;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Jakarta-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'Jakarta-ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'Jakarta-ExtraLight': require('../assets/fonts/PlusJakartaSans-ExtraLight.ttf'),
    'Jakarta-Light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    'Jakarta-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'Jakarta-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'Jakarta-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <TokenProvider>
        <StatusBar style="light" backgroundColor="#4C7C68" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F9FAFB' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(root)" />
          <Stack.Screen name="(doctor)" />
        </Stack>
      </TokenProvider>
    </ClerkProvider>
  );
}
