
'use client';

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { getDashboardDemoStorageKey, isDashboardDemoEnabled } from '@/lib/dashboard-demo';

function stableStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function readDemoValue<T>(storageKey: string, fallbackValue: T) {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as T) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function useWorkspaceSection<T>(
  key: string,
  fallbackValue: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const { hasHydrated, ownedProfile, workspaceData, updateWorkspaceSection } = useApp();
  const searchParams = useSearchParams();
  const demoMode = isDashboardDemoEnabled(searchParams);
  const demoStorageKey = useMemo(() => getDashboardDemoStorageKey(`section:${key}`), [key]);

  const remoteValue = useMemo(
    () => (demoMode ? fallbackValue : ((workspaceData[key] as T | undefined) ?? fallbackValue)),
    [demoMode, fallbackValue, key, workspaceData],
  );

  const [state, setState] = useState<T>(() => (demoMode ? readDemoValue(demoStorageKey, fallbackValue) : remoteValue));
  const lastRemoteRef = useRef(stableStringify(remoteValue));
  const initialSeededRef = useRef(false);

  useEffect(() => {
    if (demoMode) {
      const next = readDemoValue(demoStorageKey, fallbackValue);
      lastRemoteRef.current = stableStringify(next);
      setState(next);
      return;
    }

    const serialized = stableStringify(remoteValue);
    if (serialized === lastRemoteRef.current && stableStringify(state) === serialized) return;
    lastRemoteRef.current = serialized;
    setState(remoteValue);
  }, [demoMode, demoStorageKey, fallbackValue, remoteValue]);

  useEffect(() => {
    if (demoMode || !hasHydrated || !ownedProfile || initialSeededRef.current) return;
    const hasRemote = key in workspaceData;
    if (hasRemote) return;
    initialSeededRef.current = true;
    void updateWorkspaceSection(key, fallbackValue);
  }, [demoMode, fallbackValue, hasHydrated, key, ownedProfile, updateWorkspaceSection, workspaceData]);

  useEffect(() => {
    if (!hasHydrated) return;

    const serialized = stableStringify(state);

    if (demoMode) {
      try {
        window.localStorage.setItem(demoStorageKey, serialized);
      } catch {}
      lastRemoteRef.current = serialized;
      return;
    }

    if (!ownedProfile || serialized === lastRemoteRef.current) return;

    const timeout = window.setTimeout(() => {
      lastRemoteRef.current = serialized;
      void updateWorkspaceSection(key, state);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [demoMode, demoStorageKey, hasHydrated, key, ownedProfile, state, updateWorkspaceSection]);

  return [state, setState, hasHydrated];
}
