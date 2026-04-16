import { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView,
  StyleSheet, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import api from '../../services/api';

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams();
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDream = async () => {
    try {
      const res = await api.get(`/api/dreams/${id}/`);
      setDream(res.data);
      if (res.data.status === 'processing') {
        setTimeout(fetchDream, 5000); // polling
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDream(); }, [id]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color="#a855f7" size="large" />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      {dream.generated_images?.length > 0
        ? <Image source={{ uri: dream.generated_images[0] }} style={styles.image} />
        : dream.status === 'processing'
          ? <View style={styles.imagePlaceholder}>
              <ActivityIndicator color="#a855f7" size="large" />
              <Text style={styles.processingText}>Gerando imagem...</Text>
            </View>
          : <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 48 }}>🌙</Text>
            </View>
      }

      <View style={styles.content}>
        <Text style={styles.title}>{dream.title || 'Sem título'}</Text>
        <Text style={styles.date}>{dream.dreamed_at}</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Relato</Text>
          <Text style={styles.cardText}>{dream.description}</Text>
        </View>

        {dream.ai_summary ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>✨ Interpretação da IA</Text>
            <Text style={styles.cardText}>{dream.ai_summary}</Text>
          </View>
        ) : null}

        <View style={styles.tagsRow}>
          {[
            { label: 'Personagens', items: dream.characters },
            { label: 'Emoções', items: dream.emotions },
            { label: 'Cenários', items: dream.scenarios },
            { label: 'Objetos', items: dream.dream_objects },
          ].map(({ label, items }) => items?.length ? (
            <View key={label} style={styles.tagCard}>
              <Text style={styles.tagLabel}>{label}</Text>
              <View style={styles.tags}>
                {items.map((item) => (
                  <View key={item} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090b' },
  back: { padding: 16, paddingTop: 56 },
  backText: { color: '#71717a', fontSize: 14 },
  image: { width: '100%', height: 260 },
  imagePlaceholder: { width: '100%', height: 260, backgroundColor: '#18181b', justifyContent: 'center', alignItems: 'center' },
  processingText: { color: '#a855f7', marginTop: 12 },
  content: { padding: 16 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 8 },
  date: { color: '#71717a', fontSize: 13, marginTop: 4, marginBottom: 16 },
  card: { backgroundColor: '#18181b', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#27272a' },
  cardLabel: { color: '#a855f7', fontWeight: '600', marginBottom: 8 },
  cardText: { color: '#d4d4d8', lineHeight: 22 },
  tagsRow: { gap: 12 },
  tagCard: { backgroundColor: '#18181b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#27272a' },
  tagLabel: { color: '#a855f7', fontWeight: '600', marginBottom: 8, fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#27272a', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: '#d4d4d8', fontSize: 12 },
});