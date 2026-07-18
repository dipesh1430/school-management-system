import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface PasswordRequest {
  _id: string;
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

export const usePasswordRequests = () => {
  return useQuery<PasswordRequest[]>({
    queryKey: ['passwordRequests'],
    queryFn: async () => {
      const { data } = await api.get('/password/requests');
      return data;
    },
  });
};

export const useApprovePasswordRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, newPassword }: { requestId: string; newPassword: string }) => {
      const { data } = await api.post(`/password/requests/${requestId}/approve`, { newPassword });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwordRequests'] });
    },
  });
};
