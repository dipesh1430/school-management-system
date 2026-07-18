import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useChatContacts = () => {
  return useQuery({
    queryKey: ['chat', 'contacts'],
    queryFn: async () => {
      const response = await api.get('/chat/contacts');
      return response.data;
    }
  });
};

export const useChatMessages = (contactId?: string) => {
  return useQuery({
    queryKey: ['chat', 'messages', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const response = await api.get(`/chat/${contactId}`);
      return response.data;
    },
    enabled: !!contactId,
    refetchInterval: 5000 // Poll every 5 seconds for new messages
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ receiverId, message }: { receiverId: string, message: string }) => {
      const response = await api.post('/chat', { receiverId, message });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'contacts'] });
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });
};
