import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import api from '../../services/api';

const MOODS = [
  { value: 'peaceful', label: '😌 Tranquilo' },
  { value: 'exciting', label: '🤩 Animado' },
  { value: 'scary', label: '😨 Assustador' },
  { value: 'sad', label: '😢 Triste' },
  { value: 'confusing', label: '😵 Confuso' },
  { value: 'neutral', label: '😐 Neutro' },
];

export default function NewDreamScreen() {
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('neutral');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Atenção', 'Descreva seu sonho antes de continuar.');
      return;
    }
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/api/dreams/', { description, mood, dreamed_at: today });
      setDescription('');
      setMood('neutral');
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o sonho.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>✨ Registrar Sonho</Text>

      <Text style={styles.label}>Como você se sentiu?</Text>
      <View style={styles.moodGrid}>
        {MOODS.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.moodBtn, mood === m.value && styles.moodBtnActive]}
            onPress={() => setMood(m.value)}
          >
            <Text style={[styles.moodText, mood === m.value && styles.moodTextActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Descreva seu sonho</Text>
      <TextInput
        style={styles.textarea}
        placeholder="O que aconteceu? Descreva com detalhes..."
        placeholderTextColor="#666"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>🌙 Registrar e Gerar Imagem</Text>
        }
      </TouchableOpacity>
      <Text style={styles.hint}>A IA irá analisar e gerar uma imagem automaticamente.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', paddingTop: 56, paddingHorizontal: 16 },
  header: { color: '#a855f7', fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  label: { color: '#a1a1aa', fontSize: 13, marginBottom: 8, marginTop: 16 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodBtn: { backgroundColor: '#18181b', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#27272a' },
  moodBtnActive: { borderColor: '#a855f7', backgroundColor: '#3b0764' },
  moodText: { color: '#71717a', fontSize: 13 },
  moodTextActive: { color: '#e9d5ff' },
  textarea: { backgroundColor: '#18181b', color: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#27272a', fontSize: 15, minHeight: 160 },
  button: { backgroundColor: '#9333ea', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  hint: { color: '#52525b', fontSize: 12, textAlign: 'center', marginTop: 12 },
});