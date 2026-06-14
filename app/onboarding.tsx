import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

type Mode = 'create' | 'existing';
type ExistingIdentifier = 'username' | 'email';

interface PatientForm {
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  relationship: string;
}

const RELATIONSHIPS = ['Spouse', 'Child', 'Parent'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('create');
  const [identifierType, setIdentifierType] = useState<ExistingIdentifier>('username');
  const [existingIdentifier, setExistingIdentifier] = useState('');
  const [existingRelationship, setExistingRelationship] = useState('Child');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [patient, setPatient] = useState<PatientForm>({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    relationship: 'Child',
  });

  async function submit() {
    if (mode === 'create') {
      if (!patient.name.trim() || !patient.username.trim() || !patient.password.trim()) {
        Alert.alert('Required', 'Please enter the patient name, username, and password.');
        return;
      }

      setNotice({ type: 'success', message: 'Patient created successfully.' });
      setTimeout(() => router.replace('/(tabs)'), 800);
      return;
    }

    if (!existingIdentifier.trim()) {
      Alert.alert(
        'Required',
        `Please enter the patient ${identifierType === 'email' ? 'email' : 'username'}.`,
      );
      return;
    }

    setNotice({
      type: 'error',
      message: 'Patient linking is disabled while backend services are being refactored.',
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add patient</Text>
          <Text style={styles.subtitle}>Create a new patient account or attach an existing patient.</Text>
          {notice ? (
            <View style={[styles.notice, notice.type === 'success' ? styles.noticeSuccess : styles.noticeError]}>
              <Text style={[styles.noticeText, notice.type === 'success' ? styles.noticeSuccessText : styles.noticeErrorText]}>
                {notice.message}
              </Text>
            </View>
          ) : null}

          <View style={styles.modeControl}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('create')}
              style={[styles.modeButton, mode === 'create' && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, mode === 'create' && styles.modeTextActive]}>
                Create new
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('existing')}
              style={[styles.modeButton, mode === 'existing' && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, mode === 'existing' && styles.modeTextActive]}>
                Existing patient
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'create' ? (
            <View>
              <Label>Patient name</Label>
              <TextInput
                onChangeText={(value) => setPatient((prev) => ({ ...prev, name: value }))}
                placeholder="e.g. Donald Tan"
                style={styles.input}
                value={patient.name}
              />

              <Label>Username</Label>
              <TextInput
                autoCapitalize="none"
                autoComplete="username"
                onChangeText={(value) => setPatient((prev) => ({ ...prev, username: value }))}
                placeholder="e.g. donaldtan"
                style={styles.input}
                value={patient.username}
              />

              <Label>Password</Label>
              <TextInput
                autoCapitalize="none"
                onChangeText={(value) => setPatient((prev) => ({ ...prev, password: value }))}
                placeholder="Create a password"
                secureTextEntry
                style={styles.input}
                value={patient.password}
              />

              <Label>Email</Label>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={(value) => setPatient((prev) => ({ ...prev, email: value }))}
                placeholder="patient@email.com"
                style={styles.input}
                value={patient.email}
              />

              <Label>Phone number</Label>
              <TextInput
                keyboardType="phone-pad"
                onChangeText={(value) => setPatient((prev) => ({ ...prev, phone: value }))}
                placeholder="+65 9123 4567"
                style={styles.input}
                value={patient.phone}
              />

              <Label>Type</Label>
              <View style={styles.pillRow}>
                {RELATIONSHIPS.map((relationship) => (
                  <TouchableOpacity
                    key={relationship}
                    onPress={() => setPatient((prev) => ({ ...prev, relationship }))}
                    style={[
                      styles.pill,
                      patient.relationship === relationship && styles.pillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        patient.relationship === relationship && styles.pillTextActive,
                      ]}
                    >
                      {relationship}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View>
              <Label>Find patient by</Label>
              <View style={styles.identifierControl}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setIdentifierType('username');
                    setExistingIdentifier('');
                  }}
                  style={[
                    styles.identifierButton,
                    identifierType === 'username' && styles.identifierButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.identifierText,
                      identifierType === 'username' && styles.identifierTextActive,
                    ]}
                  >
                    Username
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setIdentifierType('email');
                    setExistingIdentifier('');
                  }}
                  style={[
                    styles.identifierButton,
                    identifierType === 'email' && styles.identifierButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.identifierText,
                      identifierType === 'email' && styles.identifierTextActive,
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>
              </View>

              <Label>{identifierType === 'email' ? 'Email' : 'Username'}</Label>
              <TextInput
                autoCapitalize="none"
                autoComplete={identifierType === 'email' ? 'email' : 'username'}
                keyboardType={identifierType === 'email' ? 'email-address' : 'default'}
                onChangeText={setExistingIdentifier}
                placeholder={identifierType === 'email' ? 'patient@email.com' : 'e.g. donaldtan'}
                style={styles.input}
                value={existingIdentifier}
              />

              <Label>Relationship</Label>
              <View style={styles.pillRow}>
                {RELATIONSHIPS.map((relationship) => (
                  <TouchableOpacity
                    key={relationship}
                    onPress={() => setExistingRelationship(relationship)}
                    style={[
                      styles.pill,
                      existingRelationship === relationship && styles.pillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        existingRelationship === relationship && styles.pillTextActive,
                      ]}
                    >
                      {relationship}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={submit}>
            <Text style={styles.nextBtnText}>
              {mode === 'create' ? 'Create patient' : 'Add patient'}
            </Text>
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
  content: { padding: 20, paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 20 },
  notice: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noticeSuccess: {
    backgroundColor: '#E6F9F0',
    borderColor: '#BFE8D2',
  },
  noticeError: {
    backgroundColor: '#F9E6EC',
    borderColor: '#E7C2CE',
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  noticeSuccessText: {
    color: '#1A7A4A',
  },
  noticeErrorText: {
    color: '#87566A',
  },
  modeControl: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
  },
  modeButtonActive: { backgroundColor: '#1A6FA8', borderColor: '#1A6FA8' },
  modeText: { color: '#555', fontSize: 14, fontWeight: '700' },
  modeTextActive: { color: '#FFFFFF' },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    color: '#1A1A2E',
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  pillActive: { backgroundColor: '#1A6FA8', borderColor: '#1A6FA8' },
  pillText: { fontSize: 13, color: '#555', fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  identifierControl: {
    flexDirection: 'row',
    gap: 8,
  },
  identifierButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 10,
  },
  identifierButtonActive: { backgroundColor: '#1A6FA8', borderColor: '#1A6FA8' },
  identifierText: { color: '#555', fontSize: 13, fontWeight: '700' },
  identifierTextActive: { color: '#FFFFFF' },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  backBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  backBtnText: { fontSize: 15, color: '#888', fontWeight: '600' },
  nextBtn: { backgroundColor: '#1A6FA8', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
