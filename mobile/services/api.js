import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Em desenvolvimento, use o IP da sua máquina na rede local
// (não use localhost — o celular não enxerga localhost do PC)
const BASE_URL = 'http://192.168.0.110:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

// Injeta o token em toda requisição autenticada
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;