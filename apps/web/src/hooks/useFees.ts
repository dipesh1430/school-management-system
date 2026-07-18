import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface FeeRecord {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  classId: { _id: string; name: string };
  title: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export const useFees = () => {
  return useQuery<FeeRecord[]>({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data } = await api.get('/fees');
      return data;
    },
  });
};

export const useGenerateFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { classId: string; studentId?: string; title: string; amount: number; dueDate: string }) => {
      const { data } = await api.post('/fees/generate', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
  });
};

export const usePayFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (feeId: string) => {
      const { data } = await api.patch(`/fees/${feeId}/pay`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
  });
};
