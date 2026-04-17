import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
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
  const [recording, setRecording] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const recordingRef = useRef(null);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permissão negada', 'Precisamos de acesso ao microfone.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setRecording(recording);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    setTranscribing(true);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setRecording(null);
      recordingRef.current = null;

      // Envia o áudio para o backend transcrever
      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'dream.m4a',
        type: 'audio/m4a',
      });

      const res = await api.post('/api/dreams/transcribe/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDescription(prev =>
        prev ? prev + ' ' + res.data.transcription : res.data.transcription
      );
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível transcrever o áudio.');
    } finally {
      setTranscribing(false);
    }
  };

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

      {/* Botão de gravação */}
      <TouchableOpacity
        style={[styles.voiceBtn, recording && styles.voiceBtnRecording]}
        onPress={recording ? stopRecording : startRecording}
        disabled={transcribing}
      >
        {transcribing
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.voiceBtnText}>
              {recording ? '⏹ Parar gravação' : '🎙 Gravar por voz'}
            </Text>
        }
      </TouchableOpacity>
      {recording && <Text style={styles.recordingHint}>Gravando... toque para parar e transcrever.</Text>}
      {transcribing && <Text style={styles.recordingHint}>Transcrevendo áudio...</Text>}

      <TextInput
        style={styles.textarea}
        placeholder="Ou escreva aqui... (a transcrição aparece automaticamente)"
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
  voiceBtn: { backgroundColor: '#18181b', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#27272a', marginBottom: 8 },
  voiceBtnRecording: { borderColor: '#ef4444', backgroundColor: '#450a0a' },
  voiceBtnText: { color: '#a855f7', fontWeight: '600', fontSize: 15 },
  recordingHint: { color: '#71717a', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  textarea: { backgroundColor: '#18181b', color: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#27272a', fontSize: 15, minHeight: 160 },
  button: { backgroundColor: '#9333ea', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  hint: { color: '#52525b', fontSize: 12, textAlign: 'center', marginTop: 12 },
});