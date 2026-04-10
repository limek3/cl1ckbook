'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { getDashboardDemoSections, getDemoBookings, getDemoProfile, SLOTY_DEMO_SLUG } from '@/lib/demo-data';
import { isDashboardDemoEnabled } from '@/lib/dashboard-demo';
import { useLocale } from '@/lib/locale-context';
import { buildWorkspaceDatasetFromStored } from '@/lib/workspace-store';

export function useOwnedWorkspaceData() {
  const { ownedProfile, bookings, workspaceData, hasHydrated } = useApp();
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const demoMode = isDashboardDemoEnabled(searchParams);

  const resolvedProfile = useMemo(() => {
    if (!demoMode) return ownedProfile;
    return getDemoProfile(SLOTY_DEMO_SLUG);
  }, [demoMode, ownedProfile]);

  const resolvedBookings = useMemo(() => {
    if (!demoMode) return bookings;
    return getDemoBookings(SLOTY_DEMO_SLUG);
  }, [bookings, demoMode]);

  const resolvedWorkspaceData = useMemo(() => {
    if (!demoMode) return workspaceData;
    return getDashboardDemoSections(locale);
  }, [demoMode, locale, workspaceData]);

  const dataset = useMemo(() => {
    if (!resolvedProfile) return null;
    return buildWorkspaceDatasetFromStored(resolvedProfile, resolvedBookings, locale, resolvedWorkspaceData);
  }, [locale, resolvedBookings, resolvedProfile, resolvedWorkspaceData]);

  return {
    hasHydrated,
    ownedProfile: resolvedProfile,
    bookings: resolvedBookings,
    dataset,
    locale,
    workspaceData: resolvedWorkspaceData,
    demoMode,
  };
}
