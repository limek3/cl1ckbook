import type { Metadata, Viewport } from 'next';
import { Suspense, type ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/app/providers';
import { buildAppearancePreferenceScript } from '@/lib/appearance';

export const metadata: Metadata = {
  title: 'КликБук — платформа для онлайн-записи',
  description: 'Публичная страница, онлайн-запись, чаты и аналитика в одном кабинете КликБук.',
  generator: 'КликБук',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6f8' },
    { media: '(prefers-color-scheme: dark)', color: '#020304' },
  ],
};

const shellPreferenceScript = `
  try {
    const collapsed = window.localStorage.getItem('klikbuk-shell-collapsed') ?? window.localStorage.getItem('sloty-shell-collapsed');
    document.documentElement.dataset.klikbukSidebar = collapsed === 'true' ? 'collapsed' : 'expanded';
    document.documentElement.dataset.slotySidebar = collapsed === 'true' ? 'collapsed' : 'expanded';
  } catch (error) {
    document.documentElement.dataset.klikbukSidebar = 'expanded';
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
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Script id="sloty-appearance-preferences" strategy="beforeInteractive">
          {appearancePreferenceScript}
        </Script>
        <Script id="sloty-shell-preferences" strategy="beforeInteractive">
          {shellPreferenceScript}
        </Script>
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
