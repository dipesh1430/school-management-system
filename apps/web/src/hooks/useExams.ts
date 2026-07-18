import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useExams = () => {
  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const response = await api.get('/exams');
      return response.data;
    }
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/exams', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Exam scheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create exam');
    }
  });
};

export const useExamResults = (examId: string) => {
  return useQuery({
    queryKey: ['examResults', examId],
    queryFn: async () => {
      if (!examId) return [];
      const response = await api.get(`/exams/${examId}/results`);
      return response.data;
    },
    enabled: !!examId,
  });
};

export const useSubmitResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, results }: { examId: string, results: any[] }) => {
      const response = await api.post(`/exams/${examId}/results`, { results });
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success('Results saved successfully');
      queryClient.invalidateQueries({ queryKey: ['examResults', variables.examId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save results');
    }
  });
};

export const useStudentReportCard = (examId: string, studentId: string) => {
  return useQuery({
    queryKey: ['reportCard', examId, studentId],
    queryFn: async () => {
      if (!examId || !studentId) return null;
      const response = await api.get(`/exams/report-card/${examId}/${studentId}`);
      return response.data;
    },
    enabled: !!examId && !!studentId,
  });
};
