import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MOCK_ELDERLY, MOCK_TRENDS, getElderlyStatus, getStatusLabel,
  getLastSeen, getLatestSession,
} from '../../src/data/mockData';
import StatusBadge from '../../src/components/StatusBadge';
import MiniSparkline from '../../src/components/MiniSparkline';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profile = MOCK_ELDERLY.find(e => e.id === id);

  if (!profile) return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.notFound}>Profile not found.</Text>
    </SafeAreaView>
  );

  const status = getElderlyStatus(id);
  const session = getLatestSession(id);
  const trend = MOCK_TRENDS[id] ?? [];
  const last7 = trend.slice(-7);
  const talkedDays = last7.filter(d => !d.missed).length;
  const avgDuration = last7.length
    ? Math.round(last7.filter(d => !d.missed).reduce((s, d) => s + d.duration, 0) / Math.max(1, talkedDays))
    : 0;

  const trendLabel = (() => {
    const prev7 = trend.slice(-14, -7);
    const curAvg = last7.reduce((s, d) => s + d.duration, 0) / 7;
    const prevAvg = prev7.reduce((s, d) => s + d.duration, 0) / 7;
    if (curAvg > prevAvg * 1.1) return 'More engaged than last week';
    if (curAvg < prevAvg * 0.9) return 'Less engaged this week';
    return 'Stable';
  })();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Banner */}
        <View style={styles.banner}>
          <StatusBadge status={status} label={getStatusLabel(status)} large />
          <Text style={styles.bannerName}>{profile.nickname} is {getStatusLabel(status).toLowerCase()}</Text>
          <Text style={styles.lastSeen}>Last spoke: {getLastSeen(id)}</Text>
          {session && (
            <Text style={styles.duration}>
              Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s
            </Text>
          )}
        </View>

        {/* Call Button */}
        <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Call', `Calling ${profile.nickname}...`)}>
          <Text style={styles.callBtnText}>📞  Call {profile.nickname}</Text>
        </TouchableOpacity>

        {/* Today's Summary */}
        {session && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's summary</Text>
            <Text style={styles.summaryText}>{session.summary}</Text>
            {session.topics.length > 0 && (
              <View style={styles.topicRow}>
                {session.topics.map(t => (
                  <View key={t} style={styles.topicChip}>
                    <Text style={styles.topicText}>{topicIcon(t)} {t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* This Week */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This week</Text>
          <MiniSparkline data={trend} days={7} height={48} />
          <Text style={styles.weekStat}>Talked {talkedDays} of 7 days · Avg {Math.floor(avgDuration / 60)}m {avgDuration % 60}s</Text>
          <View style={[styles.trendPill, trendLabel === 'Stable' ? styles.trendGreen : trendLabel.includes('More') ? styles.trendGreen : styles.trendYellow]}>
            <Text style={styles.trendText}>{trendLabel}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionGrid}>
          <ActionCard icon="📋" label="Full session" onPress={() => session && router.push(`/session/${session.id}`)} />
          <ActionCard icon="📅" label="30-day trend" onPress={() => router.push(`/trend/${id}`)} />
          <ActionCard icon="⚙️" label="Alert settings" onPress={() => router.push('/(tabs)/settings')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function topicIcon(topic: string): string {
  const map: Record<string, string> = {
    Market: '🛒', Food: '🍜', Family: '👨‍👩‍👧', Weather: '🌤',
    Travel: '✈️', Work: '💼', Health: '💊',
  };
  return map[topic] ?? '💬';
}

function ActionCard({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  notFound: { padding: 30, fontSize: 16, color: '#888', textAlign: 'center' },
  content: { padding: 20, paddingBottom: 48 },
  banner: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  bannerName: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginTop: 12 },
  lastSeen: { fontSize: 14, color: '#777', marginTop: 4 },
  duration: { fontSize: 13, color: '#999', marginTop: 2 },
  callBtn: {
    backgroundColor: '#1A6FA8', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16,
  },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  summaryText: { fontSize: 15, color: '#333', lineHeight: 22 },
  topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  topicChip: { backgroundColor: '#EEF6FC', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  topicText: { fontSize: 13, color: '#1A6FA8', fontWeight: '600' },
  weekStat: { fontSize: 13, color: '#666', marginTop: 10 },
  trendPill: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  trendGreen: { backgroundColor: '#E6F9F0' },
  trendYellow: { backgroundColor: '#FFF8E1' },
  trendText: { fontSize: 13, fontWeight: '600', color: '#555' },
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionIcon: { fontSize: 26 },
  actionLabel: { fontSize: 12, color: '#555', fontWeight: '600', textAlign: 'center' },
});
