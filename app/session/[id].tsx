import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MOCK_SESSIONS, MOCK_ELDERLY } from '../../src/data/mockData';
import StatusBadge from '../../src/components/StatusBadge';

export default function SessionReplayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = MOCK_SESSIONS.find(s => s.id === id);
  const [showTranscript, setShowTranscript] = useState(true);

  if (!session) return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.notFound}>Session not found.</Text>
    </SafeAreaView>
  );

  const profile = MOCK_ELDERLY.find(e => e.id === session.elderlyId);
  const statusLabel = session.status === 'green' ? 'Doing well' : session.status === 'yellow' ? 'Worth checking' : 'Needs attention';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#2B2522" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Full session</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Session meta */}
        <View style={styles.card}>
          <View style={styles.metaRow}>
            <Text style={styles.metaName}>{profile?.nickname ?? 'Unknown'}</Text>
            <StatusBadge status={session.status} label={statusLabel} />
          </View>
          <Text style={styles.metaDate}>{session.date} · {session.time}</Text>
          <View style={styles.statsRow}>
            <StatChip icon="clock" label="Duration" value={`${Math.floor(session.duration / 60)}m ${session.duration % 60}s`} />
            <StatChip icon="message-circle" label="Words" value={String(session.wordCount)} />
            <StatChip icon="repeat" label="Exchanges" value={String(session.exchanges)} />
            <StatChip icon="zap" label="Latency" value={`${session.responseLatency.toFixed(1)}s`} />
          </View>
        </View>

        {/* Summary */}
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

        {/* Audio Playback */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Audio Recording</Text>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => Alert.alert('Audio', 'Audio playback requires native module integration.')}
          >
            <Feather name="play" size={15} color="#FFFFFF" />
            <Text style={styles.playBtnText}>Play recording</Text>
          </TouchableOpacity>
          <Text style={styles.audioNote}>Only your loved one's voice is recorded — Aria's responses are excluded.</Text>
        </View>

        {/* Transcript */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.transcriptHeader} onPress={() => setShowTranscript(v => !v)}>
            <Text style={styles.cardTitle}>Full Transcript</Text>
            <Feather name={showTranscript ? 'chevron-up' : 'chevron-down'} size={16} color="#87566A" />
          </TouchableOpacity>

          {showTranscript && session.transcript.length > 0 && (
            <View style={styles.transcript}>
              {session.transcript.map((line, i) => (
                <View key={i} style={[styles.line, line.speaker === 'Aria' ? styles.lineAria : styles.lineUser]}>
                  <Text style={styles.lineLabel}>
                    {line.speaker === 'Aria' ? 'Aria' : profile?.nickname ?? 'User'}
                  </Text>
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

function StatChip({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.statChip}>
      <Feather name={icon} size={14} color="#A69C92" />
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
  safe: { flex: 1, backgroundColor: '#F8F3EC' },
  notFound: { padding: 30, textAlign: 'center', color: '#A69C92', fontSize: 15 },

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

  content: { paddingHorizontal: 20, paddingBottom: 48 },

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
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  metaName: { fontSize: 18, fontWeight: '500', color: '#2B2522', fontFamily: 'Georgia' },
  metaDate: { fontSize: 13, color: '#A69C92', marginBottom: 16 },

  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: {
    flex: 1,
    backgroundColor: '#F8F3EC',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E7DED2',
  },
  statValue: { fontSize: 15, fontWeight: '600', color: '#2B2522' },
  statLabel: { fontSize: 10, color: '#A69C92', textAlign: 'center' },

  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A69C92',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  summaryText: { fontSize: 14, color: '#756C64', lineHeight: 21 },
  topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  topicChip: {
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E7DED2',
  },
  topicText: { fontSize: 12, color: '#756C64', fontWeight: '600' },

  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#87566A',
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 10,
  },
  playBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  audioNote: { fontSize: 12, color: '#A69C92', textAlign: 'center', lineHeight: 17 },

  transcriptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  transcript: { gap: 10, marginTop: 10 },
  line: { borderRadius: 12, padding: 12 },
  lineAria: { backgroundColor: '#F3E8ED', borderLeftWidth: 3, borderLeftColor: '#87566A' },
  lineUser: { backgroundColor: '#F4F0EA', borderLeftWidth: 3, borderLeftColor: '#B9AA99' },
  lineLabel: { fontSize: 11, fontWeight: '700', color: '#A69C92', marginBottom: 4 },
  lineText: { fontSize: 14, color: '#2B2522', lineHeight: 20 },
  lineTime: { fontSize: 11, color: '#C4B9AF', marginTop: 4, textAlign: 'right' },
  emptyTranscript: { fontSize: 14, color: '#A69C92', textAlign: 'center', paddingVertical: 16 },
});
