import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogScreen from './screens/LogScreen';
import DashboardScreen from './screens/DashboardScreen';

export default function App() {
  const [tab, setTab] = useState('log');
  const [refreshKey, setRefreshKey] = useState(0);

  function goToDash() {
    setRefreshKey(k => k + 1);
    setTab('dash');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" backgroundColor="#085041" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>PesaLog </Text>
        <Text style={styles.headerSub}>Virginia's M-Pesa tracker</Text>
      </View>

      {/* Screen content */}
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {tab === 'log'
          ? <LogScreen onSaved={goToDash} />
          : <DashboardScreen refreshKey={refreshKey} />
        }
      </KeyboardAvoidingView>

      {/* Tab Bar — always visible, never behind keyboard */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'log' && styles.tabActive]}
          onPress={() => setTab('log')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.tabText, tab === 'log' && styles.tabTextActive]}>Log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'dash' && styles.tabActive]}
          onPress={goToDash}
        >
          <Text style={styles.tabIcon}>Dashboard</Text>
          <Text style={[styles.tabText, tab === 'dash' && styles.tabTextActive]}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#085041',
  },
  header: {
    backgroundColor: '#085041',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    paddingBottom: 8,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  tabActive: {
    backgroundColor: '#E1F5EE',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#085041',
    fontWeight: '600',
  },
});