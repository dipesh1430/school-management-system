import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface ClassData {
  _id: string;
  name: string;
  stream: string | null;
  academicYear: string;
}

export const useClasses = (academicYear?: string) => {
  return useQuery<ClassData[]>({
    queryKey: ['classes', academicYear],
    queryFn: async () => {
      const params = academicYear ? { academicYear } : {};
      const { data } = await api.get('/classes', { params });
      return data;
    },
  });
};

interface SectionData {
  _id: string;
  name: string;
  classId: string;
}

export const useSections = (classId?: string) => {
  return useQuery<SectionData[]>({
    queryKey: ['sections', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data } = await api.get(`/classes/${classId}/sections`);
      return data;
    },
    enabled: !!classId,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newClass: Omit<ClassData, '_id'>) => {
      const { data } = await api.post('/classes', newClass);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};

export const useCreateSection = (classId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSection: { name: string, classTeacherId?: string }) => {
      const { data } = await api.post(`/classes/${classId}/sections`, newSection);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', classId] });
    },
  });
};
