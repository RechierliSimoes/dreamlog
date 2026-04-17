import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import api from '../../services/api';
import { requestNotificationPermission, scheduleMorningReminder } from '../../services/notifications';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login/', { username, password });
      
      // 1. Salva os dados de autenticação primeiro
      await SecureStore.setItemAsync('auth_token', res.data.token);
      await SecureStore.setItemAsync('username', res.data.username);

      // 2. Tenta configurar as notificações (insira aqui)
      try {
        const granted = await requestNotificationPermission();
        if (granted) {
          await scheduleMorningReminder(8, 0); // Agenda para 8h da manhã
        }
      } catch (notifError) {
        // Se a notificação falhar, o login ainda deve continuar
        console.log('Erro ao configurar notificações:', notifError);
      }

      // 3. Só então redireciona para dentro do app
      router.replace('/(tabs)');
      
    } catch (e) {
      console.error(e); // Ajuda você a ver o erro real no console
      Alert.alert('Erro', 'Usuário ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌙</Text>
      <Text style={styles.title}>DreamLog</Text>
      <Text style={styles.subtitle}>Registre e visualize seus sonhos</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        placeholderTextColor="#666"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Entrar</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { color: '#a855f7', fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#71717a', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#18181b', color: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#27272a' },
  button: { backgroundColor: '#9333ea', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});