import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ElderlyCard from '../../src/components/ElderlyCard';
import { MOCK_ELDERLY, getElderlyStatus } from '../../src/data/mockData';

const STATUS_DOT: Record<string, string> = {
  green: '#66735D',
  yellow: '#B2844B',
  red: '#87566A',
};

export default function HomeScreen() {
  const router = useRouter();
  const today = new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const displayName = 'there';

  const doingWell = MOCK_ELDERLY.filter(e => getElderlyStatus(e.id) === 'green').length;
  const checkIn   = MOCK_ELDERLY.filter(e => getElderlyStatus(e.id) === 'yellow').length;
  const attention = MOCK_ELDERLY.filter(e => getElderlyStatus(e.id) === 'red').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, {displayName}</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/onboarding')} style={styles.addBtn}>
            <Feather name="plus" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Status Summary Strip */}
        <View style={styles.summaryStrip}>
          <SummaryChip dot={STATUS_DOT.green} count={doingWell} label="Doing well" />
          <View style={styles.divider} />
          <SummaryChip dot={STATUS_DOT.yellow} count={checkIn} label="Check in" />
          <View style={styles.divider} />
          <SummaryChip dot={STATUS_DOT.red} count={attention} label="Needs attention" />
        </View>

        {/* Loved One Cards */}
        <Text style={styles.sectionTitle}>Your loved ones</Text>
        {MOCK_ELDERLY.map(profile => (
          <ElderlyCard
            key={profile.id}
            profile={profile}
            status={getElderlyStatus(profile.id)}
            onPress={() => router.push(`/profile/${profile.id}`)}
          />
        ))}

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Quick links</Text>
        <View style={styles.quickGrid}>
          <QuickLink icon="book-open" label="Guide" sub="Tips and resources" onPress={() => router.push('/faq')} />
          <QuickLink icon="headphones" label="Support" sub="Get help anytime" onPress={() => router.push('/chatbot')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryChip({ dot, count, label }: { dot: string; count: number; label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipCount}>{count}</Text>
      <View style={styles.chipRow}>
        <View style={[styles.chipDot, { backgroundColor: dot }]} />
        <Text style={styles.chipLabel}>{label}</Text>
      </View>
    </View>
  );
}

function QuickLink({ icon, label, sub, onPress }: { icon: any; label: string; sub: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.7}>
      <Feather name={icon} size={22} color="#87566A" />
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3EC' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  greeting: { fontSize: 26, fontWeight: '500', color: '#2B2522', fontFamily: 'Georgia' },
  date: { fontSize: 13, color: '#A69C92', marginTop: 3 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#87566A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7DED2',
    padding: 20,
    marginBottom: 28,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },
  chip: { alignItems: 'center', gap: 6 },
  chipCount: { fontSize: 26, fontWeight: '500', color: '#2B2522', fontFamily: 'Georgia' },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipDot: { width: 7, height: 7, borderRadius: 999 },
  chipLabel: { fontSize: 12, color: '#756C64' },
  divider: { width: 1, height: 36, backgroundColor: '#E7DED2' },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2B2522',
    marginBottom: 14,
    marginTop: 4,
  },
  patientCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7DED2',
    borderLeftColor: '#66735D',
    borderLeftWidth: 4,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },
  patientAvatar: {
    alignItems: 'center',
    backgroundColor: '#F0F3ED',
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  patientAvatarText: {
    color: '#4A5745',
    fontFamily: 'Georgia',
    fontSize: 16,
    fontWeight: '500',
  },
  patientInfo: { flex: 1 },
  patientName: { color: '#2B2522', fontSize: 16, fontWeight: '600' },
  chevron: { fontSize: 20, color: '#C4B9AF', fontWeight: '300' },

  quickGrid: { flexDirection: 'row', gap: 12 },
  quickLink: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7DED2',
    padding: 18,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },
  quickLabel: { fontSize: 14, fontWeight: '600', color: '#2B2522' },
  quickSub: { fontSize: 12, color: '#A69C92' },
});
