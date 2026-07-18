import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface NoticeDocument {
  _id: string;
  title: string;
  body: string;
  audience: string;
  createdAt: string;
  createdBy: string;
}

export interface EventDocument {
  _id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  description: string;
}

export const useNotices = () => {
  return useQuery<NoticeDocument[]>({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data } = await api.get('/communication/notices');
      return data;
    },
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<NoticeDocument>) => {
      const { data } = await api.post('/communication/notices', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

export const useEvents = () => {
  return useQuery<EventDocument[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get('/communication/events');
      return data;
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<EventDocument>) => {
      const { data } = await api.post('/communication/events', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/communication/notices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/communication/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
