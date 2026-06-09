import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import ElderlyCard from '../../src/components/ElderlyCard';
import { MOCK_ELDERLY, MOCK_CAREGIVER, getElderlyStatus } from '../../src/data/mockData';

export default function HomeScreen() {
  const router = useRouter();
  const today = new Date().toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, {MOCK_CAREGIVER.name.split(' ')[0]} 👋</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/onboarding')} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Status Summary Strip */}
        <View style={styles.summaryStrip}>
          <SummaryChip icon="🟢" count={MOCK_ELDERLY.filter(e => getElderlyStatus(e.id) === 'green').length} label="Well" />
          <SummaryChip icon="🟡" count={MOCK_ELDERLY.filter(e => getElderlyStatus(e.id) === 'yellow').length} label="Check" />
          <SummaryChip icon="🔴" count={MOCK_ELDERLY.filter(e => getElderlyStatus(e.id) === 'red').length} label="Alert" />
        </View>

        {/* Elderly Cards */}
        <Text style={styles.sectionTitle}>Your loved ones</Text>
        {MOCK_ELDERLY.map(profile => (
          <ElderlyCard
            key={profile.id}
            profile={profile}
            status={getElderlyStatus(profile.id)}
            onPress={() => router.push(`/profile/${profile.id}`)}
          />
        ))}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick links</Text>
        <View style={styles.quickGrid}>
          <QuickLink icon="❓" label="FAQ & Guide" onPress={() => router.push('/faq')} />
          <QuickLink icon="💬" label="Support" onPress={() => router.push('/chatbot')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryChip({ icon, count, label }: { icon: string; count: number; label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={styles.chipCount}>{count}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function QuickLink({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  date: { fontSize: 13, color: '#888', marginTop: 2 },
  addBtn: { backgroundColor: '#1A6FA8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chip: { alignItems: 'center', gap: 2 },
  chipIcon: { fontSize: 20 },
  chipCount: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  chipLabel: { fontSize: 12, color: '#888' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#555', marginBottom: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickGrid: { flexDirection: 'row', gap: 12 },
  quickLink: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  quickIcon: { fontSize: 28 },
  quickLabel: { fontSize: 13, color: '#555', fontWeight: '600', textAlign: 'center' },
});
