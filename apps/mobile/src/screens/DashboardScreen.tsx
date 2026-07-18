import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { Calendar, Bell, Clock } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.subGreeting}>Welcome back to your dashboard</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
              <Calendar color="#22c55e" size={24} />
            </View>
            <Text style={styles.statValue}>Present</Text>
            <Text style={styles.statLabel}>Today's Status</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
              <Bell color="#ef4444" size={24} />
            </View>
            <Text style={styles.statValue}>2 New</Text>
            <Text style={styles.statLabel}>Unread Notices</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
        <View style={styles.card}>
          <View style={styles.scheduleItem}>
            <Clock color="#94a3b8" size={20} />
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Mathematics</Text>
              <Text style={styles.scheduleTime}>09:00 AM - 09:45 AM</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.scheduleItem}>
            <Clock color="#94a3b8" size={20} />
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Science</Text>
              <Text style={styles.scheduleTime}>10:00 AM - 10:45 AM</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#4f46e5',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subGreeting: { fontSize: 16, color: '#e0e7ff' },
  content: { flex: 1, padding: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 16, marginLeft: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 40,
  },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  scheduleInfo: { marginLeft: 16 },
  scheduleTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  scheduleTime: { fontSize: 14, color: '#64748b', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },
});
