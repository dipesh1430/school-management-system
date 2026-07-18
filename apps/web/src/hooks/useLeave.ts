import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/v1';

export function useLeaveRequests() {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token
  });
}

export function useApplyLeave() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { fromDate: string; toDate: string; reason: string }) => {
      const response = await axios.post(`${API_URL}/leaves`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave application submitted successfully!');
    }
  });
}

export function useUpdateLeaveStatus() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'Approved' | 'Rejected' }) => {
      const response = await axios.patch(`${API_URL}/leaves/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success(`Leave request ${variables.status.toLowerCase()}!`);
    }
  });
}
