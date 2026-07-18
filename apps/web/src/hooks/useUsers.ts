import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface UserData {
  _id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  specialization?: string;
  teacherDetails?: {
    designation: string;
    subjects: string[];
    classes: string[];
  };
}

export const useUsers = () => {
  return useQuery<UserData[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
  });
};

export const useUserProfile = (userId: string | null) => {
  return useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/profile`);
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentData: any) => {
      const { data } = await api.post('/users/students', studentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teacherData: any) => {
      const { data } = await api.post('/users/teachers', teacherData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post('/users', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useStudentsByClass = (classId: string) => {
  return useQuery({
    queryKey: ['users', 'students', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data } = await api.get(`/users/students/class?classId=${classId}`);
      return data;
    },
    enabled: !!classId,
  });
};
