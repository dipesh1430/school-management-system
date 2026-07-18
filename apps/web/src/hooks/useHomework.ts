import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface HomeworkDocument {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  attachments?: string[];
  classId: string;
  sectionId: string;
}

export const useHomework = (classId: string, sectionId: string) => {
  return useQuery<HomeworkDocument[]>({
    queryKey: ['homework', classId, sectionId],
    queryFn: async () => {
      const { data } = await api.get('/homework', {
        params: { classId, sectionId }
      });
      return data;
    },
    enabled: !!classId && !!sectionId,
  });
};

export const useCreateHomework = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Partial<HomeworkDocument>) => {
      const { data } = await api.post('/homework', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['homework', variables.classId, variables.sectionId]
      });
    },
  });
};
