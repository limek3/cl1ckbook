'use client';

import type { ReactNode } from 'react';
import { TelegramMiniAppAutoAuth } from '@/components/auth/telegram-miniapp-auto-auth';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/lib/app-context';
import { AppearanceProvider } from '@/lib/appearance-context';
import { LocaleProvider } from '@/lib/locale-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <LocaleProvider>
        <AppProvider>
          <AppearanceProvider>
            <TelegramMiniAppAutoAuth />
            {children}
            <Toaster richColors position="bottom-right" closeButton />
          </AppearanceProvider>
        </AppProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
