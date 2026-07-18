import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { BookOpen, FileText, CheckCircle, Clock } from 'lucide-react-native';

const fetchHomework = async (classId: string, sectionId: string) => {
  const { data } = await api.get(`/homework?classId=${classId}&sectionId=${sectionId}`);
  return data;
};

export default function HomeworkScreen() {
  const { user, profile } = useAuthStore();

  const classId = profile?.classId?._id;
  const sectionId = profile?.sectionId?._id;

  const { data: homeworkList, isLoading, error } = useQuery({
    queryKey: ['homework', classId, sectionId],
    queryFn: () => fetchHomework(classId!, sectionId!),
    enabled: !!classId && !!sectionId && user?.role === 'student',
  });

  const renderHomework = ({ item }: { item: any }) => {
    const isSubmitted = !!item.mySubmission;
    
    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <FileText color="#4f46e5" size={20} />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          {isSubmitted ? (
            <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
              <CheckCircle color="#16a34a" size={14} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: '#16a34a' }]}>Submitted</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
              <Clock color="#ef4444" size={14} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: '#ef4444' }]}>Pending</Text>
            </View>
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.dueDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
          <Text style={styles.actionText}>{isSubmitted ? 'View Submission' : 'Submit Now'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Homework</Text>
      </View>
      
      {user?.role !== 'student' ? (
        <View style={styles.emptyState}>
          <BookOpen color="#cbd5e1" size={64} />
          <Text style={styles.emptyStateTitle}>Student Only</Text>
          <Text style={styles.emptyStateText}>Log in as a student to view assigned homework.</Text>
        </View>
      ) : !classId ? (
        <View style={styles.emptyState}>
           <Text style={styles.emptyStateTitle}>Profile Incomplete</Text>
           <Text style={styles.emptyStateText}>Please log out and log back in to sync your class data.</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: '#ef4444' }]}>Failed to load</Text>
          <Text style={styles.emptyStateText}>Could not connect to the server.</Text>
        </View>
      ) : homeworkList?.length === 0 ? (
        <View style={styles.emptyState}>
          <BookOpen color="#cbd5e1" size={64} />
          <Text style={styles.emptyStateTitle}>No Homework Yet</Text>
          <Text style={styles.emptyStateText}>You're all caught up! When teachers assign new homework, it will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={homeworkList}
          keyExtractor={item => item._id}
          renderItem={renderHomework}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#334155', marginTop: 16 },
  emptyStateText: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 8 },
  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginLeft: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#475569', marginBottom: 16, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  dueDate: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  actionText: { fontSize: 14, color: '#4f46e5', fontWeight: 'bold' }
});
