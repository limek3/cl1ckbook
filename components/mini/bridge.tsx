'use client';

import { createContext, useContext } from 'react';

// ─── Telegram WebApp helpers ───────────────────────
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function haptic(type: HapticType = 'light') {
  if (typeof window === 'undefined') return;
  const tg = (window as any).Telegram?.WebApp;
  const h = tg?.HapticFeedback;
  if (!h) return;
  try {
    if (type === 'success' || type === 'warning' || type === 'error') h.notificationOccurred(type);
    else h.impactOccurred(type);
  } catch {}
}

export function tgClose() {
  if (typeof window === 'undefined') return;
  const tg = (window as any).Telegram?.WebApp;
  try { tg?.close?.(); } catch {}
}

// ─── Mini Toast context ─────────────────────────────
export interface ToastItem { id: number; text: string; tone: 'info' | 'success' | 'error' }
export interface MiniToastCtxValue { show: (text: string, tone?: ToastItem['tone']) => void }

export const ToastCtx = createContext<MiniToastCtxValue | null>(null);

export function useMiniToast(): MiniToastCtxValue {
  return useContext(ToastCtx) ?? { show: () => {} };
}
