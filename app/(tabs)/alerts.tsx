import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MOCK_ALERTS } from '../../src/data/mockData';
import type { Alert as AlertItem } from '../../src/data/mockData';

const TYPE_BORDER: Record<string, string> = {
  missed_routine:      '#B2844B',
  reduced_engagement:  '#B2844B',
  no_interaction:      '#87566A',
  speech_change:       '#87566A',
  positive:            '#66735D',
};

export default function AlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const unread = alerts.filter(a => !a.read).length;

  function markRead(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }

  function handleCall(a: AlertItem) {
    markRead(a.id);
    Alert.alert(
      `Call ${a.elderlyName}`,
      'In the real app this would dial their number.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            setTimeout(() => showFeedback(a.id), 400);
          },
        },
      ],
    );
  }

  function handleViewProfile(a: AlertItem) {
    markRead(a.id);
    router.push(`/profile/${a.elderlyId}`);
  }

  function showFeedback(id: string) {
    Alert.alert(
      'Was this alert helpful?',
      'Your feedback helps us improve Reflexion.',
      [
        { text: 'Not really', style: 'cancel' },
        { text: 'Yes, helpful', onPress: () => {} },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <Text style={styles.title}>Alerts</Text>
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread} new</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {alerts.length === 0 && (
          <View style={styles.empty}>
            <Feather name="check-circle" size={40} color="#B9AA99" />
            <Text style={styles.emptyText}>No alerts — all is well</Text>
          </View>
        )}

        {alerts.map(a => (
          <TouchableOpacity
            key={a.id}
            style={[styles.card, { borderLeftColor: TYPE_BORDER[a.type] }, !a.read && styles.cardUnread]}
            onPress={() => markRead(a.id)}
            activeOpacity={0.85}
          >
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{a.title}</Text>
              {!a.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.cardName}>{a.elderlyName}</Text>
            <Text style={styles.cardMessage}>{a.message}</Text>
            <Text style={styles.cardTime}>{formatTime(a.timestamp)}</Text>

            {a.action !== 'none' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionPrimary} onPress={() => handleCall(a)}>
                  <Feather name="phone" size={14} color="#FFFFFF" />
                  <Text style={styles.actionPrimaryText}>Call now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionSecondary} onPress={() => handleViewProfile(a)}>
                  <Text style={styles.actionSecondaryText}>View profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }) + ' · ' +
    d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3EC' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  title: { fontSize: 26, fontWeight: '500', color: '#2B2522', fontFamily: 'Georgia' },
  badge: {
    backgroundColor: '#87566A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#A69C92' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#E7DED2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },
  cardUnread: { backgroundColor: '#FFFBF8' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#2B2522', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#87566A' },
  cardName: { fontSize: 12, color: '#A69C92', marginBottom: 6 },
  cardMessage: { fontSize: 14, color: '#756C64', lineHeight: 20 },
  cardTime: { fontSize: 12, color: '#B9AA99', marginTop: 8 },

  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#87566A',
    borderRadius: 12,
    paddingVertical: 11,
  },
  actionPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  actionSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#D8CFC3',
  },
  actionSecondaryText: { color: '#2B2522', fontSize: 14, fontWeight: '600' },
});
