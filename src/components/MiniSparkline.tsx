import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { TrendDay, Status } from '../data/mockData';

const BAR_COLOR: Record<Status, string> = {
  green: '#2ECC71',
  yellow: '#F1C40F',
  red: '#E74C3C',
};

interface Props {
  data: TrendDay[];
  days?: number;
  height?: number;
}

export default function MiniSparkline({ data, days = 7, height = 32 }: Props) {
  const slice = data.slice(-days);
  const maxDuration = Math.max(...slice.map(d => d.duration), 1);

  return (
    <View style={[styles.container, { height }]}>
      {slice.map((day, i) => {
        const barH = day.missed ? 3 : Math.max(4, (day.duration / maxDuration) * height);
        return (
          <View key={i} style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height: barH,
                  backgroundColor: day.missed ? '#EAEAEA' : BAR_COLOR[day.status],
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  barWrapper: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 2, width: '100%' },
});
