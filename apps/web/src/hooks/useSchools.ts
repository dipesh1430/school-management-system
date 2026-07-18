import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface SchoolData {
  _id: string;
  name: string;
  board: string;
  address: string;
  subscriptionPlan: string;
  logoUrl?: string;
  isActive: boolean;
}

export const useMySchool = () => {
  return useQuery<SchoolData>({
    queryKey: ['mySchool'],
    queryFn: async () => {
      const { data } = await api.get('/schools/me');
      return data;
    },
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schoolData: Partial<SchoolData>) => {
      const { data } = await api.patch('/schools/me', schoolData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySchool'] });
    },
  });
};
