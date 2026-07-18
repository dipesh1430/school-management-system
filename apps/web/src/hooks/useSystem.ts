import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface SystemLog {
  _id: string;
  action: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
}

export interface SearchResult {
  type: 'user' | 'notice' | 'class';
  id: string;
  title: string;
  subtitle: string;
}

export interface SystemHealth {
  status: string;
  metrics: {
    memory: string;
    cpu: string;
    uptime: string;
    database: string;
  };
}

export const useSystemLogs = () => {
  return useQuery<SystemLog[]>({
    queryKey: ['systemLogs'],
    queryFn: async () => {
      const { data } = await api.get('/system/logs');
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time feel
  });
};

export const useSearch = (query: string) => {
  return useQuery<SearchResult[]>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return [];
      const { data } = await api.get(`/system/search?q=${encodeURIComponent(query)}`);
      return data;
    },
    enabled: query.length > 1,
  });
};

export const useSystemHealth = () => {
  return useQuery<SystemHealth>({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const { data } = await api.get('/system/health');
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
