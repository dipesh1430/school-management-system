import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface Subject {
  _id: string;
  name: string;
  code?: string;
  stage: string;
  category: string;
}

export const useSubjects = (stage?: string) => {
  return useQuery({
    queryKey: ['subjects', stage],
    queryFn: async () => {
      const url = stage ? `/subjects?stage=${stage}` : '/subjects';
      const { data } = await api.get<Subject[]>(url);
      return data;
    }
  });
};
