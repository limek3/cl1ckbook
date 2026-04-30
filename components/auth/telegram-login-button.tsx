'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type TelegramLoginUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramLoginUser) => void;
  }
}

export function TelegramLoginButton({
  redirectTo = '/dashboard',
  className,
}: {
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [fallbackVisible, setFallbackVisible] = useState(false);

  useEffect(() => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

    if (!botUsername || !containerRef.current) {
      setFallbackVisible(true);
      return;
    }

    window.onTelegramAuth = async (telegramUser: TelegramLoginUser) => {
      setLoading(true);

      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(telegramUser),
        });

        const payload = (await response.json()) as {
          access_token?: string;
          refresh_token?: string;
          error?: string;
        };

        if (!response.ok || !payload.access_token || !payload.refresh_token) {
          throw new Error(payload.error || 'telegram_auth_failed');
        }

        const supabase = createClient();

        const { error } = await supabase.auth.setSession({
          access_token: payload.access_token,
          refresh_token: payload.refresh_token,
        });

        if (error) {
          throw error;
        }

        router.replace(redirectTo);
        router.refresh();
      } catch (error) {
        console.error(error);
        setFallbackVisible(true);
      } finally {
        setLoading(false);
      }
    };

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    containerRef.current.appendChild(script);

    const timer = window.setTimeout(() => {
      setFallbackVisible(true);
    }, 2500);

    return () => {
      window.clearTimeout(timer);

      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [redirectTo, router]);

  return (
    <div className={cn('grid gap-2', className)}>
      <div
        ref={containerRef}
        className={cn(
          'min-h-10 overflow-hidden rounded-[10px]',
          loading ? 'pointer-events-none opacity-50' : '',
        )}
      />

      {fallbackVisible ? (
        <div className="flex items-center justify-center">
          <button
            type="button"
            disabled
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3 text-[12px] font-semibold text-white/55 opacity-70"
          >
            <Send className="size-4" />
            Telegram вход загружается
          </button>
        </div>
      ) : null}
    </div>
  );
}