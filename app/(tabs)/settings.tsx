import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_CAREGIVER, MOCK_ELDERLY } from '../../src/data/mockData';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifs, setNotifs] = useState(true);
  const [summaryTime, setSummaryTime] = useState<'morning' | 'evening'>('morning');
  const [alertLevel, setAlertLevel] = useState<'all' | 'important' | 'urgent'>('important');
  const [storeSessions, setStoreSessions] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Account */}
        <SectionHeader title="Account" />
        <SettingRow label="Name" value={MOCK_CAREGIVER.name} />
        <SettingRow label="Email" value={MOCK_CAREGIVER.email} />
        <SettingRow label="Phone" value={MOCK_CAREGIVER.phone} />
        <ActionRow label="Edit Account" onPress={() => Alert.alert('Edit Account', 'Account editing coming soon.')} />

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <SwitchRow label="Enable push notifications" value={notifs} onChange={setNotifs} />
        <PickerRow
          label="Daily summary"
          options={[
            { value: 'morning', label: 'Morning (9am)' },
            { value: 'evening', label: 'Evening (7pm)' },
          ]}
          selected={summaryTime}
          onSelect={v => setSummaryTime(v as 'morning' | 'evening')}
        />
        <PickerRow
          label="Alert sensitivity"
          options={[
            { value: 'all', label: 'All changes' },
            { value: 'important', label: 'Important only' },
            { value: 'urgent', label: 'Urgent only' },
          ]}
          selected={alertLevel}
          onSelect={v => setAlertLevel(v as 'all' | 'important' | 'urgent')}
        />

        {/* Aria / Mirror */}
        <SectionHeader title="Voice Companion (Aria)" />
        {MOCK_ELDERLY.map(e => (
          <ActionRow
            key={e.id}
            label={`${e.nickname} — Speech speed`}
            value="Slow"
            onPress={() => Alert.alert('Speech Speed', `Adjust Aria's speed for ${e.nickname}. (Coming soon)`)}
          />
        ))}
        <ActionRow label="Manage linked mirrors" onPress={() => Alert.alert('Mirrors', 'Mirror management coming soon.')} />

        {/* Elderly Profiles */}
        <SectionHeader title="Elderly Profiles" />
        {MOCK_ELDERLY.map(e => (
          <ActionRow
            key={e.id}
            label={e.nickname}
            value={e.language}
            onPress={() => Alert.alert('Edit Profile', `Edit profile for ${e.nickname}. (Coming soon)`)}
          />
        ))}
        <ActionRow label="Add new elderly profile" onPress={() => router.push('/onboarding')} />

        {/* Privacy */}
        <SectionHeader title="Privacy & Data" />
        <SwitchRow label="Store session summaries" value={storeSessions} onChange={setStoreSessions} />
        <ActionRow label="Export my data" onPress={() => Alert.alert('Export', 'Data export coming in V2.')} />

        {/* Support */}
        <SectionHeader title="Support" />
        <ActionRow label="FAQ & Guide" onPress={() => router.push('/faq')} />
        <ActionRow label="Chat with support" onPress={() => router.push('/chatbot')} />
        <ActionRow label="Subscription & Billing" onPress={() => Alert.alert('Billing', 'Billing portal coming soon.')} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Log out', 'Log out of Reflexion?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log out', style: 'destructive', onPress: () => {} },
        ])}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ActionRow({ label, value, onPress }: { label: string; value?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: '#1A6FA8' }} />
    </View>
  );
}

function PickerRow({ label, options, selected, onSelect }: {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.pickerBlock}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.pickerOptions}>
        {options.map(o => (
          <TouchableOpacity
            key={o.value}
            style={[styles.pill, selected === o.value && styles.pillActive]}
            onPress={() => onSelect(o.value)}
          >
            <Text style={[styles.pillText, selected === o.value && styles.pillTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  scroll: { flex: 1 },
  content: { paddingBottom: 60 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#1A1A2E', padding: 20, paddingBottom: 8 },
  sectionHeader: {
    fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase',
    letterSpacing: 0.8, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 6,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  rowLabel: { fontSize: 15, color: '#1A1A2E' },
  rowValue: { fontSize: 15, color: '#888' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chevron: { fontSize: 20, color: '#CCC' },
  pickerBlock: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  pickerOptions: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#E0E0E0',
  },
  pillActive: { backgroundColor: '#1A6FA8', borderColor: '#1A6FA8' },
  pillText: { fontSize: 13, color: '#555' },
  pillTextActive: { color: '#fff', fontWeight: '600' },
  logoutBtn: {
    margin: 20, marginTop: 32, padding: 16, backgroundColor: '#FFF',
    borderRadius: 14, borderWidth: 1.5, borderColor: '#E74C3C', alignItems: 'center',
  },
  logoutText: { color: '#E74C3C', fontSize: 16, fontWeight: '700' },
});
