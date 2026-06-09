import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Status } from '../data/mockData';

const COLORS: Record<Status, { bg: string; text: string; dot: string }> = {
  green:  { bg: '#E6F9F0', text: '#1A7A4A', dot: '#2ECC71' },
  yellow: { bg: '#FFF8E1', text: '#B8860B', dot: '#F1C40F' },
  red:    { bg: '#FDECEA', text: '#C0392B', dot: '#E74C3C' },
};

const DOT: Record<Status, string> = { green: '🟢', yellow: '🟡', red: '🔴' };

interface Props {
  status: Status;
  label: string;
  large?: boolean;
}

export default function StatusBadge({ status, label, large }: Props) {
  const c = COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, large && styles.large]}>
      <Text style={large ? styles.dotLarge : styles.dot}>{DOT[status]}</Text>
      <Text style={[styles.label, { color: c.text }, large && styles.labelLarge]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  dot: { fontSize: 12 },
  dotLarge: { fontSize: 18 },
  label: { fontSize: 13, fontWeight: '600' },
  labelLarge: { fontSize: 16, fontWeight: '700' },
});
