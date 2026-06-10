import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
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
        <ActionRow label="Edit account" onPress={() => Alert.alert('Edit Account', 'Account editing coming soon.')} />

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

        {/* Voice Companion */}
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

        {/* Loved One Profiles */}
        <SectionHeader title="Loved one profiles" />
        {MOCK_ELDERLY.map(e => (
          <ActionRow
            key={e.id}
            label={e.nickname}
            value={e.language}
            onPress={() => Alert.alert('Edit Profile', `Edit profile for ${e.nickname}. (Coming soon)`)}
          />
        ))}
        <ActionRow label="Add a loved one" onPress={() => router.push('/onboarding')} />

        {/* Privacy */}
        <SectionHeader title="Privacy & Data" />
        <SwitchRow label="Store session summaries" value={storeSessions} onChange={setStoreSessions} />
        <ActionRow label="Export my data" onPress={() => Alert.alert('Export', 'Data export coming in V2.')} />

        {/* Support */}
        <SectionHeader title="Support" />
        <ActionRow label="FAQ & Guide" onPress={() => router.push('/faq')} />
        <ActionRow label="Chat with support" onPress={() => router.push('/chatbot')} />
        <ActionRow
          label="Give feedback"
          onPress={() =>
            Alert.alert(
              'Give Feedback',
              'How is Reflexion working for you?',
              [
                { text: 'Not helpful', style: 'destructive' },
                { text: 'Could be better', style: 'cancel' },
                { text: 'Really helpful!', onPress: () => Alert.alert('Thank you', 'Your feedback means a lot to us.') },
              ],
            )
          }
        />
        <ActionRow label="Subscription & Billing" onPress={() => Alert.alert('Billing', 'Billing portal coming soon.')} />

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert('Log out', 'Log out of Reflexion?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log out', style: 'destructive', onPress: () => {} },
            ])
          }
        >
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
        <Feather name="chevron-right" size={16} color="#C4B9AF" />
      </View>
    </TouchableOpacity>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: '#D8CFC3', true: '#87566A' }} thumbColor="#FFFFFF" />
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
  safe: { flex: 1, backgroundColor: '#F8F3EC' },
  scroll: { flex: 1 },
  content: { paddingBottom: 60 },
  pageTitle: { fontSize: 26, fontWeight: '500', color: '#2B2522', padding: 20, paddingBottom: 8, fontFamily: 'Georgia' },

  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A69C92',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EDE6',
  },
  rowLabel: { fontSize: 15, color: '#2B2522' },
  rowValue: { fontSize: 15, color: '#A69C92' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  pickerBlock: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EDE6',
  },
  pickerOptions: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E7DED2',
  },
  pillActive: { backgroundColor: '#87566A', borderColor: '#87566A' },
  pillText: { fontSize: 13, color: '#756C64' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '600' },

  logoutBtn: {
    margin: 20,
    marginTop: 36,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8CFC3',
    alignItems: 'center',
  },
  logoutText: { color: '#87566A', fontSize: 15, fontWeight: '600' },
});
