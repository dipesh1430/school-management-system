import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Video, Clock, CheckCircle } from 'lucide-react-native';

const fetchPTM = async (classId: string) => {
  const { data } = await api.get(`/ptm?classId=${classId}`);
  return data;
};

const bookSlotApi = async ({ scheduleId, slotId }: { scheduleId: string, slotId: string }) => {
  const { data } = await api.post(`/ptm/${scheduleId}/slots/${slotId}/book`);
  return data;
};

export default function PTMScreen() {
  const { user, profile } = useAuthStore();
  const queryClient = useQueryClient();
  const classId = profile?.classId?._id;

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['ptm', classId],
    queryFn: () => fetchPTM(classId!),
    enabled: !!classId && user?.role === 'student',
  });

  const { mutate: bookSlot, isPending } = useMutation({
    mutationFn: bookSlotApi,
    onSuccess: () => {
      Alert.alert('Success', 'Slot booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['ptm', classId] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to book slot');
    }
  });

  const renderSchedule = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.teacherText}>{item.teacherId?.name} • {item.meetingProvider}</Text>
        </View>
        <Video color="#4f46e5" size={24} />
      </View>
      
      <Text style={styles.slotsTitle}>Available Time Slots</Text>
      <View style={styles.slotsGrid}>
        {item.slots.map((slot: any) => {
          const isMySlot = slot.parentId === user?._id;
          const isAvailable = slot.status === 'Available';
          
          return (
            <TouchableOpacity 
              key={slot._id}
              style={[
                styles.slotButton,
                isMySlot && styles.slotMine,
                !isAvailable && !isMySlot && styles.slotUnavailable
              ]}
              disabled={!isAvailable || isPending}
              onPress={() => {
                Alert.alert('Book Slot', `Do you want to book ${slot.time}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Confirm', onPress: () => bookSlot({ scheduleId: item._id, slotId: slot._id }) }
                ]);
              }}
            >
              {isMySlot ? (
                <CheckCircle color="#16a34a" size={14} style={{ marginRight: 4 }} />
              ) : (
                <Clock color={isAvailable ? '#4f46e5' : '#94a3b8'} size={14} style={{ marginRight: 4 }} />
              )}
              <Text style={[
                styles.slotText,
                isMySlot && styles.slotTextMine,
                !isAvailable && !isMySlot && styles.slotTextUnavailable
              ]}>
                {slot.time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PTM Meetings</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
      ) : schedules?.length === 0 ? (
        <View style={styles.emptyState}>
          <Video color="#cbd5e1" size={64} />
          <Text style={styles.emptyStateTitle}>No Meetings</Text>
          <Text style={styles.emptyStateText}>There are no Parent-Teacher meetings scheduled for your class right now.</Text>
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={item => item._id}
          renderItem={renderSchedule}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
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
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#334155', marginTop: 16 },
  emptyStateText: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16 },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  teacherText: { fontSize: 14, color: '#64748b', marginTop: 4 },
  slotsTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 12 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
  },
  slotMine: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#22c55e' },
  slotUnavailable: { backgroundColor: '#f1f5f9' },
  slotText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 13 },
  slotTextMine: { color: '#16a34a' },
  slotTextUnavailable: { color: '#94a3b8' },
});
