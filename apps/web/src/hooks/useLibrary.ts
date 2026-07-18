import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useBooks = () => {
  return useQuery({
    queryKey: ['libraryBooks'],
    queryFn: async () => {
      const response = await api.get('/library');
      return response.data;
    }
  });
};

export const useAddBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/library', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Book added successfully');
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add book');
    }
  });
};

export const useIssueBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await api.post(`/library/${id}/issue`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Book issued successfully');
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to issue book');
    }
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await api.post(`/library/${id}/return`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Book returned successfully');
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to return book');
    }
  });
};
