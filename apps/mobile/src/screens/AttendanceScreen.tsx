import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Calendar, UserCheck, UserX } from 'lucide-react-native';

const fetchAttendance = async (classId: string, sectionId: string, dateStr: string) => {
  const { data } = await api.get(`/attendance?classId=${classId}&sectionId=${sectionId}&date=${dateStr}`);
  return data;
};

export default function AttendanceScreen() {
  const { user, profile } = useAuthStore();
  const [date] = useState(new Date().toISOString().split('T')[0]); // Today's date

  const classId = profile?.classId?._id;
  const sectionId = profile?.sectionId?._id;

  const { data: attendanceData, isLoading, error } = useQuery({
    queryKey: ['attendance', classId, sectionId, date],
    queryFn: () => fetchAttendance(classId!, sectionId!, date),
    enabled: !!classId && !!sectionId && user?.role === 'student',
    retry: false,
  });

  const record = attendanceData?.records?.[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.dateCard}>
          <Calendar color="#4f46e5" size={24} style={{ marginRight: 12 }} />
          <View>
            <Text style={styles.dateLabel}>Today's Date</Text>
            <Text style={styles.dateValue}>{new Date().toDateString()}</Text>
          </View>
        </View>

        {user?.role !== 'student' ? (
           <View style={styles.emptyState}>
             <Text style={styles.emptyStateTitle}>Student Only</Text>
             <Text style={styles.emptyStateText}>Log in as a student to view attendance.</Text>
           </View>
        ) : isLoading ? (
           <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
        ) : error ? (
           <View style={styles.emptyState}>
             <Text style={styles.emptyStateTitle}>Not Marked Yet</Text>
             <Text style={styles.emptyStateText}>The teacher hasn't marked today's attendance yet.</Text>
           </View>
        ) : record ? (
          <View style={styles.statusCard}>
            {record.status === 'Present' ? (
              <>
                <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
                  <UserCheck color="#16a34a" size={48} />
                </View>
                <Text style={styles.statusTitle}>You are Present!</Text>
                <Text style={styles.statusDesc}>Your attendance for today has been successfully recorded.</Text>
              </>
            ) : (
              <>
                <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
                  <UserX color="#ef4444" size={48} />
                </View>
                <Text style={styles.statusTitle}>You are Absent</Text>
                <Text style={styles.statusDesc}>You have been marked absent for today.</Text>
              </>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
             <Text style={styles.emptyStateTitle}>No Record</Text>
             <Text style={styles.emptyStateText}>No specific record found for you today.</Text>
           </View>
        )}
      </View>
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
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: 24 },
  dateCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dateLabel: { fontSize: 13, color: '#64748b' },
  dateValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 2 },
  statusCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  statusDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 20 },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#334155', marginTop: 16 },
  emptyStateText: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 8 },
});
