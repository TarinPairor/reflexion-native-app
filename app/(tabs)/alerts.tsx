import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_ALERTS } from '../../src/data/mockData';
import type { Alert as AlertItem } from '../../src/data/mockData';

const TYPE_ICON: Record<string, string> = {
  missed_routine: '⏰',
  reduced_engagement: '📉',
  no_interaction: '🔴',
  speech_change: '⚠️',
  positive: '😊',
};

const TYPE_COLOR: Record<string, string> = {
  missed_routine: '#E67E22',
  reduced_engagement: '#F39C12',
  no_interaction: '#E74C3C',
  speech_change: '#8E44AD',
  positive: '#27AE60',
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
    Alert.alert('Call ' + a.elderlyName, 'In the real app this would dial their phone number.', [{ text: 'OK' }]);
  }

  function handleNote(a: AlertItem) {
    markRead(a.id);
    Alert.alert('Flag for GP', 'In the real app this would open a note-to-GP flow.', [{ text: 'OK' }]);
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
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyText}>No alerts — all is well!</Text>
          </View>
        )}

        {alerts.map(a => (
          <TouchableOpacity
            key={a.id}
            style={[styles.card, !a.read && styles.cardUnread]}
            onPress={() => markRead(a.id)}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <View style={[styles.iconCircle, { backgroundColor: TYPE_COLOR[a.type] + '20' }]}>
                <Text style={styles.cardIcon}>{TYPE_ICON[a.type]}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{a.title}</Text>
                  {!a.read && <View style={styles.dot} />}
                </View>
                <Text style={styles.cardName}>{a.elderlyName}</Text>
                <Text style={styles.cardMessage}>{a.message}</Text>
                <Text style={styles.cardTime}>{formatTime(a.timestamp)}</Text>
              </View>
            </View>

            {a.action !== 'none' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleCall(a)}>
                  <Text style={styles.actionBtnText}>📞 Call now</Text>
                </TouchableOpacity>
                {a.action === 'note' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={() => handleNote(a)}>
                    <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>👨‍⚕️ Flag for GP</Text>
                  </TouchableOpacity>
                )}
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
  return d.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A2E' },
  badge: { backgroundColor: '#E74C3C', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#888' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#1A6FA8' },
  cardTop: { flexDirection: 'row', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardIcon: { fontSize: 20 },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A6FA8' },
  cardName: { fontSize: 12, color: '#888', marginBottom: 4 },
  cardMessage: { fontSize: 14, color: '#444', lineHeight: 20 },
  cardTime: { fontSize: 12, color: '#AAA', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: {
    flex: 1, backgroundColor: '#1A6FA8', borderRadius: 10, paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnSecondary: { backgroundColor: '#EEF6FC', borderWidth: 1, borderColor: '#1A6FA8' },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  actionBtnTextSecondary: { color: '#1A6FA8' },
});
