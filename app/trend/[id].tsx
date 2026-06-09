import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MOCK_ELDERLY, MOCK_TRENDS, getElderlyStatus } from '../../src/data/mockData';
import type { TrendDay, Status } from '../../src/data/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BAR_COLOR: Record<Status, string> = { green: '#2ECC71', yellow: '#F1C40F', red: '#E74C3C' };

type Range = 7 | 30 | 90;

export default function TrendScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [range, setRange] = useState<Range>(30);

  const profile = MOCK_ELDERLY.find(e => e.id === id);
  const allTrend = MOCK_TRENDS[id] ?? [];
  const trend = allTrend.slice(-range);

  const maxDuration = Math.max(...trend.map(d => d.duration), 1);
  const talkedDays = trend.filter(d => !d.missed).length;
  const avgDuration = talkedDays
    ? Math.round(trend.filter(d => !d.missed).reduce((s, d) => s + d.duration, 0) / talkedDays)
    : 0;

  const summaryText = (() => {
    if (talkedDays >= range * 0.85) return `${profile?.nickname ?? 'They'} has been consistently engaged over the past ${range} days. No significant changes detected.`;
    if (talkedDays >= range * 0.6) return `${profile?.nickname ?? 'They'} has been mostly engaged with a few quieter days.`;
    return `${profile?.nickname ?? 'They'} has missed several sessions recently. Consider checking in.`;
  })();

  // Notable events
  const notable: { date: string; note: string }[] = [];
  let missStreak = 0;
  for (const d of trend) {
    if (d.missed) {
      missStreak++;
      if (missStreak === 2) notable.push({ date: d.date, note: `Missed ${missStreak} sessions in a row` });
    } else {
      if (d.status === 'yellow') notable.push({ date: d.date, note: 'Alert: reduced engagement' });
      missStreak = 0;
    }
  }

  const CHART_HEIGHT = 120;
  const barW = Math.max(3, (SCREEN_WIDTH - 40) / trend.length - 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Range Toggle */}
        <View style={styles.rangeRow}>
          {([7, 30, 90] as Range[]).map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.rangePill, range === r && styles.rangePillActive]}
              onPress={() => setRange(r)}
            >
              <Text style={[styles.rangePillText, range === r && styles.rangePillTextActive]}>
                {r === 90 ? '3 months' : `${r} days`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary sentence */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{summaryText}</Text>
          <Text style={styles.summaryStats}>
            Talked {talkedDays}/{range} days · Avg {Math.floor(avgDuration / 60)}m {avgDuration % 60}s
          </Text>
        </View>

        {/* Bar chart */}
        <View style={styles.chartCard}>
          <View style={[styles.chart, { height: CHART_HEIGHT }]}>
            {trend.map((d, i) => {
              const h = d.missed ? 3 : Math.max(6, (d.duration / maxDuration) * CHART_HEIGHT);
              return (
                <View key={i} style={[styles.barWrap, { height: CHART_HEIGHT }]}>
                  <View style={[
                    styles.bar,
                    { height: h, width: barW, backgroundColor: d.missed ? '#E0E0E0' : BAR_COLOR[d.status] },
                  ]} />
                </View>
              );
            })}
          </View>
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>{trend[0]?.date?.slice(5)}</Text>
            <Text style={styles.chartLabel}>{trend[Math.floor(trend.length / 2)]?.date?.slice(5)}</Text>
            <Text style={styles.chartLabel}>{trend[trend.length - 1]?.date?.slice(5)}</Text>
          </View>
          {/* Legend */}
          <View style={styles.legend}>
            <LegendDot color="#2ECC71" label="Normal" />
            <LegendDot color="#F1C40F" label="Quieter" />
            <LegendDot color="#E74C3C" label="Missed" />
          </View>
        </View>

        {/* Notable Events */}
        {notable.length > 0 && (
          <View style={styles.notableCard}>
            <Text style={styles.notableTitle}>Notable events</Text>
            {notable.map((n, i) => (
              <View key={i} style={styles.notableRow}>
                <Text style={styles.notableDate}>{n.date}</Text>
                <Text style={styles.notableNote}>{n.note}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.v2Note}>
          <Text style={styles.v2NoteText}>
            💡 Cognitive Stability Score (0–100 with trend arrow) coming in V2 after user validation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { padding: 20, paddingBottom: 48 },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  rangePill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0' },
  rangePillActive: { backgroundColor: '#1A6FA8' },
  rangePillText: { fontSize: 13, color: '#555', fontWeight: '600' },
  rangePillTextActive: { color: '#fff' },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  summaryText: { fontSize: 15, color: '#333', lineHeight: 22 },
  summaryStats: { fontSize: 13, color: '#888', marginTop: 8 },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 1 },
  barWrap: { justifyContent: 'flex-end' },
  bar: { borderRadius: 2 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartLabel: { fontSize: 11, color: '#AAA' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: '#666' },
  notableCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  notableTitle: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  notableRow: { flexDirection: 'row', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  notableDate: { fontSize: 13, color: '#999', width: 60 },
  notableNote: { fontSize: 13, color: '#444', flex: 1 },
  v2Note: { backgroundColor: '#EEF6FC', borderRadius: 12, padding: 14 },
  v2NoteText: { fontSize: 13, color: '#1A6FA8', lineHeight: 18 },
});
