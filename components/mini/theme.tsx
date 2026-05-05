'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface ThemeTokens {
  bg: string;
  bgSoft: string;
  card: string;
  cardElev: string;
  cardHover: string;
  border: string;
  borderStrong: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
  warn: string;
  inputBg: string;
  cardShadow: string;
  overlayBg: string;
  sheetBg: string;
  msgIn: string;
  skeleton: string;
}

export type ThemeMode = 'dark' | 'light';

export const TOKENS: Record<ThemeMode, ThemeTokens> = {
  dark: {
    bg: '#0a0a0a',
    bgSoft: '#0f0f0f',
    card: '#111111',
    cardElev: '#141414',
    cardHover: '#181818',
    border: 'rgba(255,255,255,0.06)',
    borderStrong: 'rgba(255,255,255,0.10)',
    text: '#fafafa',
    text2: 'rgba(250,250,250,0.5)',
    text3: 'rgba(250,250,250,0.3)',
    accent: '#127dfe',
    accentSoft: 'rgba(18,125,254,0.12)',
    danger: '#ef4444',
    success: '#22c55e',
    warn: '#f59e0b',
    inputBg: '#0d0d0d',
    cardShadow: 'none',
    overlayBg: 'rgba(0,0,0,0.7)',
    sheetBg: '#111111',
    msgIn: '#1a1a1a',
    skeleton: 'rgba(255,255,255,0.04)',
  },
  light: {
    bg: '#fafaf9',
    bgSoft: '#f4f4f2',
    card: '#ffffff',
    cardElev: '#ffffff',
    cardHover: '#f8f8f6',
    border: 'rgba(10,10,10,0.06)',
    borderStrong: 'rgba(10,10,10,0.10)',
    text: '#0a0a0a',
    text2: 'rgba(10,10,10,0.5)',
    text3: 'rgba(10,10,10,0.3)',
    accent: '#127dfe',
    accentSoft: 'rgba(18,125,254,0.10)',
    danger: '#dc2626',
    success: '#16a34a',
    warn: '#d97706',
    inputBg: '#ffffff',
    cardShadow: '0 1px 2px rgba(0,0,0,0.04)',
    overlayBg: 'rgba(10,10,10,0.4)',
    sheetBg: '#ffffff',
    msgIn: '#f0efed',
    skeleton: 'rgba(0,0,0,0.04)',
  },
};

interface ThemeCtxValue {
  T: ThemeTokens;
  mode: ThemeMode;
  toggle: () => void;
  set: (m: ThemeMode) => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({
  T: TOKENS.dark,
  mode: 'dark',
  toggle: () => {},
  set: () => {},
});

export function ThemeProvider({ initialMode = 'dark', children }: { initialMode?: ThemeMode; children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const T = TOKENS[mode];
  const value = useMemo<ThemeCtxValue>(() => ({
    T, mode,
    toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    set: setMode,
  }), [mode, T]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
