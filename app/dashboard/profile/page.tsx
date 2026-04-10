'use client';

import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { useLocale } from '@/lib/locale-context';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { MasterProfileForm } from '@/components/profile/master-profile-form';
import { PublicPageHero, DashboardHeader } from '@/components/dashboard/workspace-ui';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

export default function DashboardProfilePage() {
  const { ownedProfile, hasHydrated } = useApp();
  const { copy, locale } = useLocale();

  if (!hasHydrated) return null;

  if (!ownedProfile) {
    return (
      <WorkspaceShell>
        <div className="workspace-page workspace-page-wide space-y-5">
          <DashboardHeader
            badge={locale === 'ru' ? 'Настройки / профиль' : 'Settings / profile'}
            title={locale === 'ru' ? 'Профиль мастера' : 'Master profile'}
            description={
              locale === 'ru'
                ? 'Сначала создайте профиль мастера, чтобы открыть редактирование, страницу записи и рабочие разделы.'
                : 'The profile no longer falls back to mock data. Create the real master workspace first.'
            }
          />
          <Empty className="rounded-[34px]">
            <EmptyHeader>
              <EmptyTitle>{copy.profileEdit.emptyTitle}</EmptyTitle>
              <EmptyDescription>{copy.profileEdit.emptyDescription}</EmptyDescription>
            </EmptyHeader>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/create-profile">{copy.dashboard.createProfile}</Link>
              </Button>
            </div>
          </Empty>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-wide space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Настройки / профиль' : 'Settings / profile'}
          title={locale === 'ru' ? 'Профиль и страница мастера' : 'Profile and public page'}
          description={
            locale === 'ru'
              ? 'Редактируйте данные, сразу проверяйте карточку мастера и держите публичную страницу в готовом к записи состоянии.'
              : 'Edit the core details, validate the master card instantly, and keep the public page ready for bookings.'
          }
        />
        <div className="lg:sticky lg:top-4 lg:z-20">
          <PublicPageHero profile={ownedProfile} alignTop />
        </div>
        <MasterProfileForm
          initialProfile={ownedProfile}
          mode="edit"
          showOverviewCards={false}
          showHeader={false}
          showPreviewPanel={false}
        />
      </div>
    </WorkspaceShell>
  );
}
