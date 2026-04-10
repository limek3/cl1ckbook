'use client';

import Link from 'next/link';
import { CreditCard, ReceiptText } from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/master-workspace';

export default function PaymentsPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();

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

  return (
    <WorkspaceShell>
      <div className="workspace-page space-y-5">
        <DashboardHeader
          badge="Billing / payments"
          title={locale === 'ru' ? 'Платежи' : 'Payments'}
          description={
            locale === 'ru'
              ? 'История оплат, статусы, способы оплаты и прозрачный биллинг внутри продукта.'
              : 'Payment history, statuses, payment methods, and transparent billing inside the product.'
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={locale === 'ru' ? 'Последний платёж' : 'Last payment'} value={formatCurrency(dataset.payments[0]?.amount ?? 0, locale)} icon={CreditCard} />
          <MetricCard label={locale === 'ru' ? 'История оплат' : 'Payment records'} value={String(dataset.payments.length)} icon={ReceiptText} />
          <MetricCard label={locale === 'ru' ? 'Активный метод' : 'Active method'} value="Visa •••• 3142" />
          <MetricCard label={locale === 'ru' ? 'Статус' : 'Status'} value={locale === 'ru' ? 'Активно' : 'Active'} />
        </div>

        <SectionCard
          title={locale === 'ru' ? 'История платежей' : 'Payment history'}
          description={
            locale === 'ru'
              ? 'Полный список начислений, возвратов и связанных планов.'
              : 'Full list of charges, refunds, and related plans.'
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{locale === 'ru' ? 'Дата' : 'Date'}</TableHead>
                <TableHead>{locale === 'ru' ? 'План' : 'Plan'}</TableHead>
                <TableHead>{locale === 'ru' ? 'Способ' : 'Method'}</TableHead>
                <TableHead>{locale === 'ru' ? 'Статус' : 'Status'}</TableHead>
                <TableHead>{locale === 'ru' ? 'Сумма' : 'Amount'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataset.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.plan}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.status}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount, locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
