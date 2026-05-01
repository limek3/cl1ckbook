'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/lib/locale-context';
import { formatBillingStatusLabel, type BillingSummary } from '@/lib/billing';

export interface BillingStatusState extends BillingSummary {
  loading: boolean;
  error: string | null;
  statusLabel: string;
}

export function useBillingStatus() {
  const { locale } = useLocale();
  const [data, setData] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/billing', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'not_found' : 'billing_fetch_failed');
        }

        const next = (await response.json()) as BillingSummary;
        if (alive) setData(next);
      } catch (caught) {
        if (alive) {
          setError(caught instanceof Error ? caught.message : 'billing_fetch_failed');
          setData(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();

    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);

    return () => {
      alive = false;
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return useMemo(() => {
    const statusLabel = data
      ? formatBillingStatusLabel(data.subscription.status, data.subscription.planId, locale)
      : locale === 'ru'
        ? 'Проверка'
        : 'Checking';

    return {
      data,
      loading,
      error,
      statusLabel,
    };
  }, [data, error, loading, locale]);
}
