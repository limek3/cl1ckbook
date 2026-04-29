// app/dashboard/profile/page.tsx
'use client';

import Link from 'next/link';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTheme } from 'next-themes';
import {
  Check,
  Copy,
  Globe2,
  Link2,
  Sparkles,
  SquarePen,
} from 'lucide-react';

import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { MasterProfileForm } from '@/components/profile/master-profile-form';
import { MasterAvatar } from '@/components/profile/master-avatar';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { SLOTY_DEMO_SLUG } from '@/lib/demo-data';
import { useAppearance } from '@/lib/appearance-context';
import { accentPalette } from '@/lib/appearance-palette';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';

function pageBg(light: boolean) {
  return light ? 'bg-[#f4f4f2]' : 'bg-[#090909]';
}

function pageText(light: boolean) {
  return light ? 'text-[#0e0e0e]' : 'text-white';
}

function mutedText(light: boolean) {
  return light ? 'text-black/48' : 'text-white/42';
}

function faintText(light: boolean) {
  return light ? 'text-black/32' : 'text-white/26';
}

function borderTone(light: boolean) {
  return light ? 'border-black/[0.08]' : 'border-white/[0.08]';
}

function divideTone(light: boolean) {
  return light ? 'divide-black/[0.08]' : 'divide-white/[0.08]';
}

function cardTone(light: boolean) {
  return light
    ? 'border-black/[0.08] bg-[#fbfbfa]'
    : 'border-white/[0.08] bg-[#101010]';
}

function fieldTone(light: boolean) {
  return light
    ? 'border-black/[0.08] bg-white'
    : 'border-white/[0.08] bg-white/[0.04]';
}

function insetTone(light: boolean) {
  return light
    ? 'border-black/[0.07] bg-black/[0.025]'
    : 'border-white/[0.07] bg-white/[0.035]';
}

function buttonBase(light: boolean, active = false) {
  return cn(
    'inline-flex h-8 items-center justify-center gap-2 rounded-[9px] border px-3 text-[12px] font-medium shadow-none transition-[background,border-color,color,opacity,transform] duration-150 active:scale-[0.985]',
    active
      ? light
        ? 'cb-neutral-primary cb-neutral-primary-light hover:opacity-[0.98]'
        : 'cb-neutral-primary cb-neutral-primary-dark hover:opacity-[0.98]'
      : light
        ? 'border-black/[0.08] bg-white text-black/58 hover:border-black/[0.14] hover:bg-black/[0.035] hover:text-black'
        : 'border-white/[0.08] bg-white/[0.04] text-white/55 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white',
  );
}

function disabledButtonClass() {
  return 'disabled:pointer-events-none disabled:opacity-40';
}

function accentPillStyle(
  color: string,
  light: boolean,
  strength: 'soft' | 'strong' = 'strong',
): CSSProperties {
  const bgAmount = strength === 'strong' ? (light ? 18 : 34) : light ? 10 : 22;
  const borderAmount = strength === 'strong' ? (light ? 34 : 48) : light ? 22 : 34;

  return {
    background: light
      ? `color-mix(in srgb, ${color} ${bgAmount}%, #ffffff)`
      : `color-mix(in srgb, ${color} ${bgAmount}%, #141414)`,
    borderColor: light
      ? `color-mix(in srgb, ${color} ${borderAmount}%, rgba(0,0,0,0.1))`
      : `color-mix(in srgb, ${color} ${borderAmount}%, rgba(255,255,255,0.1))`,
    color: light
      ? `color-mix(in srgb, ${color} 70%, #101010)`
      : `color-mix(in srgb, ${color} 18%, #ffffff)`,
    boxShadow:
      strength === 'strong'
        ? light
          ? `0 0 0 1px color-mix(in srgb, ${color} 10%, transparent)`
          : `0 0 0 1px color-mix(in srgb, ${color} 14%, transparent)`
        : undefined,
  };
}

function Card({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <section className={cn('overflow-hidden rounded-[11px] border', cardTone(light), className)}>
      {children}
    </section>
  );
}

function Panel({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[10px] border', insetTone(light), className)}>
      {children}
    </div>
  );
}

