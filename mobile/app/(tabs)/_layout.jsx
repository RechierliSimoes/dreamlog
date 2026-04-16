import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#09090b', borderTopColor: '#27272a' },
      tabBarActiveTintColor: '#a855f7',
      tabBarInactiveTintColor: '#71717a',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sonhos',
          tabBarIcon: ({ color, size }) => <Ionicons name="moon" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}