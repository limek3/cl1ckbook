import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Script from 'next/script';
import { Golos_Text } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/app/providers';
import { buildAppearancePreferenceScript } from '@/lib/appearance';

export const metadata: Metadata = {
  title: 'КликБук — платформа для записи клиентов',
  description: 'Профиль мастера, страница записи, чаты и аналитика в одной платформе КликБук.',
  generator: 'КликБук',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6f8' },
    { media: '(prefers-color-scheme: dark)', color: '#090909' },
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

const golosText = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-golos-text',
  display: 'swap',
});

const appearancePreferenceScript = buildAppearancePreferenceScript();

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${golosText.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        <Script id="sloty-appearance-preferences" strategy="beforeInteractive">
          {appearancePreferenceScript}
        </Script>
        <Script id="sloty-shell-preferences" strategy="beforeInteractive">
          {shellPreferenceScript}
        </Script>
        <Script
          id="telegram-miniapp-sdk"
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
