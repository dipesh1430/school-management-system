import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const usePTMSchedules = (classId?: string) => {
  return useQuery({
    queryKey: ['ptm', classId],
    queryFn: async () => {
      const url = classId ? `/ptm?classId=${classId}` : '/ptm';
      const response = await api.get(url);
      return response.data;
    }
  });
};

export const useCreatePTMSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/ptm', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('PTM Schedule created successfully');
      queryClient.invalidateQueries({ queryKey: ['ptm'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create PTM schedule');
    }
  });
};
