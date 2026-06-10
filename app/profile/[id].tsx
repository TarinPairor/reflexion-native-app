import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  MOCK_ELDERLY, MOCK_TRENDS, getElderlyStatus, getStatusLabel,
  getLastSeen, getLatestSession, getInitials,
} from '../../src/data/mockData';
import StatusBadge from '../../src/components/StatusBadge';
import MiniSparkline from '../../src/components/MiniSparkline';
import type { Status } from '../../src/data/mockData';

const AVATAR_BG: Record<Status, string> = {
  green: '#F0F3ED',
  yellow: '#F6EFE5',
  red: '#F3E8ED',
};

const AVATAR_TEXT: Record<Status, string> = {
  green: '#4A5745',
  yellow: '#7A5C30',
  red: '#6B3D50',
};

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
    if (curAvg > prevAvg * 1.1) return 'More engaged';
    if (curAvg < prevAvg * 0.9) return 'Less engaged';
    return 'Stable';
  })();

  const initials = getInitials(profile.nickname);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#2B2522" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.nickname}</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <Feather name="more-horizontal" size={20} color="#756C64" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTop}>
            <StatusBadge status={status} label={getStatusLabel(status)} />
            <View style={[styles.avatar, { backgroundColor: AVATAR_BG[status] }]}>
              <Text style={[styles.avatarText, { color: AVATAR_TEXT[status] }]}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.bannerName}>{profile.nickname}</Text>
          <Text style={styles.lastSeen}>{getLastSeen(id)}</Text>
          {session && session.duration > 0 && (
            <Text style={styles.duration}>
              Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s
            </Text>
          )}
        </View>

        {/* Call Button */}
        <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Call', `Calling ${profile.nickname}...`)}>
          <Feather name="phone" size={17} color="#FFFFFF" />
          <Text style={styles.callBtnText}>Call {profile.nickname}</Text>
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
                    <Text style={styles.topicText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* This Week */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This week</Text>
          <MiniSparkline data={trend} days={7} height={52} />
          <Text style={styles.weekStat}>
            Talked {talkedDays} of 7 days · Avg {Math.floor(avgDuration / 60)}m {avgDuration % 60}s
          </Text>
          <View style={styles.trendPill}>
            <Text style={styles.trendText}>{trendLabel}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionGrid}>
          <ActionCard icon="activity" label="Full session" onPress={() => session && router.push(`/session/${session.id}`)} />
          <ActionCard icon="bar-chart-2" label="30-day trend" onPress={() => router.push(`/trend/${id}`)} />
          <ActionCard icon="bell" label="Alert settings" onPress={() => router.push('/(tabs)/settings')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.75}>
      <Feather name={icon} size={20} color="#87566A" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3EC' },
  notFound: { padding: 30, fontSize: 16, color: '#A69C92', textAlign: 'center' },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#2B2522' },
  moreBtn: { padding: 4 },

  content: { paddingHorizontal: 20, paddingBottom: 48 },

  banner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7DED2',
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '500', fontFamily: 'Georgia' },
  bannerName: { fontSize: 22, fontWeight: '500', color: '#2B2522', fontFamily: 'Georgia', marginBottom: 4 },
  lastSeen: { fontSize: 14, color: '#756C64' },
  duration: { fontSize: 13, color: '#A69C92', marginTop: 2 },

  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#87566A',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 14,
  },
  callBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7DED2',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#A69C92', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  summaryText: { fontSize: 14, color: '#756C64', lineHeight: 21 },
  topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  topicChip: {
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E7DED2',
  },
  topicText: { fontSize: 12, color: '#756C64', fontWeight: '600' },
  weekStat: { fontSize: 13, color: '#756C64', marginTop: 12 },
  trendPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#F4F0EA',
  },
  trendText: { fontSize: 12, fontWeight: '600', color: '#66735D' },

  actionGrid: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7DED2',
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },
  actionLabel: { fontSize: 12, color: '#756C64', fontWeight: '600', textAlign: 'center' },
});