function CardTitle({
  title,
  description,
  light,
  right,
}: {
  title: string;
  description?: string;
  light: boolean;
  right?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[58px] items-center justify-between gap-4 border-b px-4 py-3',
        borderTone(light),
      )}
    >
      <div className="min-w-0">
        <h2
          className={cn(
            'truncate text-[13px] font-semibold tracking-[-0.018em]',
            pageText(light),
          )}
        >
          {title}
        </h2>

        {description ? (
          <p className={cn('mt-1 truncate text-[11px]', mutedText(light))}>
            {description}
          </p>
        ) : null}
      </div>

      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function MicroLabel({
  children,
  light,
  active,
  accentColor,
  className,
}: {
  children: ReactNode;
  light: boolean;
  active?: boolean;
  accentColor?: string;
  className?: string;
}) {
  return (
    <span
      style={active && accentColor ? accentPillStyle(accentColor, light, 'soft') : undefined}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-[9px] border px-2.5 text-[10.5px] font-medium',
        active && !accentColor
          ? light
            ? 'border-black/[0.1] bg-black/[0.045] text-black/62'
            : 'border-white/[0.11] bg-white/[0.075] text-white/68'
          : !active
            ? light
              ? 'border-black/[0.08] bg-white text-black/50'
              : 'border-white/[0.08] bg-white/[0.04] text-white/42'
            : '',
        className,
      )}
    >
      {children}
    </span>
  );
}

function StatusDot({
  light,
  active,
  accentColor,
}: {
  light: boolean;
  active?: boolean;
  accentColor?: string;
}) {
  return (
    <span
      style={active && accentColor ? { background: accentColor } : undefined}
      className={cn(
        'size-1.5 shrink-0 rounded-full',
        !(active && accentColor) &&
          (active ? 'bg-current' : light ? 'bg-black/24' : 'bg-white/22'),
      )}
    />
  );
}

function ActionButton({
  children,
  light,
  active,
  disabled,
  onClick,
  className,
}: {
  children: ReactNode;
  light: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(buttonBase(light, active), disabledButtonClass(), className)}
    >
      {children}
    </button>
  );
}

function ActionLink({
  href,
  children,
  light,
  active,
  className,
}: {
  href: string;
  children: ReactNode;
  light: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(buttonBase(light, active), className)}>
      {children}
    </Link>
  );
}

function CopyButton({
  copied,
  onClick,
  copyLabel,
  copiedLabel,
  light,
}: {
  copied: boolean;
  onClick: () => void;
  copyLabel: string;
  copiedLabel: string;
  light: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? copiedLabel : copyLabel}
      title={copied ? copiedLabel : copyLabel}
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[9px] border text-[11px] font-medium shadow-none transition-[width,background,border-color,color,opacity,transform] duration-200 active:scale-[0.985]',
        copied ? 'w-[118px] px-3' : 'w-8 px-0',
        light
          ? 'border-black/[0.08] bg-white text-black/54 hover:border-black/[0.12] hover:bg-black/[0.035] hover:text-black'
          : 'border-white/[0.08] bg-white/[0.04] text-white/58 hover:border-white/[0.13] hover:bg-white/[0.07] hover:text-white',
      )}
    >
      {copied ? (
        <>
          <Check className="size-3.5 shrink-0" />
          <span className="truncate">{copiedLabel}</span>
        </>
      ) : (
        <Copy className="size-3.5 shrink-0" />
      )}
    </button>
  );
}

