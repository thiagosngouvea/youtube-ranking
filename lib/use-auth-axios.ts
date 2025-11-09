'use client';

import { useAuth } from './auth-context';
import axios, { AxiosRequestConfig } from 'axios';
import { useCallback } from 'react';

/**
 * Hook para fazer requisições autenticadas com axios
 * Automaticamente adiciona o token de autenticação no header
 */
export function useAuthAxios() {
  const { user } = useAuth();

  const authAxios = useCallback(
    async (config: AxiosRequestConfig) => {
      if (user) {
        const token = await user.getIdToken();
        
        return axios({
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      // Se não estiver autenticado, faz a requisição sem token
      return axios(config);
    },
    [user]
  );

  return authAxios;
}

