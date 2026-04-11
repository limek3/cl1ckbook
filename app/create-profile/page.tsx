'use client';

import { useApp } from '@/lib/app-context';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { MasterProfileForm } from '@/components/profile/master-profile-form';
import { DashboardHeader, PublicPageHero } from '@/components/dashboard/workspace-ui';
import { useLocale } from '@/lib/locale-context';

export default function CreateProfilePage() {
  const { ownedProfile } = useApp();
  const { locale } = useLocale();

  return (
    <WorkspaceShell>
      <div className="workspace-page space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Settings / onboarding' : 'Settings / onboarding'}
          title={ownedProfile ? (locale === 'ru' ? 'Профиль мастера' : 'Master profile') : (locale === 'ru' ? 'Создание профиля мастера' : 'Create master profile')}
          description={
            locale === 'ru'
              ? 'Заполните основные данные, проверьте, как выглядит публичная страница, и откройте первый рабочий поток.'
              : 'Fill in the essentials, preview the public page, and open the first workflow.'
          }
        />
        {ownedProfile ? <PublicPageHero profile={ownedProfile} alignTop /> : null}
        <MasterProfileForm initialProfile={ownedProfile} mode={ownedProfile ? 'edit' : 'create'} showOverviewCards={!ownedProfile} />
      </div>
    </WorkspaceShell>
  );
}
