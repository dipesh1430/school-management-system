import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface StudentRosterItem {
  _id: string; // StudentProfile ID
  userId: {
    _id: string;
    name: string;
  };
  rollNo: string;
}

export const useStudentRoster = (classId: string, sectionId: string) => {
  return useQuery<StudentRosterItem[]>({
    queryKey: ['roster', classId, sectionId],
    queryFn: async () => {
      const { data } = await api.get('/users/students/roster', {
        params: { classId, sectionId }
      });
      return data;
    },
    enabled: !!classId && !!sectionId,
  });
};

export interface AttendanceRecord {
  studentId: string; // StudentProfile ID
  status: 'present' | 'absent' | 'late' | 'half-day';
}

export interface AttendanceDocument {
  _id: string;
  date: string;
  records: AttendanceRecord[];
}

export const useAttendanceRecord = (classId: string, sectionId: string, date: string) => {
  return useQuery<AttendanceDocument>({
    queryKey: ['attendance', classId, sectionId, date],
    queryFn: async () => {
      try {
        const { data } = await api.get('/attendance', {
          params: { classId, sectionId, date }
        });
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null; // No record exists for this date yet
        }
        throw error;
      }
    },
    enabled: !!classId && !!sectionId && !!date,
    retry: false, // Don't retry on 404
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { classId: string, sectionId: string, date: string, records: AttendanceRecord[] }) => {
      const { data } = await api.post('/attendance', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific attendance query so it refetches the fresh saved data
      queryClient.invalidateQueries({
        queryKey: ['attendance', variables.classId, variables.sectionId, variables.date]
      });
    },
  });
};
