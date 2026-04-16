import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import api from '../../services/api';

export default function DashboardScreen() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDreams = async () => {
    try {
      const res = await api.get('/api/dreams/');
      setDreams(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDreams(); }, []));

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color="#a855f7" size="large" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌙 Meus Sonhos</Text>
      <FlatList
        data={dreams}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDreams(); }} tintColor="#a855f7" />}
        contentContainerStyle={dreams.length === 0 && styles.empty}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 48 }}>🌙</Text>
            <Text style={{ color: '#71717a', marginTop: 8 }}>Nenhum sonho registrado ainda.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/dream/${item.id}`)}>
            {item.generated_images?.length > 0
              ? <Image source={{ uri: item.generated_images[0] }} style={styles.image} />
              : <View style={[styles.image, styles.placeholder]}><Text style={{ fontSize: 32 }}>🌙</Text></View>
            }
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title || 'Sem título'}</Text>
              <Text style={styles.cardDate}>{item.dreamed_at}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              {item.status === 'processing' && (
                <Text style={styles.processing}>⏳ Processando...</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', paddingTop: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { color: '#a855f7', fontSize: 24, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 16 },
  card: { backgroundColor: '#18181b', borderRadius: 16, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#27272a' },
  image: { width: '100%', height: 160 },
  placeholder: { backgroundColor: '#27272a', justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 12 },
  cardTitle: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cardDate: { color: '#71717a', fontSize: 12, marginTop: 2 },
  cardDesc: { color: '#a1a1aa', fontSize: 13, marginTop: 4 },
  processing: { color: '#a855f7', fontSize: 12, marginTop: 6 },
});