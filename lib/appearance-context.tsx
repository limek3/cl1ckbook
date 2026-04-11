'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useApp } from '@/lib/app-context';
import {
  APPEARANCE_STORAGE_KEY,
  applyAppearanceToElement,
  defaultAppearanceSettings,
  normalizeAppearanceSettings,
  type AppearanceSettings,
} from '@/lib/appearance';
import { getDashboardDemoStorageKey, isDashboardDemoEnabled } from '@/lib/dashboard-demo';
import { getDashboardDemoAppearance } from '@/lib/demo-data';

interface AppearanceContextValue {
  settings: AppearanceSettings;
  setSetting: <Key extends keyof AppearanceSettings>(key: Key, value: AppearanceSettings[Key]) => void;
  setSettingsBatch: (value: Partial<AppearanceSettings>) => void;
  resetSettings: () => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function applyAppearance(settings: AppearanceSettings) {
  if (typeof document === 'undefined') return;
  applyAppearanceToElement(document.documentElement, settings);
}

function readDashboardDemoFlag() {
  if (typeof window === 'undefined') return false;
  return isDashboardDemoEnabled(new URLSearchParams(window.location.search));
}

export { defaultAppearanceSettings };
export type { AppearanceSettings };

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { hasHydrated, workspaceId, workspaceData, updateWorkspaceSection } = useApp();
  const [demoMode, setDemoMode] = useState(false);
  const [settings, setSettings] = useState<AppearanceSettings>(defaultAppearanceSettings);
  const lastSavedRef = useRef<string>('');
  const syncedWorkspaceRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncDemoMode = () => {
      setDemoMode(readDashboardDemoFlag());
    };

    syncDemoMode();
    window.addEventListener('popstate', syncDemoMode);

    return () => {
      window.removeEventListener('popstate', syncDemoMode);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleQueryChange = () => {
      setDemoMode(readDashboardDemoFlag());
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushStatePatched(...args) {
      const result = originalPushState.apply(this, args);
      handleQueryChange();
      return result;
    };

    window.history.replaceState = function replaceStatePatched(...args) {
      const result = originalReplaceState.apply(this, args);
      handleQueryChange();
      return result;
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const storageKey = demoMode ? getDashboardDemoStorageKey('appearance') : APPEARANCE_STORAGE_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(storageKey);
      const fallback = demoMode ? getDashboardDemoAppearance() : defaultAppearanceSettings;
      const next = normalizeAppearanceSettings(raw ? (JSON.parse(raw) as Partial<AppearanceSettings>) : fallback);
      setSettings(next);
      applyAppearance(next);
    } catch {
      const fallback = demoMode ? getDashboardDemoAppearance() : defaultAppearanceSettings;
      setSettings(fallback);
      applyAppearance(fallback);
    }
  }, [demoMode, storageKey]);

  useEffect(() => {
    if (demoMode || !hasHydrated) return;

    const remoteSettings = normalizeAppearanceSettings(
      (workspaceData.appearance as Partial<AppearanceSettings> | null | undefined) ?? null,
    );
    if (!workspaceId) return;
    if (syncedWorkspaceRef.current === workspaceId && lastSavedRef.current) return;

    syncedWorkspaceRef.current = workspaceId;
    lastSavedRef.current = JSON.stringify(remoteSettings);
    setSettings(remoteSettings);
    applyAppearance(remoteSettings);
  }, [demoMode, hasHydrated, workspaceData.appearance, workspaceId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
    applyAppearance(settings);
  }, [settings, storageKey]);

  useEffect(() => {
    if (demoMode || !workspaceId || !hasHydrated) return;
    const serialized = JSON.stringify(settings);
    if (serialized === lastSavedRef.current) return;

    lastSavedRef.current = serialized;
    const timeout = window.setTimeout(() => {
      void updateWorkspaceSection('appearance', settings);
      void fetch('/api/appearance', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId,
          settings,
        }),
      }).catch(() => undefined);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [demoMode, hasHydrated, settings, updateWorkspaceSection, workspaceId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      const fallback = demoMode ? getDashboardDemoAppearance() : defaultAppearanceSettings;
      const next = normalizeAppearanceSettings(
        event.newValue ? (JSON.parse(event.newValue) as Partial<AppearanceSettings>) : fallback,
      );
      setSettings(next);
      applyAppearance(next);
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [demoMode, storageKey]);

  const value = useMemo<AppearanceContextValue>(
    () => ({
      settings,
      setSetting: (key, value) => {
        setSettings((current) => ({ ...current, [key]: value }));
      },
      setSettingsBatch: (value) => {
        setSettings((current) => ({ ...current, ...value }));
      },
      resetSettings: () => {
        setSettings(demoMode ? getDashboardDemoAppearance() : defaultAppearanceSettings);
      },
    }),
    [demoMode, settings],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);

  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }

  return context;
}
