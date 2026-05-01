'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useBrowserSearchParams } from '@/hooks/use-browser-search-params';
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

type PendingSave<T> = {
  serialized: string;
  value: T;
};

export function useWorkspaceSection<T>(
  key: string,
  fallbackValue: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const { hasHydrated, ownedProfile, workspaceData, updateWorkspaceSection } = useApp();
  const searchParams = useBrowserSearchParams();
  const demoMode = isDashboardDemoEnabled(searchParams);
  const demoStorageKey = useMemo(() => getDashboardDemoStorageKey(`section:${key}`), [key]);

  const remoteValue = useMemo(
    () => (demoMode ? fallbackValue : ((workspaceData[key] as T | undefined) ?? fallbackValue)),
    [demoMode, fallbackValue, key, workspaceData],
  );

  const [state, setState] = useState<T>(() =>
    demoMode ? readDemoValue(demoStorageKey, fallbackValue) : remoteValue,
  );

  const stateRef = useRef(state);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const pendingRef = useRef<PendingSave<T> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const lastRemoteRef = useRef(stableStringify(remoteValue));
  const lastSavedRef = useRef(stableStringify(remoteValue));

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const runSaveQueue = useCallback(async () => {
    if (savingRef.current) return;
    if (!pendingRef.current) return;

    const pending = pendingRef.current;
    pendingRef.current = null;
    savingRef.current = true;

    const success = await updateWorkspaceSection(key, pending.value);
    savingRef.current = false;

    if (success) {
      lastSavedRef.current = pending.serialized;
      lastRemoteRef.current = pending.serialized;

      if (stableStringify(stateRef.current) === pending.serialized) {
        dirtyRef.current = false;
      }
    } else {
      pendingRef.current = pending;
    }

    if (pendingRef.current) {
      window.setTimeout(() => {
        void runSaveQueue();
      }, success ? 80 : 900);
    }
  }, [key, updateWorkspaceSection]);

  useEffect(() => {
    if (demoMode) {
      const next = readDemoValue(demoStorageKey, fallbackValue);
      const serialized = stableStringify(next);
      lastRemoteRef.current = serialized;
      lastSavedRef.current = serialized;
      dirtyRef.current = false;
      setState(next);
      return;
    }

    const serialized = stableStringify(remoteValue);

    // Never overwrite local edits with an older API snapshot while a save is pending.
    // This was the reason selected slots seemed to jump/change by themselves.
    if (dirtyRef.current) return;
    if (serialized === lastRemoteRef.current && stableStringify(stateRef.current) === serialized) return;

    lastRemoteRef.current = serialized;
    lastSavedRef.current = serialized;
    setState(remoteValue);
  }, [demoMode, demoStorageKey, fallbackValue, remoteValue]);

  useEffect(() => {
    if (!hasHydrated) return;

    const serialized = stableStringify(state);

    if (demoMode) {
      try {
        window.localStorage.setItem(demoStorageKey, serialized);
      } catch {}
      lastRemoteRef.current = serialized;
      lastSavedRef.current = serialized;
      dirtyRef.current = false;
      return;
    }

    if (!ownedProfile || serialized === lastSavedRef.current) return;

    dirtyRef.current = true;
    pendingRef.current = { serialized, value: state };

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    // Debounce quick hour toggles into one save, but do not cancel the timer on
    // unmount/navigation. The timer is stored outside the effect cleanup on purpose
    // so a quick jump to the public page still persists the last selected slots.
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      void runSaveQueue();
    }, 280);
  }, [demoMode, demoStorageKey, hasHydrated, ownedProfile, runSaveQueue, state]);

  return [state, setState, hasHydrated];
}
