'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { CheckCircle2, Copy, ExternalLink, Globe2, Link2, Share2 } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MasterAvatar } from '@/components/profile/master-avatar';
import type { MasterProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/locale-context';

export function DashboardHeader({
  badge,
  title,
  description,
  actions,
}: {
  badge?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-border pb-4">
      {badge ? <div className="chip-muted">{badge}</div> : null}
      <div className="mt-2.5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="workspace-card rounded-[16px] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="metric-label">{label}</div>
          <div className="mt-1.5 metric-value">{value}</div>
        </div>
        {Icon ? (
          <div className="flex size-9 items-center justify-center rounded-[12px] border border-border bg-accent/60 text-muted-foreground">
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>
      {hint || delta ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px]">
          {delta ? <span className="workspace-pill">{delta}</span> : null}
          {hint ? <span className="text-muted-foreground">{hint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('workspace-card rounded-[18px] p-4', className)}>
      <div className="flex flex-col gap-2.5 border-b border-border pb-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[16px] font-semibold tracking-[-0.02em] text-foreground">{title}</div>
          {description ? <p className="mt-1 text-[12.5px] leading-[1.45rem] text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

export function PublicPageHero({
  profile,
  alignTop = false,
  sticky = false,
}: {
  profile: MasterProfile;
  alignTop?: boolean;
  sticky?: boolean;
}) {
  const { locale } = useLocale();
  const [copiedState, setCopiedState] = useState<'link' | 'message' | null>(null);

  const publicUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/m/${profile.slug}`;
    return `${window.location.origin}/m/${profile.slug}`;
  }, [profile.slug]);

  const shareMessage = useMemo(() => {
    return locale === 'ru'
      ? `Здравствуйте! Вот моя ссылка для записи: ${publicUrl}\nНа странице есть услуги, свободные слоты и быстрый способ оставить заявку.`
      : `Hello! Here is my booking link: ${publicUrl}\nThe page already includes services, available slots, and a quick request flow.`;
  }, [locale, publicUrl]);

  const copyValue = async (value: string, type: 'link' | 'message') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedState(type);
      window.setTimeout(() => setCopiedState(null), 1400);
    } catch {}
  };

  const handleShare = async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return;
    try {
      await navigator.share({ title: profile.name, text: shareMessage, url: publicUrl });
    } catch {}
  };

  const labels = locale === 'ru'
    ? {
        badge: 'Публичная страница активна',
        title: 'Главная ссылка мастера',
        description: 'Сразу видно, как выглядит карточка, какая ссылка отправляется клиенту и какими действиями поделиться без лишних шагов.',
        connected: 'Подключено',
        live: 'Страница доступна для записи',
        copyLink: copiedState === 'link' ? 'Скопировано' : 'Скопировать ссылку',
        copyMessage: copiedState === 'message' ? 'Скопировано' : 'Скопировать сообщение',
        share: 'Поделиться',
        open: 'Открыть страницу',
      }
    : {
        badge: locale === 'ru' ? 'Публичная страница активна' : 'Public page is active',
        title: 'Primary master link',
        description: 'See the page card, the live URL, and the fastest sharing actions in one polished hero block.',
        connected: 'Connected',
        live: 'Ready to accept bookings',
        copyLink: copiedState === 'link' ? 'Copied' : 'Copy link',
        copyMessage: copiedState === 'message' ? 'Copied' : 'Copy message',
        share: 'Share',
        open: 'Open page',
      };

  return (
    <section
      className={cn(
        'workspace-card hero-grid accent-gradient overflow-hidden rounded-[22px] p-4 md:p-5',
        alignTop && 'mt-0',
        sticky && 'xl:sticky xl:top-4 xl:z-20',
      )}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <div className="space-y-4">
          <Badge variant="outline" className="bg-card/80 backdrop-blur">
            <CheckCircle2 className="size-3.5" />
            {labels.badge}
          </Badge>
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-foreground md:text-[34px]">{labels.title}</h2>
            <p className="mt-3 max-w-[760px] text-[14px] leading-7 text-muted-foreground">{labels.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: locale === 'ru' ? 'Статус' : 'Status', value: labels.connected },
              { label: locale === 'ru' ? 'Slug' : 'Slug', value: profile.slug },
              { label: locale === 'ru' ? 'Публичный режим' : 'Public mode', value: labels.live },
            ].map((item) => (
              <div key={item.label} className="rounded-[16px] border border-border bg-card/70 px-4 py-3 backdrop-blur">
                <div className="text-[11px] text-muted-foreground">{item.label}</div>
                <div className="mt-1 truncate text-[13px] font-medium text-foreground">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
            <div className="workspace-soft-panel flex min-h-11 items-center gap-3 px-4 py-3">
              <Link2 className="size-4 text-muted-foreground" />
              <span className="truncate text-[13px] text-foreground">{publicUrl}</span>
            </div>
            <Button type="button" variant="outline" onClick={() => copyValue(publicUrl, 'link')}>
              <Copy className="size-4" />
              {labels.copyLink}
            </Button>
            <Button type="button" variant="outline" onClick={() => copyValue(shareMessage, 'message')}>
              <Copy className="size-4" />
              {labels.copyMessage}
            </Button>
            <Button type="button" variant="ghost" onClick={handleShare}>
              <Share2 className="size-4" />
              {labels.share}
            </Button>
          </div>
        </div>

        <div className="workspace-card rounded-[22px] border border-border/80 bg-card/80 p-4 backdrop-blur">
          <div className="flex items-start gap-3">
            <MasterAvatar name={profile.name} avatar={profile.avatar} className="h-16 w-16 rounded-[18px]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-[17px] font-semibold text-foreground">{profile.name}</div>
                <Badge variant="outline">
                  <Globe2 className="size-3.5" />
                  {labels.connected}
                </Badge>
              </div>
              <div className="truncate text-[13px] text-muted-foreground">{profile.profession}</div>
              <div className="mt-1 truncate text-[12px] text-muted-foreground">{profile.city}</div>
            </div>
          </div>

          <div className="mt-4 line-clamp-3 text-[13px] leading-6 text-muted-foreground">{profile.bio}</div>

          <div className="mt-4 flex flex-wrap gap-2">
            {profile.services.slice(0, 4).map((service) => (
              <span key={service} className="chip-muted">
                {service}
              </span>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button asChild>
              <Link href={`/m/${profile.slug}`}>
                <ExternalLink className="size-4" />
                {labels.open}
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => copyValue(publicUrl, 'link')}>
              <Copy className="size-4" />
              {labels.copyLink}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
