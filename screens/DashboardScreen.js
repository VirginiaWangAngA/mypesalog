import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ refreshKey }) {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all'); // all | planned | unplanned

  async function loadEntries() {
    try {
      const stored = await AsyncStorage.getItem('pl_entries');
      setEntries(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.log('Load error', e);
    }
  }

  useEffect(() => {
  loadEntries();
}, [refreshKey]);

  async function clearAll() {
    Alert.alert(
      'Clear all transactions?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('pl_entries');
            setEntries([]);
          }
        }
      ]
    );
  }

  // Calculations
  const total = entries.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const plannedTotal = entries
    .filter(e => e.planned === 'planned')
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const unplannedTotal = entries
    .filter(e => e.planned === 'unplanned')
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const unplannedPct = total > 0 ? Math.round((unplannedTotal / total) * 100) : 0;

  // Category breakdown
  const catTotals = entries.reduce((acc, e) => {
    const key = e.catIcon + ' ' + e.catLabel;
    acc[key] = (acc[key] || 0) + parseFloat(e.amount || 0);
    return acc;
  }, {});
  const topCats = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Filtered list
  const filtered = filter === 'all'
    ? entries
    : entries.filter(e => e.planned === filter);

  function fmt(n) {
    return 'KES ' + parseFloat(n).toLocaleString('en-KE', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  return (
    <ScrollView style={styles.container}>

      {/* Summary cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.statCard, styles.statCardMain]}>
          <Text style={styles.statLbl}>Total spent</Text>
          <Text style={styles.statValLarge}>{fmt(total)}</Text>
          <Text style={styles.statSub}>{entries.length} transactions</Text>
        </View>
        <View style={styles.statRow}>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statLbl}>✅ Planned</Text>
            <Text style={styles.statVal}>{fmt(plannedTotal)}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statLbl}>⚡ Unplanned</Text>
            <Text style={styles.statVal}>{fmt(unplannedTotal)}</Text>
          </View>
        </View>
      </View>

      {/* Unplanned bar */}
      {total > 0 && (
        <View style={styles.card}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>Impulse spend</Text>
            <Text style={styles.barPct}>{unplannedPct}% unplanned</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${unplannedPct}%` }]} />
          </View>
          <Text style={styles.barHint}>
            {unplannedPct > 50
              ? '⚠️ More than half your spending was unplanned this period'
              : unplannedPct > 0
              ? '👍 Most of your spending is on track'
              : '🎯 All spending was planned — great discipline!'}
          </Text>
        </View>
      )}

      {/* Top categories */}
      {topCats.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Top categories</Text>
          {topCats.map(([cat, amt]) => (
            <View key={cat} style={styles.catRow}>
              <Text style={styles.catRowLabel}>{cat}</Text>
              <View style={styles.catBarWrap}>
                <View
                  style={[
                    styles.catBar,
                    { width: `${Math.round((amt / total) * 100)}%` }
                  ]}
                />
              </View>
              <Text style={styles.catRowAmt}>KES {amt.toLocaleString('en-KE', { maximumFractionDigits: 0 })}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Transaction list */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Transactions</Text>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {['all', 'planned', 'unplanned'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All' : f === 'planned' ? '✅ Planned' : '⚡ Unplanned'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No transactions here yet</Text>
          </View>
        ) : (
          filtered.map(e => (
            <View key={e.id} style={styles.txItem}>
              <View style={styles.txDot}>
                <Text style={{ fontSize: 18 }}>{e.catIcon}</Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txNote} numberOfLines={1}>
                  {e.note || e.catLabel} · {e.to}
                </Text>
                <View style={styles.txMetaRow}>
                  <Text style={styles.txMeta}>{e.catLabel}</Text>
                  <Text style={styles.txDivider}>·</Text>
                  <Text style={[
                    styles.txPlanned,
                    e.planned === 'planned' ? styles.txPlannedGreen : styles.txPlannedOrange
                  ]}>
                    {e.planned === 'planned' ? '✅ Planned' : '⚡ Unplanned'}
                  </Text>
                  <Text style={styles.txDivider}>·</Text>
                  <Text style={styles.txMeta}>{e.date}</Text>
                </View>
              </View>
              <Text style={styles.txAmt}>KES {parseFloat(e.amount).toLocaleString('en-KE', { maximumFractionDigits: 0 })}</Text>
            </View>
          ))
        )}
      </View>

      {/* Clear button */}
      {entries.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
          <Text style={styles.clearBtnText}>Clear all transactions</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 14 },

  // Summary
  summaryGrid: { marginBottom: 12 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, marginBottom: 8,
  },
  statCardMain: { backgroundColor: '#085041' },
  statCardGreen: { backgroundColor: '#E1F5EE', flex: 1, marginRight: 6 },
  statCardOrange: { backgroundColor: '#FFF4E5', flex: 1, marginLeft: 6 },
  statRow: { flexDirection: 'row' },
  statLbl: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  statValLarge: { fontSize: 26, fontWeight: '600', color: '#fff' },
  statVal: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 4 },
  statSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },

  // Bar
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  barLabel: { fontSize: 13, fontWeight: '500', color: '#333' },
  barPct: { fontSize: 13, fontWeight: '600', color: '#F59E0B' },
  barTrack: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 8 },
  barFill: { height: 8, backgroundColor: '#F59E0B', borderRadius: 4 },
  barHint: { fontSize: 12, color: '#666' },

  // Categories
  sectionLabel: { fontSize: 13, fontWeight: '500', color: '#666', marginBottom: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  catRowLabel: { width: 100, fontSize: 13, color: '#333' },
  catBarWrap: { flex: 1, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, marginHorizontal: 8 },
  catBar: { height: 6, backgroundColor: '#1D9E75', borderRadius: 3 },
  catRowAmt: { fontSize: 12, color: '#666', width: 70, textAlign: 'right' },

  // Filter
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  filterBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#f0f0f0',
  },
  filterBtnActive: { backgroundColor: '#085041' },
  filterText: { fontSize: 12, color: '#666' },
  filterTextActive: { color: '#fff', fontWeight: '500' },

  // Transactions
  txItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0',
  },
  txDot: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f5f5f5', alignItems: 'center',
    justifyContent: 'center', marginRight: 10,
  },
  txInfo: { flex: 1, minWidth: 0 },
  txNote: { fontSize: 14, fontWeight: '500', color: '#333' },
  txMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, flexWrap: 'wrap' },
  txMeta: { fontSize: 11, color: '#999' },
  txDivider: { fontSize: 11, color: '#ccc', marginHorizontal: 4 },
  txPlanned: { fontSize: 11, fontWeight: '500' },
  txPlannedGreen: { color: '#1D9E75' },
  txPlannedOrange: { color: '#F59E0B' },
  txAmt: { fontSize: 14, fontWeight: '500', color: '#085041', marginLeft: 8 },

  // Empty
  empty: { alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: '#999', fontSize: 14 },

  // Clear
  clearBtn: { alignItems: 'center', padding: 14 },
  clearBtnText: { color: '#e53e3e', fontSize: 13 },
});