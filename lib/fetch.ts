import { useState, useEffect, useCallback } from 'react';

// Usar a URL do .env (http://192.168.15.6:3000/api)
const BACKEND_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000/api';

console.log('🌐 Backend URL configurado:', BACKEND_URL);

// Função auxiliar para obter token (para uso fora de componentes React)
let getTokenFunction: (() => Promise<string | null>) | null = null;

export const setTokenFunction = (fn: () => Promise<string | null>) => {
  getTokenFunction = fn;
};

export const fetchAPI = async (url: string, options?: RequestInit) => {
  let token: string | null = null;
  if (getTokenFunction) {
    try {
      token = await getTokenFunction();
      if (token) {
        console.log('🔑 Token obtido para requisição');
      } else {
        console.log('⚠️ Requisição sem token de autenticação');
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível obter o token:', error);
    }
  }

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...options,
  };

  if (url.startsWith('http')) {
    return await attemptFetch(url, defaultOptions);
  }

  const fullUrl = `${BACKEND_URL}${url}`;
  return await attemptFetch(fullUrl, defaultOptions);
};

async function attemptFetch(fullUrl: string, options: RequestInit) {
  console.log(`📡 Fetching: ${fullUrl}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`✅ Response ${response.status} from ${fullUrl}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ HTTP ${response.status}:`, errorText.substring(0, 200));

      const error: any = new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.warn(`⚠️ Non-JSON response:`, text.substring(0, 200));
      return { data: text };
    }

    const jsonData = await response.json();
    console.log(`📦 Response data:`, JSON.stringify(jsonData).substring(0, 200));

    return jsonData;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error(`⏱️ Timeout: Backend não respondeu em 15s`);
      throw new Error(`Timeout: Backend não respondeu em 15s (${fullUrl})`);
    }

    console.error(`❌ Erro de conexão:`, error.message);
    throw error;
  }
}

export const useFetch = <T>(url: string | null, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(url, options);
      setData(result.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
