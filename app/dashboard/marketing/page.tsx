'use client';

import Link from 'next/link';
import { Copy, QrCode, Send, Share2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, PublicPageHero, SectionCard } from '@/components/dashboard/workspace-ui';
import { FakeQrCode } from '@/components/dashboard/qr-code';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';

export default function MarketingPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const isMobile = useMobile();

  if (!hasHydrated) return null;

  if (!ownedProfile || !dataset) {
    return (
      <WorkspaceShell>
        <div className="workspace-page">
          <div className="workspace-card rounded-[18px] p-8 text-center">
            <div className="text-[18px] font-semibold text-foreground">
              {locale === 'ru' ? 'Сначала настройте профиль мастера' : 'Create the master profile first'}
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link href="/create-profile">{locale === 'ru' ? 'Создать профиль' : 'Create profile'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  const publicUrl = `https://klikbuk.app/m/${ownedProfile.slug}`;

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-marketing space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Настройки / продвижение' : 'Settings / marketing'}
          title={locale === 'ru' ? 'Маркетинг и продвижение' : 'Marketing and promotion'}
          description={
            locale === 'ru'
              ? 'Ссылка, QR-код и каналы продвижения.'
              : 'Public link, QR code, client-ready materials, short copy, and click stats.'
          }
        />

        <PublicPageHero profile={ownedProfile} alignTop sticky={!isMobile} />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={locale === 'ru' ? 'Переходы за 30 дней' : 'Link visits in 30 days'} value={String(dataset.totals.visitors)} />
          <MetricCard label={locale === 'ru' ? 'Записи с ссылки' : 'Bookings from link'} value={String(dataset.totals.confirmed)} />
          <MetricCard label={locale === 'ru' ? 'Конверсия' : 'Conversion'} value={`${dataset.totals.conversion}%`} />
          <MetricCard label={locale === 'ru' ? 'Лучший источник' : 'Top source'} value={dataset.channels[0]?.label ?? '—'} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard
            title={locale === 'ru' ? 'Материалы для отправки клиенту' : 'Materials to send to clients'}
            description={
              locale === 'ru'
                ? 'Тексты для MAX, Telegram и рассылок.'
                : 'Ready-to-send copy for MAX, Telegram, bio, and referrals.'
            }
          >
            <div className="grid gap-3">
              {[
                {
                  title: locale === 'ru' ? 'Короткое описание' : 'Short profile text',
                  text: locale === 'ru'
                    ? `Запись к ${ownedProfile.name}: услуги, свободные слоты и быстрая заявка по одной ссылке.`
                    : `Book with ${ownedProfile.name}: services, available slots, and a quick request flow in one link.`,
                },
                {
                  title: locale === 'ru' ? 'Сообщение для клиента' : 'Client message',
                  text: locale === 'ru'
                    ? `Здравствуйте! Вот моя страница для записи: ${publicUrl}`
                    : `Hello! Here is my booking page: ${publicUrl}`,
                },
                {
                  title: locale === 'ru' ? 'Реферальный текст' : 'Referral copy',
                  text: locale === 'ru'
                    ? `Поделитесь моей ссылкой с подругой — сейчас открыт удобный график на ближайшие недели.`
                    : `Feel free to share my link with a friend — convenient slots are open for the coming weeks.`,
                },
              ].map((item) => (
                <div key={item.title} className="workspace-card rounded-[18px] p-4">
                  <div className="text-[14px] font-medium text-foreground">{item.title}</div>
                  <div className="mt-3 rounded-[16px] border border-border bg-accent/30 p-4 text-[13px] leading-6 text-foreground">
                    {item.text}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm">
                      <Copy className="size-4" />
                      {locale === 'ru' ? 'Копировать текст' : 'Copy text'}
                    </Button>
                    <Button type="button" size="sm">
                      <Send className="size-4" />
                      {locale === 'ru' ? 'Отправить' : 'Send'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="space-y-5">
            <SectionCard
              title={locale === 'ru' ? 'QR-код' : 'QR code'}
              description={
                locale === 'ru'
                  ? 'Для визитки, стойки и соцсетей.'
                  : 'Use it on a card, desk, or social story.'
              }
            >
              <div className="flex justify-center">
                <FakeQrCode value={publicUrl} className="w-full max-w-[260px]" />
              </div>
              <div className="mt-4 flex justify-center">
                <Button type="button" variant="outline" size="sm">
                  <QrCode className="size-4" />
                  {locale === 'ru' ? 'Скачать QR' : 'Download QR'}
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              title={locale === 'ru' ? 'Источники переходов' : 'Traffic sources'}
              description={
                locale === 'ru'
                  ? 'Переходы и заявки по каналам.'
                  : 'Where the public link performs best.'
              }
            >
              <div className="grid gap-2">
                {dataset.channels.map((channel) => (
                  <div key={channel.id} className="rounded-[14px] border border-border bg-accent/30 px-3.5 py-3">
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="text-foreground">{channel.label}</span>
                      <span className="text-muted-foreground">{channel.conversion}%</span>
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      {channel.visitors} {locale === 'ru' ? 'переходов' : 'visits'} · {channel.bookings} {locale === 'ru' ? 'записей' : 'bookings'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button type="button" variant="ghost" size="sm">
                  <Share2 className="size-4" />
                  {locale === 'ru' ? 'Поделиться ссылкой' : 'Share link'}
                </Button>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
