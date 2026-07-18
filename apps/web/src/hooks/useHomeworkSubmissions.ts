import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/v1';

export function useSubmissions(homeworkId: string | null) {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ['submissions', homeworkId],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/homework/${homeworkId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token && !!homeworkId
  });
}

export function useSubmitHomework() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fileUrl, textAnswer }: { id: string; fileUrl?: string; textAnswer?: string }) => {
      const response = await axios.post(`${API_URL}/homework/${id}/submit`, { fileUrl, textAnswer }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      toast.success('Homework submitted successfully!');
    }
  });
}

export function useGradeSubmission() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, grade, remark }: { submissionId: string; grade: string; remark: string }) => {
      const response = await axios.patch(`${API_URL}/homework/submissions/${submissionId}/grade`, { grade, remark }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Grade recorded successfully!');
    }
  });
}
