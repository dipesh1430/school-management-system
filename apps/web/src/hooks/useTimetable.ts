import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface Period {
  _id?: string;
  periodNumber: number;
  subject: string;
  teacherId: string | any;
  startTime: string;
  endTime: string;
}

export interface TimetableData {
  _id?: string;
  classId: string;
  sectionId: string;
  dayOfWeek: string;
  periods: Period[];
}

export interface LunchMenuData {
  _id?: string;
  classId: string;
  sectionId: string;
  dayOfWeek: string;
  foodItems: string[];
  rules: string;
}

export interface SubstitutionData {
  _id?: string;
  date: string;
  classId: string;
  sectionId: string;
  periodNumber: number;
  originalTeacherId?: string | any;
  substituteTeacherId: string | any;
}

export interface TimetableStatusData {
  _id?: string;
  schoolId?: string;
  classId: string;
  sectionId: string;
  status: 'draft' | 'pending_approval' | 'published' | 'rejected';
  remarks?: string;
}

export const useTimetables = (classId: string | null, sectionId: string | null) => {
  return useQuery({
    queryKey: ['timetables', classId, sectionId],
    queryFn: async () => {
      if (!classId || !sectionId) return [];
      const response = await api.get(`/timetables/${classId}/${sectionId}`);
      return response.data as TimetableData[];
    },
    enabled: !!classId && !!sectionId,
  });
};

export const useSaveTimetable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<TimetableData>) => {
      const response = await api.post('/timetables', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetables', variables.classId, variables.sectionId] });
    },
  });
};

export const useLunchMenus = (classId: string | null, sectionId: string | null) => {
  return useQuery({
    queryKey: ['lunchMenus', classId, sectionId],
    queryFn: async () => {
      if (!classId || !sectionId) return [];
      const response = await api.get(`/timetables/lunch/${classId}/${sectionId}`);
      return response.data as LunchMenuData[];
    },
    enabled: !!classId && !!sectionId,
  });
};

export const useSaveLunchMenu = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<LunchMenuData>) => {
      const response = await api.post('/timetables/lunch', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lunchMenus', variables.classId, variables.sectionId] });
    },
  });
};

export const generateTimetableDraft = async (data: { classId: string, sectionId: string, shift: string }) => {
  const res = await api.post('/timetables/generate', data);
  return res.data;
};

export const checkJobStatus = async (jobId: string) => {
  const res = await api.get(`/timetables/status/${jobId}`);
  return res.data;
};

export const getDraft = async (draftId: string) => {
  const res = await api.get(`/timetables/draft/${draftId}`);
  return res.data;
};

export const useSubstitutions = (date: string, classId: string | null, sectionId: string | null) => {
  return useQuery({
    queryKey: ['substitutions', date, classId, sectionId],
    queryFn: async () => {
      if (!date || !classId || !sectionId) return [];
      const response = await api.get(`/timetables/substitutions/daily?date=${date}&classId=${classId}&sectionId=${sectionId}`);
      return response.data as SubstitutionData[];
    },
    enabled: !!date && !!classId && !!sectionId,
  });
};

export const useSaveSubstitution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<SubstitutionData>) => {
      const response = await api.post('/timetables/substitutions/daily', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['substitutions', variables.date, variables.classId, variables.sectionId] });
    },
  });
};

export const useTimetableStatus = (classId: string | null, sectionId: string | null) => {
  return useQuery({
    queryKey: ['timetableStatus', classId, sectionId],
    queryFn: async () => {
      if (!classId || !sectionId) return null;
      const response = await api.get(`/timetables/status/master/${classId}/${sectionId}`);
      return response.data as TimetableStatusData;
    },
    enabled: !!classId && !!sectionId,
  });
};

export const useUpdateTimetableStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { classId: string, sectionId: string, status: string, remarks?: string }) => {
      const response = await api.put(`/timetables/status/master/${data.classId}/${data.sectionId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetableStatus', variables.classId, variables.sectionId] });
    },
  });
};

export const useRevokeTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { classId: string, sectionId: string }) => {
      const response = await api.delete(`/timetables/revoke/master/${data.classId}/${data.sectionId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetableStatus', variables.classId, variables.sectionId] });
      queryClient.invalidateQueries({ queryKey: ['timetables', variables.classId, variables.sectionId] });
    },
  });
};
