'use client';

import { useApp } from '@/lib/app-context';
import {
  adaptMaster, adaptServices, adaptAppointments, adaptClients,
  adaptRevenueWeek, ADAPTED_THREADS, ADAPTED_MESSAGES,
} from '@/lib/mini-adapter';
import type {
  MasterInfo, Service, Appointment, Client, Thread, Message,
} from '@/lib/mini-demo';

interface MiniData {
  MASTER: MasterInfo;
  SERVICES: Service[];
  APPOINTMENTS: Appointment[];
  CLIENTS: Client[];
  THREADS: Thread[];
  MESSAGES: Message[];
  REVENUE_WEEK: { d: string; v: number; active: boolean }[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Главный хук мини-аппа: возвращает данные в формате компонентов.
 * Внутри использует ваш AppContext (useApp) — никаких дублирующих fetch.
 */
export function useMiniData(): MiniData {
  const app = useApp();

  return {
    MASTER: adaptMaster(app.ownedProfile),
    SERVICES: adaptServices(app.ownedProfile),
    APPOINTMENTS: adaptAppointments(app.bookings),
    CLIENTS: adaptClients(app.bookings),
    THREADS: ADAPTED_THREADS,
    MESSAGES: ADAPTED_MESSAGES,
    REVENUE_WEEK: adaptRevenueWeek(app.bookings),
    isLoading: !app.hasHydrated,
    refresh: app.refreshWorkspace,
  };
}
