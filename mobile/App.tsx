import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { FestivalEvent } from './src/types';
 
const localEvents: FestivalEvent[] = [
  { id: 'EVT-101', artist: 'Neon Waves', space: 'Main Stage', time: '22:30', status: 'CONFIRMED' },
  { id: 'EVT-102', artist: 'Midnight Session', space: 'Club Stage', time: '23:45', status: 'CONFIRMED' }
];
 
export default function App() {
  const [selected, setSelected] = useState<string | null>(null);
  const events = localEvents;
  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>FESTIVAL CONTROL</Text>
        <Text style={styles.title}>Programación</Text>
        <Text style={styles.text}>Datos locales · todavía sin llamadas HTTP</Text>
        {events.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.tag}>{item.id} · {item.status}</Text>
            <Text style={styles.artist}>{item.artist}</Text>
            <Text style={styles.text}>{item.space} · {item.time}</Text>
          </View>
        ))}
        <Pressable accessibilityRole="button" style={styles.button} onPress={() => setSelected('EVT-102')}>
          <Text style={styles.buttonText}>Seleccionar EVT-102</Text>
        </Pressable>
        <Text accessibilityLiveRegion="polite" style={styles.text}>Selección: {selected ?? 'ninguna'}</Text>
      </ScrollView>
    </View>
  );
}
 
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#08090d' },
  content: { padding: 24, paddingTop: 48, gap: 16, width: '100%', maxWidth: 760, alignSelf: 'center' },
  eyebrow: { color: '#ff4b9b', fontWeight: '700', letterSpacing: 2 },
  title: { color: '#ffffff', fontSize: 34, fontWeight: '800' },
  text: { color: '#d2d3df', fontSize: 16, lineHeight: 24 },
  card: { padding: 20, gap: 8, borderRadius: 16, borderWidth: 1, borderColor: '#353644', backgroundColor: '#151620' },
  artist: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
  tag: { color: '#ff8fc0', fontWeight: '700' },
  button: { padding: 14, backgroundColor: '#cf236e', borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  error: { color: '#ffb4b4', fontSize: 16 },
  result: { color: '#afffcf', fontFamily: 'monospace', fontSize: 14, lineHeight: 20 }
});
 