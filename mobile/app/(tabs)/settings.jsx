import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, Alert, ScrollView
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { scheduleMorningReminder, cancelMorningReminder, requestNotificationPermission } from '../../services/notifications';

const HOURS = [6, 7, 8, 9, 10];

export default function SettingsScreen() {
  const [username, setUsername] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [selectedHour, setSelectedHour] = useState(8);

  useEffect(() => {
    SecureStore.getItemAsync('username').then(u => u && setUsername(u));
    SecureStore.getItemAsync('notif_enabled').then(v => setNotifEnabled(v !== 'false'));
    SecureStore.getItemAsync('notif_hour').then(h => h && setSelectedHour(parseInt(h)));
  }, []);

  const handleToggleNotif = async (value) => {
    setNotifEnabled(value);
    await SecureStore.setItemAsync('notif_enabled', String(value));
    if (value) {
      const granted = await requestNotificationPermission();
      if (granted) await scheduleMorningReminder(selectedHour, 0);
    } else {
      await cancelMorningReminder();
    }
  };

  const handleSelectHour = async (hour) => {
    setSelectedHour(hour);
    await SecureStore.setItemAsync('notif_hour', String(hour));
    if (notifEnabled) {
      await scheduleMorningReminder(hour, 0);
      Alert.alert('✅ Salvo', `Lembrete agendado para ${hour}:00 todos os dias.`);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('username');
    await cancelMorningReminder();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>⚙️ Configurações</Text>

      {/* Perfil */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Usuário</Text>
        <Text style={styles.cardValue}>{username}</Text>
      </View>

      {/* Notificações */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.cardLabel}>Lembrete matinal</Text>
            <Text style={styles.cardSub}>Receber notificação para registrar o sonho</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={handleToggleNotif}
            trackColor={{ false: '#27272a', true: '#7e22ce' }}
            thumbColor={notifEnabled ? '#a855f7' : '#71717a'}
          />
        </View>

        {notifEnabled && (
          <>
            <Text style={[styles.cardSub, { marginTop: 16, marginBottom: 8 }]}>Horário do lembrete:</Text>
            <View style={styles.hoursRow}>
              {HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.hourBtn, selectedHour === h && styles.hourBtnActive]}
                  onPress={() => handleSelectHour(h)}
                >
                  <Text style={[styles.hourText, selectedHour === h && styles.hourTextActive]}>
                    {h}:00
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', paddingTop: 56, paddingHorizontal: 16 },
  header: { color: '#a855f7', fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  card: { backgroundColor: '#18181b', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#27272a' },
  cardLabel: { color: '#fff', fontWeight: '600', fontSize: 15 },
  cardValue: { color: '#a1a1aa', marginTop: 4 },
  cardSub: { color: '#71717a', fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hoursRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  hourBtn: { backgroundColor: '#27272a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#3f3f46' },
  hourBtnActive: { borderColor: '#a855f7', backgroundColor: '#3b0764' },
  hourText: { color: '#71717a', fontWeight: '600' },
  hourTextActive: { color: '#e9d5ff' },
  logoutBtn: { backgroundColor: '#18181b', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444', marginTop: 8 },
  logoutText: { color: '#ef4444', fontWeight: '600' },
});