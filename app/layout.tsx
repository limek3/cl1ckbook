import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Script from 'next/script';
import { Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});
import { Providers } from '@/components/app/providers';
import { buildAppearancePreferenceScript } from '@/lib/appearance';
import { TelegramMiniAppViewport } from '@/components/system/telegram-miniapp-viewport';

export const metadata: Metadata = {
  title: 'КликБук — платформа для записи клиентов',
  description: 'Профиль мастера, страница записи, чаты и аналитика в одной платформе КликБук.',
  generator: 'КликБук',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f2' },
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
  ],
};

const shellPreferenceScript = `
  try {
    const collapsed = window.localStorage.getItem('clickbook-sidebar-premium-v15');
    document.documentElement.dataset.slotySidebar = collapsed === 'true' ? 'collapsed' : 'expanded';
  } catch (error) {
    document.documentElement.dataset.slotySidebar = 'expanded';
  }
`;

const appearancePreferenceScript = buildAppearancePreferenceScript();

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={cormorant.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Script id="sloty-appearance-preferences" strategy="beforeInteractive">
          {appearancePreferenceScript}
        </Script>
        <Script id="sloty-shell-preferences" strategy="beforeInteractive">
          {shellPreferenceScript}
        </Script>
        <Script
          id="telegram-miniapp-sdk"
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
        <TelegramMiniAppViewport />
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
