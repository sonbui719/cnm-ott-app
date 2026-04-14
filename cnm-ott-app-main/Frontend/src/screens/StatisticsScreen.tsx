// src/screens/StatisticsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { C } from '../styles/colors';

export default function StatisticsScreen() {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê</Text>
        <Text style={styles.subtitle}>Tổng quan hoạt động StartupChat</Text>
      </View>

      {/* Thẻ thống kê nhanh */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="chatbubble-outline" size={28} color={C.primary} />
          <Text style={styles.statNumber}>248</Text>
          <Text style={styles.statLabel}>Tin nhắn hôm nay</Text>
        </View>

        <View style={styles.statCard}>
          <Feather name="users" size={28} color="#22C55E" />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Nhóm đang hoạt động</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={28} color="#EAB308" />
          <Text style={styles.statNumber}>87%</Text>
          <Text style={styles.statLabel}>Task hoàn thành</Text>
        </View>
      </View>

      {/* Biểu đồ giả */}
      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>Hoạt động 7 ngày qua</Text>
        <View style={styles.fakeChart}>
          <View style={styles.barContainer}>
            {[40, 65, 30, 80, 55, 90, 70].map((height, i) => (
              <View key={i} style={[styles.bar, { height }]} />
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Thống kê chi tiết</Text>
      <View style={styles.detailCard}>
        <Text style={styles.detailText}>
          • Tổng số user: <Text style={{ fontWeight: '700' }}>1,284</Text>
        </Text>
        <Text style={styles.detailText}>
          • Số task đang thực hiện: <Text style={{ fontWeight: '700' }}>43</Text>
        </Text>
        <Text style={styles.detailText}>
          • Số tin nhắn trong nhóm: <Text style={{ fontWeight: '700' }}>1,892</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: C.bg 
  },
  content: { 
    padding: 16, 
    paddingBottom: 100 
  },
  header: { 
    marginBottom: 20 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: C.text 
  },
  subtitle: { 
    fontSize: 15, 
    color: C.muted, 
    marginTop: 4 
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.panel,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  statNumber: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: C.text, 
    marginVertical: 8 
  },
  statLabel: { 
    fontSize: 13, 
    color: C.muted, 
    textAlign: 'center' 
  },

  chartBox: {
    backgroundColor: C.panel,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
  fakeChart: {
    height: 180,
    justifyContent: 'flex-end',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 160,
  },
  bar: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 8,
    minWidth: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: C.panel,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  detailText: {
    fontSize: 15,
    color: C.muted,
    marginBottom: 10,
  },
});