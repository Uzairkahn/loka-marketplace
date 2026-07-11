import { api } from './api';
import type { DashboardSummary } from '@/types';

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await api.get<{ success: true; summary: DashboardSummary }>(
    '/dashboard/summary'
  );
  return data.summary;
};
