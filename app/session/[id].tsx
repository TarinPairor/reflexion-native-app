import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MOCK_SESSIONS, MOCK_ELDERLY } from '../../src/data/mockData';
import StatusBadge from '../../src/components/StatusBadge';

export default function SessionReplayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = MOCK_SESSIONS.find(s => s.id === id);
  const [showTranscript, setShowTranscript] = useState(true);

  if (!session) return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.notFound}>Session not found.</Text>
    </SafeAreaView>
  );

  const profile = MOCK_ELDERLY.find(e => e.id === session.elderlyId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Session meta */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaName}>{profile?.nickname ?? 'Unknown'}</Text>
            <StatusBadge status={session.status} label={session.status === 'green' ? 'Normal' : session.status === 'yellow' ? 'Quieter' : 'Missed'} />
          </View>
          <Text style={styles.metaDate}>{session.date} · {session.time}</Text>
          <View style={styles.statsRow}>
            <StatChip icon="⏱" label="Duration" value={`${Math.floor(session.duration / 60)}m ${session.duration % 60}s`} />
            <StatChip icon="💬" label="Words" value={String(session.wordCount)} />
            <StatChip icon="🔄" label="Exchanges" value={String(session.exchanges)} />
            <StatChip icon="⏳" label="Avg latency" value={`${session.responseLatency.toFixed(1)}s`} />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Summary</Text>
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

        {/* Audio Playback (boilerplate) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Audio Recording</Text>
          <TouchableOpacity style={styles.playBtn} onPress={() => Alert.alert('Audio', 'Audio playback requires native audio module integration. (Boilerplate)')}>
            <Text style={styles.playBtnText}>▶  Play recording</Text>
          </TouchableOpacity>
          <Text style={styles.audioNote}>Only your loved one's voice is recorded — Aria's responses are excluded.</Text>
        </View>

        {/* Transcript toggle */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.transcriptHeader} onPress={() => setShowTranscript(v => !v)}>
            <Text style={styles.cardTitle}>Full Transcript</Text>
            <Text style={styles.toggle}>{showTranscript ? '▲ Hide' : '▼ Show'}</Text>
          </TouchableOpacity>
          {showTranscript && session.transcript.length > 0 && (
            <View style={styles.transcript}>
              {session.transcript.map((line, i) => (
                <View key={i} style={[styles.line, line.speaker === 'Aria' ? styles.lineAria : styles.lineUser]}>
                  <Text style={styles.lineLabel}>{line.speaker === 'Aria' ? '🤖 Aria' : '👤 ' + profile?.nickname}</Text>
                  <Text style={styles.lineText}>{line.text}</Text>
                  <Text style={styles.lineTime}>{formatSeconds(line.timestamp)}</Text>
                </View>
              ))}
            </View>
          )}
          {showTranscript && session.transcript.length === 0 && (
            <Text style={styles.emptyTranscript}>No transcript available for this session.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  notFound: { padding: 30, textAlign: 'center', color: '#888', fontSize: 16 },
  content: { padding: 20, paddingBottom: 48 },
  metaCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  metaName: { fontSize: 20, fontWeight: '800', color: '#1A1A2E' },
  metaDate: { fontSize: 13, color: '#888', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: { flex: 1, backgroundColor: '#F7F9FC', borderRadius: 12, padding: 10, alignItems: 'center' },
  statIcon: { fontSize: 16, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  statLabel: { fontSize: 11, color: '#888' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  summaryText: { fontSize: 15, color: '#333', lineHeight: 22 },
  topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  topicChip: { backgroundColor: '#EEF6FC', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  topicText: { fontSize: 13, color: '#1A6FA8', fontWeight: '600' },
  playBtn: { backgroundColor: '#1A6FA8', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  playBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  audioNote: { fontSize: 12, color: '#999', textAlign: 'center' },
  transcriptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  toggle: { fontSize: 13, color: '#1A6FA8', fontWeight: '600' },
  transcript: { gap: 12, marginTop: 8 },
  line: { borderRadius: 12, padding: 12 },
  lineAria: { backgroundColor: '#F0F4FF', borderLeftWidth: 3, borderLeftColor: '#1A6FA8' },
  lineUser: { backgroundColor: '#F0FFF8', borderLeftWidth: 3, borderLeftColor: '#2ECC71' },
  lineLabel: { fontSize: 11, fontWeight: '700', color: '#888', marginBottom: 4 },
  lineText: { fontSize: 14, color: '#333', lineHeight: 20 },
  lineTime: { fontSize: 11, color: '#BBB', marginTop: 4, textAlign: 'right' },
  emptyTranscript: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
});
