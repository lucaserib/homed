// app/(doctor)/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

const DoctorLayout = () => {
  return (
    <SafeAreaView className="mt-10 h-full">
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="availability"
        options={{
          headerTitle: 'Disponibilidade',
          headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
        }}
      />
      <Stack.Screen
        name="active-consultation"
        options={{
          headerTitle: 'Consulta Ativa',
          headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
        }}
      />
      <Stack.Screen
        name="consultation/[id]"
        options={{
          headerTitle: 'Detalhes da Consulta',
          headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
        }}
      />
      <Stack.Screen
        name="medical-record/[id]"
        options={{
          headerTitle: 'Prontuário Médico',
          headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
        }}
      />
      </Stack>
    </SafeAreaView>
  );
};

export default DoctorLayout;
