import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const usePlatformAnalytics = () => {
  return useQuery({
    queryKey: ['platformAnalytics'],
    queryFn: async () => {
      const response = await api.get('/schools/analytics');
      return response.data;
    }
  });
};

export const useAllSchools = () => {
  return useQuery({
    queryKey: ['allSchools'],
    queryFn: async () => {
      const response = await api.get('/schools');
      return response.data;
    }
  });
};

export const useCreateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/schools', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allSchools'] });
      queryClient.invalidateQueries({ queryKey: ['platformAnalytics'] });
      // We don't toast a generic success here because we want to show the admin credentials in the component
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create school');
    }
  });
};

export const useUpdateSchoolStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: { isActive?: boolean, subscriptionPlan?: string } }) => {
      const response = await api.patch(`/schools/${id}/status`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('School updated successfully');
      queryClient.invalidateQueries({ queryKey: ['allSchools'] });
      queryClient.invalidateQueries({ queryKey: ['platformAnalytics'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update school');
    }
  });
};
