import { TokenCache } from '@clerk/clerk-expo/dist/cache';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        // Se não conseguir recuperar o token, remove o item corrompido
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (deleteError) {
          // Ignore delete errors
        }
        return null;
      }
    },
    saveToken: async (key: string, token: string) => {
      try {
        await SecureStore.setItemAsync(key, token);
      } catch (error) {
        throw error;
      }
    },
  };
};

export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;
