
'use client';

import Link from 'next/link';
import { Heart, Search, Users2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/master-workspace';
import { useMemo, useState } from 'react';

export default function ClientsPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const [query, setQuery] = useState('');

  const clients = useMemo(() => {
    if (!dataset) return [];
    const normalized = query.trim().toLowerCase();
    return dataset.clients.filter((client) =>
      !normalized ||
      [client.name, client.phone, client.note, client.service].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [dataset, query]);

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

  const segmentBadge = (segment: string) => {
    if (segment === 'regular') return locale === 'ru' ? 'Постоянный' : 'Regular';
    if (segment === 'sleeping') return locale === 'ru' ? 'Спящий' : 'Sleeping';
    return locale === 'ru' ? 'Новый' : 'New';
  };

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-clients space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Клиенты / база' : 'Settings / clients'}
          title={locale === 'ru' ? 'Клиенты' : 'Clients'}
          description={
            locale === 'ru'
              ? 'Клиенты, визиты, заметки и средний чек.'
              : 'Client list, visit history, frequency, average check, and notes.'
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={locale === 'ru' ? 'Всего клиентов' : 'Total clients'} value={String(dataset.clients.length)} icon={Users2} />
          <MetricCard label={locale === 'ru' ? 'Постоянные' : 'Regular'} value={String(dataset.clients.filter((item) => item.segment === 'regular').length)} />
          <MetricCard label={locale === 'ru' ? 'Избранные' : 'Favorites'} value={String(dataset.clients.filter((item) => item.favorite).length)} icon={Heart} />
          <MetricCard label={locale === 'ru' ? 'Средний чек' : 'Average check'} value={formatCurrency(dataset.totals.averageCheck, locale)} />
        </div>

        <SectionCard
          title={locale === 'ru' ? 'База клиентов' : 'Client base'}
          description={
            locale === 'ru'
              ? 'Поиск по имени, телефону, услуге и заметке.'
              : 'Segments: new, regular, and sleeping. Search by name, phone, service, or note.'
          }
          actions={
            <div className="relative w-full md:w-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={locale === 'ru' ? 'Поиск клиента' : 'Search client'}
                className="w-full md:w-[220px] pl-9"
              />
            </div>
          }
        >
          <div className="grid gap-2.5 md:hidden">
            {clients.map((client) => (
              <div key={client.id} className="rounded-[16px] border border-border bg-card/94 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-foreground">{client.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{client.phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{segmentBadge(client.segment)}</Badge>
                    {client.favorite ? <Heart className="size-4 text-primary" /> : null}
                  </div>
                </div>

                <div className="mt-3 rounded-[14px] border border-border/80 bg-accent/18 px-3 py-2.5">
                  <div className="text-[11px] font-medium text-foreground">{client.service}</div>
                  <div className="mt-1 text-[10.5px] text-muted-foreground">
                    {locale === 'ru' ? 'Последний визит' : 'Last visit'}: {client.lastVisit}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-[12px] border border-border/80 bg-background/76 px-3 py-2">
                    <div className="text-[10px] text-muted-foreground">{locale === 'ru' ? 'Визиты' : 'Visits'}</div>
                    <div className="mt-1 text-[12px] font-medium text-foreground">{client.visits}</div>
                  </div>
                  <div className="rounded-[12px] border border-border/80 bg-background/76 px-3 py-2">
                    <div className="text-[10px] text-muted-foreground">{locale === 'ru' ? 'Средний чек' : 'Average check'}</div>
                    <div className="mt-1 text-[12px] font-medium text-foreground">{formatCurrency(client.averageCheck, locale)}</div>
                  </div>
                </div>

                <div className="mt-3 rounded-[12px] border border-border/80 bg-background/76 px-3 py-2">
                  <div className="text-[10px] text-muted-foreground">{locale === 'ru' ? 'Источник' : 'Source'}</div>
                  <div className="mt-1 text-[11px] font-medium text-foreground">{client.source}</div>
                  <div className="mt-2 text-[10.5px] leading-4.5 text-muted-foreground">{client.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{locale === 'ru' ? 'Клиент' : 'Client'}</TableHead>
                  <TableHead>{locale === 'ru' ? 'Сегмент' : 'Segment'}</TableHead>
                  <TableHead>{locale === 'ru' ? 'Визиты' : 'Visits'}</TableHead>
                  <TableHead>{locale === 'ru' ? 'Средний чек' : 'Average check'}</TableHead>
                  <TableHead>{locale === 'ru' ? 'Источник' : 'Source'}</TableHead>
                  <TableHead>{locale === 'ru' ? 'Заметка' : 'Note'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{client.name}</div>
                      <div className="mt-1 text-[12px] text-muted-foreground">{client.phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{segmentBadge(client.segment)}</Badge>
                        {client.favorite ? <Heart className="size-4 text-primary" /> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground">{client.visits}</div>
                      <div className="mt-1 text-[12px] text-muted-foreground">
                        {locale === 'ru' ? 'Последний визит' : 'Last visit'}: {client.lastVisit}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(client.averageCheck, locale)}</TableCell>
                    <TableCell>{client.source}</TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="line-clamp-2 text-[12px] leading-5 text-muted-foreground">{client.note}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
