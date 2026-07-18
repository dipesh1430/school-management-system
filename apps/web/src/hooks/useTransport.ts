import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useTransportRoutes = () => {
  return useQuery({
    queryKey: ['transportRoutes'],
    queryFn: async () => {
      const response = await api.get('/transport');
      return response.data;
    }
  });
};

export const useCreateTransportRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/transport', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Route created successfully');
      queryClient.invalidateQueries({ queryKey: ['transportRoutes'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create route');
    }
  });
};

export const useAssignStudentToRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await api.post(`/transport/${id}/assign`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Student assigned to route');
      queryClient.invalidateQueries({ queryKey: ['transportRoutes'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign student');
    }
  });
};

export const useRemoveStudentFromRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await api.post(`/transport/${id}/remove`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Student removed from route');
      queryClient.invalidateQueries({ queryKey: ['transportRoutes'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove student');
    }
  });
};
