import 'expo-router';

// Estender os tipos de router para incluir as rotas específicas da aplicação
declare module 'expo-router' {
  type AppRoutes = {
    // Rotas de autenticação
    '/': undefined;
    '/(auth)/sign-in': undefined;
    '/(auth)/sign-up': undefined;
    '/(auth)/welcome': undefined;

    // Rotas principais do paciente
    '/(root)/(tabs)/home': undefined;
    '/(root)/(tabs)/consultations': undefined;
    '/(root)/(tabs)/chat': { consultationId?: string };
    '/(root)/(tabs)/profile': undefined;
    '/(root)/consultation/[id]': { id: string };
    '/(root)/doctor-profile/[id]': { id: string };
    '/(root)/payment/[id]': { id: string };
    '/(root)/medical-record/[id]': { id: string };

    // Rotas para médicos
    '/(doctor)/(tabs)/dashboard': undefined;
    '/(doctor)/(tabs)/consultations': undefined;
    '/(doctor)/(tabs)/chat': { consultationId?: string };
    '/(doctor)/(tabs)/profile': undefined;
    '/(doctor)/consultation/[id]': { id: string };
    '/(doctor)/active-consultation': { id: string };
    '/(doctor)/medical-record/[id]': { id: string };
    '/(doctor)/availability': undefined;

    // Rotas de API
    '/(api)/doctor/[id]': { id: string };
    '/(api)/doctor/stats/[id]': { id: string };
    '/(api)/doctor/[id]/toggle-availability': { id: string };
    '/(api)/consultation/[id]': { id: string };
    '/(api)/consultation/[id]/accept': { id: string };
    '/(api)/consultation/[id]/decline': { id: string };
    '/(api)/consultation/[id]/start': { id: string };
    '/(api)/consultation/[id]/finish': { id: string };
  };

  export type RelativePathString = keyof AppRoutes;
}