function SignalCell({
  label,
  value,
  hint,
  light,
}: {
  label: string;
  value: string | number;
  hint?: string;
  light: boolean;
}) {
  return (
    <div className="min-w-0 p-4">
      <div className={cn('text-[10.5px] font-medium', mutedText(light))}>
        {label}
      </div>

      <div
        className={cn(
          'mt-1 truncate text-[18px] font-semibold tracking-[-0.045em]',
          pageText(light),
        )}
      >
        {value}
      </div>

      {hint ? (
        <div className={cn('mt-1 truncate text-[10.5px]', faintText(light))}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function KeyValue({
  label,
  value,
  light,
}: {
  label: string;
  value: string;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'flex min-h-10 items-center justify-between gap-3 rounded-[9px] border px-3',
        fieldTone(light),
      )}
    >
      <span className={cn('text-[11px] font-medium', mutedText(light))}>
        {label}
      </span>

      <span
        className={cn(
          'truncate text-right text-[11.5px] font-medium',
          pageText(light),
        )}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyInfoCard({
  icon,
  label,
  title,
  description,
  light,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  description: string;
  light: boolean;
}) {
  return (
    <Card light={light}>
      <div className="p-4">
        <MicroLabel light={light}>
          {icon}
          {label}
        </MicroLabel>

        <div
          className={cn(
            'mt-4 text-[13px] font-semibold tracking-[-0.018em]',
            pageText(light),
          )}
        >
          {title}
        </div>

        <p className={cn('mt-1 text-[11px] leading-4', mutedText(light))}>
          {description}
        </p>
      </div>
    </Card>
  );
}

function ProfileOverviewCard({
  light,
  accentColor,
  publicHref,
  publicUrl,
  copied,
  onCopy,
  labels,
  name,
  profession,
  city,
  servicesCount,
  contactCount,
  phone,
  telegram,
  whatsapp,
  avatar,
}: {
  light: boolean;
  accentColor: string;
  publicHref: string;
  publicUrl: string;
  copied: boolean;
  onCopy: () => void;
  labels: Record<string, string>;
  name?: string;
  profession?: string;
  city?: string;
  servicesCount: number;
  contactCount: number;
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  avatar?: string;
}) {
  return (
    <Card light={light}>
      <CardTitle
        title={labels.overview}
        description={labels.overviewDescription}
        light={light}
      />

      <div className="p-4">
        <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <Panel light={light} className="p-4">
            <div className="flex items-center gap-3">
              <MasterAvatar
                name={name || labels.name}
                avatar={avatar}
                className="h-14 w-14 rounded-[11px]"
              />

              <div className="min-w-0">
                <div className={cn('truncate text-[15px] font-semibold', pageText(light))}>
                  {name || '—'}
                </div>

                <div className={cn('mt-1 truncate text-[11px]', mutedText(light))}>
                  {profession || '—'}
                </div>

                {city ? (
                  <div className={cn('mt-1 truncate text-[10.5px]', faintText(light))}>
                    {city}
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className="mt-4 h-1.5 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${accentColor}, color-mix(in srgb, ${accentColor} 26%, transparent))`,
              }}
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className={cn('rounded-[9px] border px-3 py-2', fieldTone(light))}>
                <div className={cn('text-[10px]', mutedText(light))}>
                  {labels.services}
                </div>
                <div className={cn('mt-1 text-[16px] font-semibold', pageText(light))}>
                  {servicesCount}
                </div>
              </div>

              <div className={cn('rounded-[9px] border px-3 py-2', fieldTone(light))}>
                <div className={cn('text-[10px]', mutedText(light))}>
                  {labels.contacts}
                </div>
                <div className={cn('mt-1 text-[16px] font-semibold', pageText(light))}>
                  {contactCount}
                </div>
              </div>
            </div>
          </Panel>

          <div className="min-w-0">
            <div
              className={cn(
                'grid divide-y rounded-[10px] border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4',
                borderTone(light),
                divideTone(light),
                light ? 'bg-black/[0.018]' : 'bg-white/[0.025]',
              )}
            >
              <SignalCell
                label={labels.name}
                value={name || '—'}
                hint={labels.profile}
                light={light}
              />

              <SignalCell
                label={labels.profession}
                value={profession || '—'}
                hint={labels.profile}
                light={light}
              />

              <SignalCell
                label={labels.services}
                value={servicesCount}
                hint={labels.servicesReady}
                light={light}
              />

              <SignalCell
                label={labels.contacts}
                value={contactCount}
                hint={labels.contactsReady}
                light={light}
              />
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <KeyValue label={labels.phone} value={phone || '—'} light={light} />
              <KeyValue label={labels.telegram} value={telegram || '—'} light={light} />
              <KeyValue label={labels.whatsapp} value={whatsapp || '—'} light={light} />
            </div>

            <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-2 rounded-[10px] border px-3 py-2.5',
                  fieldTone(light),
                )}
              >
                <Link2 className={cn('size-3.5 shrink-0', mutedText(light))} />
                <span className={cn('truncate text-[11.5px] font-medium', mutedText(light))}>
                  {publicUrl}
                </span>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <ActionLink href={publicHref} light={light} active>
                  <Globe2 className="size-3.5" />
                  {labels.openPublic}
                </ActionLink>

                <CopyButton
                  copied={copied}
                  onClick={onCopy}
                  copyLabel={labels.copy}
                  copiedLabel={labels.copied}
                  light={light}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardProfilePage() {
  const { ownedProfile, hasHydrated, demoMode } = useOwnedWorkspaceData();
  const { locale } = useLocale();
  const { resolvedTheme } = useTheme();
  const { settings } = useAppearance();

  const [mounted, setMounted] = useState(false);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme: ThemeMode = mounted
    ? resolvedTheme === 'light'
      ? 'light'
      : 'dark'
    : 'dark';

  const isLight = currentTheme === 'light';
  const accentColor = accentPalette[settings.accentTone]?.solid ?? '#8b8b8b';

  const labels =
    locale === 'ru'
      ? {
          title: 'Профиль мастера',
          description:
            'Один чистый экран для публичной ссылки, карточки клиента и редактирования данных мастера.',
          publicPage: 'Публичная страница',
          openPublic: 'Открыть страницу',
          copyLink: 'Скопировать ссылку',

          createProfileTitle: 'Профиль ещё не создан',
          createProfileDescription:
            'Сначала создайте профиль мастера, чтобы открыть настройки страницы, публичную карточку и онлайн-запись.',
          createProfileButton: 'Создать профиль',
          emptyBadge: 'Профиль не найден',
          emptyCardProfileLabel: 'Профиль',
          emptyCardProfileTitle: 'Данные мастера',
          emptyCardProfileText:
            'После создания профиля здесь появятся имя, профессия, описание, контакты и услуги.',
          emptyCardPublicLabel: 'Публичная',
          emptyCardPublicTitle: 'Страница клиента',
          emptyCardPublicText:
            'После сохранения профиля появится ссылка для клиентов и публичная карточка.',
          emptyCardStartLabel: 'Старт',
          emptyCardStartTitle: 'Один шаг до запуска',
          emptyCardStartText:
            'Заполните профиль мастера, затем можно принимать записи и редактировать страницу.',

          formTitle: 'Данные профиля',
          formDescription:
            'Редактируйте основную информацию, описание, услуги и контакты.',

          ready: 'Страница активна',
          profileReady: 'Профиль заполнен',

          services: 'Услуг',
          contacts: 'Контакты',
          profile: 'Профиль',
          profession: 'Профессия',
          name: 'Имя',
          phone: 'Телефон',
          telegram: 'Telegram',
          whatsapp: 'WhatsApp',
          copy: 'Скопировать',
          copied: 'Скопировано',
          overview: 'Сводка профиля',
          overviewDescription:
            'Короткий срез по публичной карточке, контактам, услугам и ссылке для клиента.',
          contactsReady: 'каналов',
          servicesReady: 'активных',
        }
      : {
          title: 'Specialist profile',
          description:
            'One clean screen for public link, client card, and master profile editing.',
          publicPage: 'Public page',
          openPublic: 'Open page',
          copyLink: 'Copy link',

          createProfileTitle: 'Profile is not created yet',
          createProfileDescription:
            'Create a master profile first to open page settings, public card, and online booking.',
          createProfileButton: 'Create profile',
          emptyBadge: 'Profile missing',
          emptyCardProfileLabel: 'Profile',
          emptyCardProfileTitle: 'Specialist details',
          emptyCardProfileText:
            'After profile setup, name, profession, description, contacts, and services will appear here.',
          emptyCardPublicLabel: 'Public',
          emptyCardPublicTitle: 'Client page',
          emptyCardPublicText:
            'After saving the profile, a client booking link and public card will be created.',
          emptyCardStartLabel: 'Start',
          emptyCardStartTitle: 'One step to launch',
          emptyCardStartText:
            'Fill in the master profile, then start accepting bookings and editing the page.',

          formTitle: 'Profile details',
          formDescription:
            'Edit main information, description, services, and contacts.',

          ready: 'Page active',
          profileReady: 'Profile ready',

          services: 'Services',
          contacts: 'Contacts',
          profile: 'Profile',
          profession: 'Profession',
          name: 'Name',
          phone: 'Phone',
          telegram: 'Telegram',
          whatsapp: 'WhatsApp',
          copy: 'Copy',
          copied: 'Copied',
          overview: 'Profile overview',
          overviewDescription:
            'A compact cut of public card, contacts, services, and client link.',
          contactsReady: 'channels',
          servicesReady: 'active',
        };

  const publicHref = demoMode
    ? `/demo/${SLOTY_DEMO_SLUG}`
    : ownedProfile
      ? `/m/${ownedProfile.slug}`
      : '/create-profile';

  const publicUrl =
    mounted && typeof window !== 'undefined'
      ? `${window.location.origin}${publicHref}`
      : publicHref;

  const handleCopyPublicLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(publicUrl);
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = publicUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedPublicLink(true);
      window.setTimeout(() => setCopiedPublicLink(false), 1400);
    } catch {
      setCopiedPublicLink(false);
    }
  };

  const profileStats = useMemo(() => {
    if (!ownedProfile) return null;

    const contactCount = [
      ownedProfile.phone,
      ownedProfile.telegram,
      ownedProfile.whatsapp,
    ].filter(Boolean).length;

    const servicesCount = ownedProfile.services?.length ?? 0;

    return {
      contactCount,
      servicesCount,
    };
  }, [ownedProfile]);

  if (!hasHydrated || !mounted) return null;

  if (!ownedProfile || !profileStats) {
    return (
      <WorkspaceShell>
        <main
          className={cn(
            'min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6',
            pageBg(isLight),
          )}
        >
          <div className="mx-auto w-full max-w-[var(--page-max-width)]">
            <div className="mb-6 md:mb-7">
              <h1
                className={cn(
                  'text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]',
                  pageText(isLight),
                )}
              >
                {labels.title}
              </h1>

              <p className={cn('mt-2 max-w-[760px] text-[13px] leading-5', mutedText(isLight))}>
                {labels.description}
              </p>
            </div>

            <Card light={isLight}>
              <div className="grid min-h-[320px] place-items-center px-5 py-12 text-center">
                <div className="mx-auto max-w-[460px]">
                  <MicroLabel light={isLight}>
                    <StatusDot light={isLight} />
                    {labels.emptyBadge}
                  </MicroLabel>

                  <h2
                    className={cn(
                      'mt-5 text-[28px] font-semibold tracking-[-0.065em] md:text-[36px]',
                      pageText(isLight),
                    )}
                  >
                    {labels.createProfileTitle}
                  </h2>

                  <p className={cn('mt-3 text-[13px] leading-5', mutedText(isLight))}>
                    {labels.createProfileDescription}
                  </p>

                  <div className="mt-6 flex justify-center">
                    <ActionLink
                      href={demoMode ? '/dashboard/profile?demo=1' : '/create-profile'}
                      light={isLight}
                      active
                    >
                      <SquarePen className="size-3.5" />
                      {labels.createProfileButton}
                    </ActionLink>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <EmptyInfoCard
                light={isLight}
                icon={<SquarePen className="size-3.5" />}
                label={labels.emptyCardProfileLabel}
                title={labels.emptyCardProfileTitle}
                description={labels.emptyCardProfileText}
              />

              <EmptyInfoCard
                light={isLight}
                icon={<Globe2 className="size-3.5" />}
                label={labels.emptyCardPublicLabel}
                title={labels.emptyCardPublicTitle}
                description={labels.emptyCardPublicText}
              />

              <EmptyInfoCard
                light={isLight}
                icon={<Sparkles className="size-3.5" />}
                label={labels.emptyCardStartLabel}
                title={labels.emptyCardStartTitle}
                description={labels.emptyCardStartText}
              />
            </div>
          </div>
        </main>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <main
        className={cn(
          'min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6',
          pageBg(isLight),
        )}
      >
        <style jsx global>{`
          .dashboard-profile-form-clean > section > div:first-child > div:nth-child(2),
          .dashboard-profile-form-clean > div > section > div:first-child > div:nth-child(2) {
            display: none !important;
          }
        `}</style>

        <div className="mx-auto w-full max-w-[var(--page-max-width)]">
          <div className="mb-6 md:mb-7">
            <h1
              className={cn(
                'text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]',
                pageText(isLight),
              )}
            >
              {labels.title}
            </h1>

            <p className={cn('mt-2 max-w-[760px] text-[13px] leading-5', mutedText(isLight))}>
              {labels.description}
            </p>
          </div>

          <div className="grid gap-4">
            <ProfileOverviewCard
              light={isLight}
              accentColor={accentColor}
              publicHref={publicHref}
              publicUrl={publicUrl}
              copied={copiedPublicLink}
              onCopy={handleCopyPublicLink}
              labels={labels}
              name={ownedProfile.name}
              profession={ownedProfile.profession}
              city={ownedProfile.city}
              servicesCount={profileStats.servicesCount}
              contactCount={profileStats.contactCount}
              phone={ownedProfile.phone}
              telegram={ownedProfile.telegram}
              whatsapp={ownedProfile.whatsapp}
              avatar={ownedProfile.avatar}
            />

            <div className="dashboard-profile-form-clean">
              <MasterProfileForm
                initialProfile={ownedProfile}
                mode="edit"
                showOverviewCards={false}
                showHeader={false}
                showPreviewPanel={false}
                showReviewSection={false}
              />
            </div>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}