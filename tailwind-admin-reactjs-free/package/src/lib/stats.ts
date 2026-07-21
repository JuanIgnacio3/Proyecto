import { api } from './api';
import type { DashboardStats } from 'src/types/stats';

export function getDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>('/stats/dashboard');
}
