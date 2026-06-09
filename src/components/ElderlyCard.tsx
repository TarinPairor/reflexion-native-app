import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ElderlyProfile, Status } from '../data/mockData';
import { getStatusLabel, getLastSeen } from '../data/mockData';

const DOT: Record<Status, string> = { green: '🟢', yellow: '🟡', red: '🔴' };
const BORDER: Record<Status, string> = { green: '#2ECC71', yellow: '#F1C40F', red: '#E74C3C' };

interface Props {
  profile: ElderlyProfile;
  status: Status;
  onPress: () => void;
}

export default function ElderlyCard({ profile, status, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: BORDER[status] }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{profile.nickname.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.dot}>{DOT[status]}</Text>
          <Text style={styles.name}>{profile.nickname}</Text>
        </View>
        <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
        <Text style={styles.lastSeen}>{getLastSeen(profile.id)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, color: '#1A6FA8', fontWeight: '700' },
  info: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { fontSize: 14 },
  name: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  statusText: { fontSize: 13, color: '#555', marginTop: 2 },
  lastSeen: { fontSize: 12, color: '#999', marginTop: 1 },
  chevron: { fontSize: 22, color: '#CCC', fontWeight: '300' },
});
