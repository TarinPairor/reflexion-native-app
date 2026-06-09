import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

type Step = 1 | 2 | 3 | 4;

interface AccountForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  relationship: string;
}

interface ElderlyForm {
  nickname: string;
  age: string;
  gender: 'male' | 'female';
  language: 'English' | 'Mandarin';
  wakeTime: string;
  conditions: string;
  topics: string[];
}

const TOPICS = ['Family', 'Food', 'Travel', 'Work', 'Health', 'Religion', 'Music'];
const RELATIONSHIPS = ['Child', 'Sibling', 'Spouse', 'Other'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [account, setAccount] = useState<AccountForm>({
    name: '', email: '', password: '', phone: '', relationship: 'Child',
  });
  const [elderly, setElderly] = useState<ElderlyForm>({
    nickname: '', age: '', gender: 'female', language: 'English',
    wakeTime: '07:30', conditions: '', topics: ['Family', 'Food'],
  });
  const [mirrorCode, setMirrorCode] = useState('');
  const [mirrorLinked, setMirrorLinked] = useState(false);
  const [notifPref, setNotifPref] = useState<'all' | 'important' | 'urgent'>('important');
  const [summaryTime, setSummaryTime] = useState<'morning' | 'evening'>('morning');

  function next() {
    if (step === 1 && (!account.name || !account.email)) {
      Alert.alert('Required', 'Please enter your name and email.');
      return;
    }
    if (step === 2 && !elderly.nickname) {
      Alert.alert('Required', "Please enter your loved one's name.");
      return;
    }
    if (step < 4) setStep((step + 1) as Step);
    else finish();
  }

  function back() {
    if (step > 1) setStep((step - 1) as Step);
    else router.back();
  }

  function finish() {
    Alert.alert(
      'Setup Complete!',
      `Welcome to Reflexion, ${account.name.split(' ')[0]}!\n\n${elderly.nickname}'s profile has been created and Aria is ready.`,
      [{ text: 'Get started', onPress: () => router.replace('/(tabs)') }],
    );
  }

  function linkMirror() {
    if (mirrorCode.trim().length < 4) {
      Alert.alert('Invalid code', 'Please scan the QR code on your Reflexion device, or enter the 6-digit code printed on the back.');
      return;
    }
    setMirrorLinked(true);
    Alert.alert('Mirror linked!', `Mirror successfully linked to ${elderly.nickname}'s profile. Sending a test greeting now...`);
  }

  function toggleTopic(t: string) {
    setElderly(prev => ({
      ...prev,
      topics: prev.topics.includes(t) ? prev.topics.filter(x => x !== t) : [...prev.topics, t],
    }));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Progress bar */}
        <View style={styles.progress}>
          {[1, 2, 3, 4].map(s => (
            <View key={s} style={[styles.progressStep, s <= step && styles.progressActive]} />
          ))}
        </View>
        <Text style={styles.progressLabel}>Step {step} of 4</Text>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* ─── STEP 1: Account ─────────────────────────────────────── */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Create your account</Text>
              <Text style={styles.stepSub}>This takes about 60 seconds.</Text>

              <Label>Your full name</Label>
              <TextInput style={styles.input} placeholder="e.g. Sarah Lim" value={account.name}
                onChangeText={v => setAccount(a => ({ ...a, name: v }))} />

              <Label>Email</Label>
              <TextInput style={styles.input} placeholder="sarah@email.com" value={account.email}
                keyboardType="email-address" autoCapitalize="none"
                onChangeText={v => setAccount(a => ({ ...a, email: v }))} />

              <Label>Password</Label>
              <TextInput style={styles.input} placeholder="At least 8 characters" value={account.password}
                secureTextEntry onChangeText={v => setAccount(a => ({ ...a, password: v }))} />

              <Label>Phone number</Label>
              <TextInput style={styles.input} placeholder="+65 9123 4567" value={account.phone}
                keyboardType="phone-pad" onChangeText={v => setAccount(a => ({ ...a, phone: v }))} />

              <Label>Your relationship to them</Label>
              <View style={styles.pillRow}>
                {RELATIONSHIPS.map(r => (
                  <TouchableOpacity key={r} style={[styles.pill, account.relationship === r && styles.pillActive]}
                    onPress={() => setAccount(a => ({ ...a, relationship: r }))}>
                    <Text style={[styles.pillText, account.relationship === r && styles.pillTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ─── STEP 2: Elderly Profile ──────────────────────────────── */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>About your loved one</Text>
              <Text style={styles.stepSub}>This takes about 90 seconds. You can always edit later.</Text>

              <Label>What do they like to be called?</Label>
              <TextInput style={styles.input} placeholder="e.g. Grandma, Mum, Ah Ma" value={elderly.nickname}
                onChangeText={v => setElderly(e => ({ ...e, nickname: v }))} />

              <Label>Age</Label>
              <TextInput style={styles.input} placeholder="e.g. 78" value={elderly.age}
                keyboardType="number-pad" onChangeText={v => setElderly(e => ({ ...e, age: v }))} />

              <Label>Gender</Label>
              <View style={styles.pillRow}>
                {(['female', 'male'] as const).map(g => (
                  <TouchableOpacity key={g} style={[styles.pill, elderly.gender === g && styles.pillActive]}
                    onPress={() => setElderly(e => ({ ...e, gender: g }))}>
                    <Text style={[styles.pillText, elderly.gender === g && styles.pillTextActive]}>
                      {g === 'female' ? 'Female' : 'Male'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Label>Preferred language</Label>
              <View style={styles.pillRow}>
                {(['English', 'Mandarin'] as const).map(l => (
                  <TouchableOpacity key={l} style={[styles.pill, elderly.language === l && styles.pillActive]}
                    onPress={() => setElderly(e => ({ ...e, language: l }))}>
                    <Text style={[styles.pillText, elderly.language === l && styles.pillTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Label>Usual wake time</Label>
              <TextInput style={styles.input} placeholder="e.g. 07:30" value={elderly.wakeTime}
                onChangeText={v => setElderly(e => ({ ...e, wakeTime: v }))} />

              <Label>Topics they enjoy (select all that apply)</Label>
              <View style={styles.pillRow}>
                {TOPICS.map(t => (
                  <TouchableOpacity key={t} style={[styles.pill, elderly.topics.includes(t) && styles.pillActive]}
                    onPress={() => toggleTopic(t)}>
                    <Text style={[styles.pillText, elderly.topics.includes(t) && styles.pillTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Label>Any known conditions affecting speech or hearing? (optional)</Label>
              <TextInput style={[styles.input, styles.inputMulti]} placeholder="e.g. mild hearing loss"
                value={elderly.conditions} multiline numberOfLines={2}
                onChangeText={v => setElderly(e => ({ ...e, conditions: v }))} />
            </View>
          )}

          {/* ─── STEP 3: Mirror Linking ───────────────────────────────── */}
          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>Link your Reflexion mirror</Text>
              <Text style={styles.stepSub}>Scan the QR code on the device, or enter the code printed on the back.</Text>

              <View style={styles.qrBox}>
                <Text style={styles.qrIcon}>📷</Text>
                <TouchableOpacity style={styles.qrBtn} onPress={() => Alert.alert('QR Scanner', 'Camera QR scanning requires expo-camera. (Boilerplate)')}>
                  <Text style={styles.qrBtnText}>Scan QR code</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.orText}>— or enter code manually —</Text>

              <TextInput
                style={styles.input}
                placeholder="6-digit code (e.g. RF-4721)"
                value={mirrorCode}
                autoCapitalize="characters"
                onChangeText={setMirrorCode}
              />

              <TouchableOpacity
                style={[styles.linkBtn, mirrorLinked && styles.linkBtnLinked]}
                onPress={linkMirror}
              >
                <Text style={styles.linkBtnText}>{mirrorLinked ? '✓ Mirror linked!' : 'Link mirror'}</Text>
              </TouchableOpacity>

              {mirrorLinked && (
                <View style={styles.testRow}>
                  <Text style={styles.testSuccess}>🎙 Aria should be saying hello on the mirror now.</Text>
                </View>
              )}

              <TouchableOpacity onPress={() => setStep(4)} style={styles.skipLink}>
                <Text style={styles.skipText}>Skip for now — link mirror later in Settings</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ─── STEP 4: Notifications ────────────────────────────────── */}
          {step === 4 && (
            <View>
              <Text style={styles.stepTitle}>Set up notifications</Text>
              <Text style={styles.stepSub}>The daily push is how you'll know Mum is okay. We recommend enabling it.</Text>

              <Label>Alert sensitivity</Label>
              {([
                { value: 'all', label: 'Notify me about everything', desc: 'All changes, including minor ones' },
                { value: 'important', label: 'Only important changes', desc: 'Recommended for most caregivers' },
                { value: 'urgent', label: 'Only urgent alerts', desc: 'Missed sessions and major changes only' },
              ] as const).map(o => (
                <TouchableOpacity key={o.value} style={[styles.optionCard, notifPref === o.value && styles.optionCardActive]}
                  onPress={() => setNotifPref(o.value)}>
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionLabel}>{o.label}</Text>
                    <Text style={styles.optionDesc}>{o.desc}</Text>
                  </View>
                  <View style={[styles.radio, notifPref === o.value && styles.radioActive]} />
                </TouchableOpacity>
              ))}

              <Label>Daily summary time</Label>
              <View style={styles.pillRow}>
                {([
                  { value: 'morning', label: 'Morning (9am)' },
                  { value: 'evening', label: 'Evening (7pm)' },
                ] as const).map(o => (
                  <TouchableOpacity key={o.value} style={[styles.pill, summaryTime === o.value && styles.pillActive]}
                    onPress={() => setSummaryTime(o.value)}>
                    <Text style={[styles.pillText, summaryTime === o.value && styles.pillTextActive]}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.readyBox}>
                <Text style={styles.readyIcon}>🎉</Text>
                <Text style={styles.readyTitle}>You're all set!</Text>
                <Text style={styles.readyText}>
                  Aria will greet {elderly.nickname || 'your loved one'} tomorrow morning at {elderly.wakeTime}.
                  You'll get your first summary push at {summaryTime === 'morning' ? '9am' : '7pm'}.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Text style={styles.backBtnText}>{step === 1 ? 'Cancel' : '← Back'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={next}>
            <Text style={styles.nextBtnText}>{step === 4 ? 'Finish setup' : 'Continue →'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  progress: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 16 },
  progressStep: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' },
  progressActive: { backgroundColor: '#1A6FA8' },
  progressLabel: { fontSize: 12, color: '#888', paddingHorizontal: 20, marginTop: 4, marginBottom: 4 },
  content: { padding: 20, paddingBottom: 20 },
  stepTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  stepSub: { fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15,
    borderWidth: 1.5, borderColor: '#E0E0E0', color: '#1A1A2E',
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F0F0F0', borderWidth: 1.5, borderColor: '#E0E0E0',
  },
  pillActive: { backgroundColor: '#1A6FA8', borderColor: '#1A6FA8' },
  pillText: { fontSize: 13, color: '#555', fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  qrBox: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#E0E0E0', borderStyle: 'dashed', marginBottom: 16 },
  qrIcon: { fontSize: 48, marginBottom: 12 },
  qrBtn: { backgroundColor: '#1A6FA8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  qrBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  orText: { textAlign: 'center', color: '#999', fontSize: 13, marginVertical: 12 },
  linkBtn: { backgroundColor: '#1A6FA8', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  linkBtnLinked: { backgroundColor: '#2ECC71' },
  linkBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  testRow: { marginTop: 12, padding: 12, backgroundColor: '#E6F9F0', borderRadius: 10 },
  testSuccess: { fontSize: 14, color: '#1A7A4A', textAlign: 'center' },
  skipLink: { marginTop: 16, alignItems: 'center' },
  skipText: { fontSize: 13, color: '#1A6FA8', textDecorationLine: 'underline' },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#E0E0E0',
  },
  optionCardActive: { borderColor: '#1A6FA8', backgroundColor: '#EEF6FC' },
  optionLeft: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  optionDesc: { fontSize: 13, color: '#888' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CCC' },
  radioActive: { backgroundColor: '#1A6FA8', borderColor: '#1A6FA8' },
  readyBox: { backgroundColor: '#E6F9F0', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 20 },
  readyIcon: { fontSize: 40, marginBottom: 8 },
  readyTitle: { fontSize: 20, fontWeight: '800', color: '#1A7A4A', marginBottom: 8 },
  readyText: { fontSize: 14, color: '#2C6E49', textAlign: 'center', lineHeight: 20 },
  navBar: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 20,
    paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#fff',
  },
  backBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  backBtnText: { fontSize: 15, color: '#888', fontWeight: '600' },
  nextBtn: { backgroundColor: '#1A6FA8', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
