import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const DoctorLayout = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Controla a cor da barra de status do celular */}
      <StatusBar style="dark" />

      <Stack screenOptions={{ headerShown: true }}>
        {/* A Tab Bar (Início) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Outras Telas da Stack */}
        <Stack.Screen
          name="availability"
          options={{
            headerTitle: 'Disponibilidade',
            headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
          }}
        />
        <Stack.Screen
          name="consultation-request/[id]"
          options={{
            headerTitle: 'Solicitação de Consulta',
            headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="tracking/[id]"
          options={{
            headerTitle: 'Rastreamento',
            headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
          }}
        />
        <Stack.Screen
          name="active-consultation/[id]"
          options={{
            headerTitle: 'Atendimento Ativo',
            headerTitleStyle: { fontFamily: 'Jakarta-SemiBold' },
          }}
        />
        <Stack.Screen
          name="complete-consultation/[id]"
          options={{
            headerTitle: 'Finalizar Atendimento',
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
    </View>
  );
};

export default DoctorLayout;
