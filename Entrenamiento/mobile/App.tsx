import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ZONE_STATUSES } from './src/types';
import type { Zone, ZoneStatus } from './src/types';
import { getZones, createZone, replaceZone, patchZone, deleteZone } from './src/api';

type Screen = 'list' | 'detail' | 'new' | 'edit';

const TABS: [Screen, string][] = [
  ['list', 'LISTADO'],
  ['detail', 'DETALLE'],
  ['new', 'NUEVO'],
  ['edit', 'EDITAR']
];

const STATUS_COLORS: Record<ZoneStatus, string> = {
  OPEN: '#34d399',
  FULL: '#fbbf24',
  CLOSED: '#f87171'
};

const formatCapacity = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function App() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('list');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState<ZoneStatus>('OPEN');

  const selected = zones.find(z => z.id === selectedId) ?? null;
  const disabled = busy || loading;

  async function loadZones() {
    setLoading(true);
    try {
      setZones(await getZones());
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error de red');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void loadZones(); }, []);

  async function run(label: string, task: () => Promise<unknown>): Promise<boolean> {
    setBusy(true); setError(''); setMessage('');
    try {
      await task();
      setMessage(label + ' ✓');
      await loadZones();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error de red');
      return false;
    } finally {
      setBusy(false);
    }
  }

  function startNew() {
    setName(''); setCapacity(''); setStatus('OPEN');
    setError(''); setMessage('');
    setScreen('new');
  }

  function startEdit(zone: Zone | null) {
    setError(''); setMessage('');
    if (zone) {
      setName(zone.name); setCapacity(String(zone.capacity)); setStatus(zone.status);
    }
    setScreen('edit');
  }

  function goTo(next: Screen) {
    if (next === 'new') startNew();
    else if (next === 'edit') startEdit(selected);
    else { setError(''); setMessage(''); setScreen(next); }
  }

  function openDetail(zone: Zone) {
    setSelectedId(zone.id);
    setError(''); setMessage('');
    setScreen('detail');
  }

  async function submitNew() {
    const ok = await run('POST crear', () => createZone({ name, capacity: Number(capacity), status }));
    if (ok) setScreen('list');
  }

  async function submitEdit() {
    if (!selected) return;
    const ok = await run('PUT ' + selected.id, () => replaceZone(selected.id, { name, capacity: Number(capacity), status }));
    if (ok) setScreen('detail');
  }

  async function cycleStatus() {
    if (!selected) return;
    const next = ZONE_STATUSES[(ZONE_STATUSES.indexOf(selected.status) + 1) % ZONE_STATUSES.length];
    await run('PATCH ' + selected.id + ' → ' + next, () => patchZone(selected.id, { status: next }));
  }

  async function remove() {
    if (!selected) return;
    const ok = await run('DELETE ' + selected.id, () => deleteZone(selected.id));
    if (ok) { setSelectedId(null); setScreen('list'); }
  }

  function renderStatus(value: ZoneStatus) {
    return (
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: STATUS_COLORS[value] }]} />
        <Text style={[styles.statusText, { color: STATUS_COLORS[value] }]}>{value}</Text>
      </View>
    );
  }

  function renderEmpty(text: string) {
    return (
      <View style={styles.gap}>
        <Text style={styles.muted}>{text}</Text>
        <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => goTo('list')}>
          <Text style={styles.secondaryText}>IR AL LISTADO</Text>
        </Pressable>
      </View>
    );
  }

  function renderForm(title: string, right: string, submitLabel: string, onSubmit: () => void, onCancel: () => void) {
    return (
      <View style={styles.gap}>
        <View style={styles.backRow}>
          <Pressable accessibilityRole="button" onPress={onCancel}>
            <Text style={styles.back}>← {screen === 'new' ? 'CANCELAR' : 'ESPACIO'}</Text>
          </Pressable>
          <Text style={styles.back}>{right}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.label}>NOMBRE</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="River Stage" placeholderTextColor="#555" />

        <Text style={styles.label}>CAPACIDAD</Text>
        <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" placeholder="1800" placeholderTextColor="#555" />

        <Text style={styles.label}>ESTADO</Text>
        <View style={styles.chips}>
          {ZONE_STATUSES.map(s => (
            <Pressable key={s} accessibilityRole="button" onPress={() => setStatus(s)} style={[styles.chip, status === s && styles.chipActive]}>
              <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable accessibilityRole="button" disabled={disabled} style={[styles.primary, disabled && styles.off]} onPress={onSubmit}>
          <Text style={styles.primaryText}>{busy ? 'ENVIANDO…' : submitLabel}</Text>
        </Pressable>
      </View>
    );
  }

  function renderList() {
    return (
      <View style={styles.gap}>
        <Text style={styles.eyebrow}>FESTIVAL OPERATIONS</Text>
        <Text style={styles.title}>ESPACIOS</Text>
        <Text style={styles.muted}>{zones.length} zonas · operación en directo</Text>

        {loading && zones.length === 0 ? <Text style={styles.muted}>Cargando…</Text> : null}

        {zones.map(zone => (
          <Pressable key={zone.id} accessibilityRole="button" style={styles.card} onPress={() => openDetail(zone)}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardName}>{zone.name.toUpperCase()}</Text>
              <Text style={styles.muted}>CAPACIDAD</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardCapacity}>{formatCapacity(zone.capacity)}</Text>
              {renderStatus(zone.status)}
            </View>
          </Pressable>
        ))}

        <Pressable accessibilityRole="button" disabled={disabled} style={[styles.primary, disabled && styles.off]} onPress={startNew}>
          <Text style={styles.primaryText}>+ NUEVO ESPACIO</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={disabled} style={[styles.secondary, disabled && styles.off]} onPress={() => void loadZones()}>
          <Text style={styles.secondaryText}>{loading ? 'CARGANDO…' : 'GET RECARGAR'}</Text>
        </Pressable>
      </View>
    );
  }

  function renderDetail() {
    if (!selected) return renderEmpty('Selecciona un espacio en el listado para ver su detalle.');
    return (
      <View style={styles.gap}>
        <View style={styles.backRow}>
          <Pressable accessibilityRole="button" onPress={() => goTo('list')}>
            <Text style={styles.back}>← ESPACIOS</Text>
          </Pressable>
          <Text style={styles.back}>{selected.id}</Text>
        </View>
        <Text style={styles.title}>{selected.name.toUpperCase()}</Text>

        <Text style={styles.muted}>CAPACIDAD</Text>
        <Text style={styles.bigNumber}>{formatCapacity(selected.capacity)}</Text>

        <View style={styles.statusLine}>
          <Text style={styles.muted}>ESTADO</Text>
          <View style={styles.pill}>{renderStatus(selected.status)}</View>
        </View>

        <Text style={styles.label}>OPERACIONES</Text>
        <Pressable accessibilityRole="button" disabled={disabled} style={[styles.secondary, disabled && styles.off]} onPress={() => startEdit(selected)}>
          <Text style={styles.secondaryText}>EDITAR ESPACIO</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={disabled} style={[styles.secondary, disabled && styles.off]} onPress={() => void cycleStatus()}>
          <Text style={styles.secondaryText}>CAMBIAR ESTADO</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={disabled} style={[styles.danger, disabled && styles.off]} onPress={() => void remove()}>
          <Text style={styles.secondaryText}>ELIMINAR</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.brand}>VENUE CONTROL</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: error ? '#f87171' : '#34d399' }]} />
            <Text style={[styles.statusText, { color: error ? '#f87171' : '#34d399' }]}>{error ? 'ERROR' : 'LIVE'}</Text>
          </View>
        </View>
        <View style={styles.tabs}>
          {TABS.map(([key, label]) => (
            <Pressable key={key} accessibilityRole="button" onPress={() => goTo(key)} style={[styles.tab, screen === key && styles.tabActive]}>
              <Text style={[styles.tabText, screen === key && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {message ? <Text accessibilityLiveRegion="polite" style={styles.ok}>{message}</Text> : null}

        {screen === 'list' ? renderList() : null}
        {screen === 'detail' ? renderDetail() : null}
        {screen === 'new'
          ? renderForm('NUEVO\nESPACIO', 'NUEVO', 'CREAR ESPACIO', () => void submitNew(), () => goTo('list'))
          : null}
        {screen === 'edit'
          ? (selected
              ? renderForm('EDITAR\n' + selected.name.toUpperCase(), selected.id, 'GUARDAR CAMBIOS', () => void submitEdit(), () => goTo('detail'))
              : renderEmpty('Selecciona un espacio en el listado para editarlo.'))
          : null}
      </ScrollView>
    </View>
  );
}

const PINK = '#ff2d8f';

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#080808' },
  header: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1c1c1c', gap: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: '#ffffff', fontWeight: '900', letterSpacing: 1.5, fontSize: 13 },
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#161616' },
  tabActive: { backgroundColor: PINK },
  tabText: { color: '#777777', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  tabTextActive: { color: '#ffffff' },

  content: { padding: 20, paddingBottom: 48, width: '100%', maxWidth: 560, alignSelf: 'center', gap: 14 },
  gap: { gap: 14 },
  eyebrow: { color: PINK, fontWeight: '800', fontSize: 11, letterSpacing: 2.5 },
  title: { color: '#ffffff', fontSize: 44, lineHeight: 46, fontWeight: '900', letterSpacing: -1 },
  muted: { color: '#777777', fontSize: 16 },
  label: { color: '#777777', fontWeight: '800', fontSize: 11, letterSpacing: 2, marginTop: 6 },
  bigNumber: { color: '#ffffff', fontSize: 44, fontWeight: '900' },

  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#262626', backgroundColor: '#151515' },
  cardLeft: { gap: 10, flexShrink: 1 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardName: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  cardCapacity: { color: '#ffffff', fontSize: 28, fontWeight: '900' },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  pill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#161616' },

  backRow: { flexDirection: 'row', justifyContent: 'space-between' },
  back: { color: '#8a8a8a', fontWeight: '800', fontSize: 11, letterSpacing: 1 },

  input: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#262626', backgroundColor: '#151515', color: '#ffffff', fontWeight: '700', fontSize: 14 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#262626', backgroundColor: '#151515' },
  chipActive: { borderColor: PINK, backgroundColor: '#2a0f1d' },
  chipText: { color: '#8a8a8a', fontWeight: '800', fontSize: 12 },
  chipTextActive: { color: '#ffffff' },

  primary: { padding: 18, borderRadius: 14, backgroundColor: PINK, alignItems: 'center' },
  primaryText: { color: '#ffffff', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  secondary: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#262626', backgroundColor: '#151515', alignItems: 'center' },
  secondaryText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  danger: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#5a1f2a', backgroundColor: '#3a141b', alignItems: 'center' },
  off: { opacity: 0.5 },

  error: { color: '#ffb4b4', fontSize: 15 },
  ok: { color: '#86efac', fontSize: 15 }
});