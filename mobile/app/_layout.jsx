import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (!token) {
          // Pequeno delay para garantir que o Router montou
          setTimeout(() => router.replace('/(auth)/login'), 1);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setChecked(true);
      }
    }
    checkAuth();
  }, []);

  // Enquanto checa o token, mantemos a tela branca ou um loading
  if (!checked) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="dream/[id]" />
    </Stack>
  );
}