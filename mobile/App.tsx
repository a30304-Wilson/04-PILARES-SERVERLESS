import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { FestivalEvent } from './src/types';
import { getEvents, createEvent, replaceEvent, updateEvent, deleteEvent } from './src/api';
 
export default function App() {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function loadEvents() {
    setLoading(true);
    setError('');
    try { setEvents(await getEvents()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Error de red'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadEvents(); }, []);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  async function run(label: string, task: () => Promise<unknown>) {
    setBusy(true); setError(''); setResult('');
    try {
      const response = await task();
      setResult(label + '\n' + JSON.stringify(response, null, 2));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error de red');
    } finally { setBusy(false); }
  }
  const input = { artist: 'Nova Pulse', space: 'Main Stage', time: '21:00', status: 'CONFIRMED' as const };
  const actions: [string, () => Promise<unknown>][] = [
    ['POST crear', () => createEvent(input)],
    ['PUT reemplazar EVT-101', () => replaceEvent('EVT-101', input)],
    ['PATCH cancelar EVT-101', () => updateEvent('EVT-101', 'CANCELLED')],
    ['DELETE EVT-102', () => deleteEvent('EVT-102')]
  ];
  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>FESTIVAL CONTROL</Text>
        <Text style={styles.title}>Programación</Text>
        <Text style={styles.text}>Catálogo recibido por HTTP</Text>
        {events.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.tag}>{item.id} · {item.status}</Text>
            <Text style={styles.artist}>{item.artist}</Text>
            <Text style={styles.text}>{item.space} · {item.time}</Text>
          </View>
        ))}
        <Pressable accessibilityRole="button" disabled={loading || busy} style={styles.button} onPress={() => void loadEvents()}>
          <Text style={styles.buttonText}>{loading ? 'Cargando…' : 'GET recargar'}</Text>
        </Pressable>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Text style={styles.text}>Escrituras simuladas: el resultado se muestra debajo; la lista conserva sus dos eventos.</Text>
        {actions.map(([label, task]) => (
          <Pressable key={label} accessibilityRole="button" disabled={busy || loading} style={styles.button} onPress={() => void run(label, task)}>
            <Text style={styles.buttonText}>{label}</Text>
          </Pressable>
        ))}
        {busy ? <Text style={styles.text}>Enviando…</Text> : null}
        <Text accessibilityLiveRegion="polite" style={styles.result}>{result}</Text>
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
 