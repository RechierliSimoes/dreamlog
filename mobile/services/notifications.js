import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

// Como as notificações aparecem quando o app está em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMorningReminder(hour = 8, minute = 0) {
  // Cancela qualquer notificação anterior para não duplicar
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 Bom dia! O que você sonhou?',
      body: 'Registre seu sonho agora antes que a memória desapareça.',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true, // repete todo dia
    },
  });

  console.log(`[NOTIF] Lembrete agendado para ${hour}:${String(minute).padStart(2, '0')} todos os dias.`);
}

export async function cancelMorningReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[NOTIF] Lembretes cancelados.');
}