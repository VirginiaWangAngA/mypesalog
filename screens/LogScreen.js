import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Modal, Alert,
  DeviceEventEmitter
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseMpesaSMS } from '../services/SmsListener';

const CATS = [
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'bills', label: 'Bills', icon: '💡' },
  { id: 'health', label: 'Health', icon: '💊' },
  { id: 'savings', label: 'Savings', icon: '💰' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { id: 'fun', label: 'Fun', icon: '🎉' },
  { id: 'other', label: 'Other', icon: '📦' },
];

export default function LogScreen() {
  const [sms, setSms] = useState('');
  const [parsed, setParsed] = useState(null);
  const [pickedCat, setPickedCat] = useState(null);
  const [planned, setPlanned] = useState(null);
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1);
  const [showOverlay, setShowOverlay] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auto SMS listener — fires when M-Pesa SMS arrives
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'onMpesaSmsReceived',
      (body) => {
        const result = parseMpesaSMS(body);
        if (result) {
          setParsed(result);
          setPickedCat(null);
          setPlanned(null);
          setNote('');
          setStep(1);
          setSaved(false);
          setShowOverlay(true);
        }
      }
    );
    return () => subscription.remove();
  }, []);

  function handleParse() {
    const result = parseMpesaSMS(sms);
    if (!result) {
      Alert.alert('Could not read SMS', 'Paste a standard M-Pesa confirmation message and try again.');
      return;
    }
    setParsed(result);
    setPickedCat(null);
    setPlanned(null);
    setNote('');
    setStep(1);
    setSaved(false);
    setShowOverlay(true);
  }

  function handleNextFromCategory() {
    if (!pickedCat) {
      Alert.alert('Pick a category', 'Tell us what this transaction was for.');
      return;
    }
    setStep(2);
  }

  function handleNextFromPlanned(choice) {
    setPlanned(choice);
    setStep(3);
  }

  async function handleSave() {
    const cat = CATS.find(c => c.id === pickedCat);
    const entry = {
      id: Date.now().toString(),
      amount: parsed.amount.replace(/,/g, ''),
      amtDisplay: parsed.amount,
      to: parsed.to,
      ref: parsed.ref,
      date: parsed.date,
      balance: parsed.balance,
      cat: cat.id,
      catLabel: cat.label,
      catIcon: cat.icon,
      planned: planned,
      note: note.trim(),
      ts: Date.now(),
    };

    try {
      const existing = await AsyncStorage.getItem('pl_entries');
      const entries = existing ? JSON.parse(existing) : [];
      entries.unshift(entry);
      await AsyncStorage.setItem('pl_entries', JSON.stringify(entries));
      setShowOverlay(false);
      setSms('');
      setParsed(null);
      setSaved(true);
    } catch (e) {
      Alert.alert('Save failed', 'Something went wrong. Try again.');
    }
  }

  function handleClose() {
    setShowOverlay(false);
    setStep(1);
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      {saved && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✅ Transaction saved to dashboard</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Paste your M-Pesa SMS</Text>
        <TextInput
          style={styles.smsInput}
          multiline
          numberOfLines={4}
          placeholder="e.g. FKA23X Confirmed. Ksh1,200.00 sent to MAMA MBOGA 0712345678 on 6/9/26 at 10:23 AM. New M-PESA balance is Ksh8,450.00."
          placeholderTextColor="#aaa"
          value={sms}
          onChangeText={setSms}
        />
        <TouchableOpacity style={styles.parseBtn} onPress={handleParse}>
          <Text style={styles.parseBtnText}>Read transaction →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tip}>💡 SMS overlay will pop up automatically when M-Pesa message arrives</Text>

      <Modal visible={showOverlay} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.sheet}>

            <View style={styles.txSummary}>
              <Text style={styles.txAmt}>KES {parsed?.amount}</Text>
              <Text style={styles.txTo}>→ {parsed?.to}</Text>
              <Text style={styles.txDate}>{parsed?.date}</Text>
            </View>

            <View style={styles.stepRow}>
              {[1, 2, 3].map(n => (
                <View key={n} style={[styles.stepDot, step === n && styles.stepDotActive]} />
              ))}
            </View>

            {step === 1 && (
              <>
                <Text style={styles.sheetTitle}>Hey Vee 👋</Text>
                <Text style={styles.sheetSub}>What was this transaction for?</Text>
                <View style={styles.catGrid}>
                  {CATS.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catBtn, pickedCat === cat.id && styles.catBtnActive]}
                      onPress={() => setPickedCat(cat.id)}
                    >
                      <Text style={styles.catIcon}>{cat.icon}</Text>
                      <Text style={[styles.catLabel, pickedCat === cat.id && styles.catLabelActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={handleNextFromCategory}>
                  <Text style={styles.saveBtnText}>Next →</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.sheetTitle}>Was this planned? 🤔</Text>
                <Text style={styles.sheetSub}>Did you budget for this or was it spontaneous?</Text>
                <View style={styles.plannedRow}>
                  <TouchableOpacity
                    style={[styles.plannedBtn, styles.plannedYes]}
                    onPress={() => handleNextFromPlanned('planned')}
                  >
                    <Text style={styles.plannedIcon}>✅</Text>
                    <Text style={styles.plannedLabel}>Planned</Text>
                    <Text style={styles.plannedSub}>I budgeted for this</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.plannedBtn, styles.plannedNo]}
                    onPress={() => handleNextFromPlanned('unplanned')}
                  >
                    <Text style={styles.plannedIcon}>⚡</Text>
                    <Text style={styles.plannedLabel}>Unplanned</Text>
                    <Text style={styles.plannedSub}>Spontaneous spend</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(1)}>
                  <Text style={styles.skipBtnText}>← Back</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.sheetTitle}>Any details? ✏️</Text>
                <Text style={styles.sheetSub}>Optional — add context you'll thank yourself for later.</Text>
                <View style={styles.chipRow}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      {CATS.find(c => c.id === pickedCat)?.icon} {CATS.find(c => c.id === pickedCat)?.label}
                    </Text>
                  </View>
                  <View style={[styles.chip, planned === 'planned' ? styles.chipGreen : styles.chipOrange]}>
                    <Text style={styles.chipText}>{planned === 'planned' ? '✅ Planned' : '⚡ Unplanned'}</Text>
                  </View>
                </View>
                <TextInput
                  style={styles.noteInput}
                  placeholder="e.g. groceries, school shoes, team lunch…"
                  placeholderTextColor="#aaa"
                  value={note}
                  onChangeText={setNote}
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save to dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(2)}>
                  <Text style={styles.skipBtnText}>← Back</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={handleClose} style={{ marginTop: 8, alignItems: 'center' }}>
              <Text style={{ color: '#ccc', fontSize: 12 }}>dismiss</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  successBanner: { backgroundColor: '#E1F5EE', borderRadius: 10, padding: 12, marginBottom: 14 },
  successText: { color: '#085041', fontWeight: '500', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardLabel: { fontSize: 13, color: '#666', marginBottom: 8 },
  smsInput: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
    padding: 10, fontSize: 13, color: '#333',
    height: 100, textAlignVertical: 'top',
  },
  parseBtn: {
    backgroundColor: '#085041', borderRadius: 8,
    padding: 13, marginTop: 10, alignItems: 'center',
  },
  parseBtnText: { color: '#fff', fontWeight: '500', fontSize: 15 },
  tip: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 20, paddingBottom: 36,
  },
  txSummary: { backgroundColor: '#085041', borderRadius: 12, padding: 14, marginBottom: 12 },
  txAmt: { fontSize: 24, fontWeight: '600', color: '#fff' },
  txTo: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  txDate: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 16 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e0e0e0' },
  stepDotActive: { backgroundColor: '#085041', width: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  sheetSub: { fontSize: 14, color: '#666', marginBottom: 16 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catBtn: {
    width: '30%', borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 10, padding: 10, alignItems: 'center', backgroundColor: '#fafafa',
  },
  catBtnActive: { backgroundColor: '#E1F5EE', borderColor: '#1D9E75' },
  catIcon: { fontSize: 20, marginBottom: 4 },
  catLabel: { fontSize: 12, color: '#666' },
  catLabelActive: { color: '#085041', fontWeight: '500' },
  plannedRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  plannedBtn: {
    flex: 1, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1,
  },
  plannedYes: { backgroundColor: '#E1F5EE', borderColor: '#1D9E75' },
  plannedNo: { backgroundColor: '#FFF4E5', borderColor: '#F59E0B' },
  plannedIcon: { fontSize: 24, marginBottom: 6 },
  plannedLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  plannedSub: { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipGreen: { backgroundColor: '#E1F5EE' },
  chipOrange: { backgroundColor: '#FFF4E5' },
  chipText: { fontSize: 13, color: '#333' },
  noteInput: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
    padding: 10, fontSize: 14, color: '#333', marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#085041', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  skipBtn: { alignItems: 'center', padding: 10 },
  skipBtnText: { color: '#999', fontSize: 14 },
});