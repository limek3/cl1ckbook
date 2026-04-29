// app/create-profile/page.tsx
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
  ExternalLink,
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  Globe2,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  Phone,
  Sparkles,
  SquarePen,
} from 'lucide-react';

import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { MasterProfileForm } from '@/components/profile/master-profile-form';
import { useApp } from '@/lib/app-context';
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
    <section className={cn('rounded-[11px] border', cardTone(light), className)}>
      {children}
    </section>
  );
}

function CardTitle({
  title,
  description,
  light,
  action,
}: {
  title: string;
  description?: string;
  light: boolean;
  action?: ReactNode;
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

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function Panel({
  children,
  light,
  className,
  style,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn('rounded-[10px] border', insetTone(light), className)}
      style={style}
    >
      {children}
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
      style={
        active && accentColor
          ? {
              background: light
                ? `color-mix(in srgb, ${accentColor} 10%, #ffffff)`
                : `color-mix(in srgb, ${accentColor} 22%, #141414)`,
              borderColor: light
                ? `color-mix(in srgb, ${accentColor} 22%, rgba(0,0,0,0.1))`
                : `color-mix(in srgb, ${accentColor} 34%, rgba(255,255,255,0.1))`,
              color: light
                ? `color-mix(in srgb, ${accentColor} 70%, #101010)`
                : `color-mix(in srgb, ${accentColor} 18%, #ffffff)`,
            }
          : undefined
      }
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
      className={cn(
        buttonBase(light, active),
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  );
}

function HeroStat({
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
    <div
      className={cn(
        'min-w-0 rounded-[10px] border px-3.5 py-3 transition-colors duration-150',
        light
          ? 'border-black/[0.07] bg-white hover:bg-black/[0.018]'
          : 'border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.055]',
      )}
    >
      <div className="grid min-h-[34px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <div className={cn('truncate text-[10.5px] font-medium', mutedText(light))}>
            {label}
          </div>

          {hint ? (
            <div className={cn('mt-0.5 truncate text-[10px]', faintText(light))}>
              {hint}
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'min-w-[54px] max-w-[150px] truncate text-right text-[18px] font-semibold leading-none tracking-[-0.055em] tabular-nums',
            pageText(light),
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon,
  light,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  light: boolean;
}) {
  return (
    <div className="min-w-0 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn('text-[11px] font-medium', mutedText(light))}>
            {label}
          </div>

          <div
            className={cn(
              'mt-2 truncate text-[25px] font-semibold tracking-[-0.065em]',
              pageText(light),
            )}
          >
            {value}
          </div>

          <div className={cn('mt-1 truncate text-[11px]', faintText(light))}>
            {hint}
          </div>
        </div>

        <div
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] border',
            light
              ? 'border-black/[0.07] bg-black/[0.025] text-black/38'
              : 'border-white/[0.07] bg-white/[0.035] text-white/38',
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ListBox({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[10px] border divide-y',
        insetTone(light),
        divideTone(light),
        className,
      )}
    >
      {children}
    </div>
  );
}

function ListRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('px-4 py-3.5', className)}>{children}</div>;
}

function QualityRow({
  title,
  description,
  done,
  light,
  accentColor,
}: {
  title: string;
  description: string;
  done: boolean;
  light: boolean;
  accentColor: string;
}) {
  return (
    <ListRow>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-[9px] border',
            done
              ? 'border-transparent text-white'
              : light
                ? 'border-black/[0.08] bg-white text-black/30'
                : 'border-white/[0.08] bg-white/[0.04] text-white/28',
          )}
          style={done ? { background: accentColor } : undefined}
        >
          {done ? <Check className="size-3.5" /> : <StatusDot light={light} />}
        </span>

        <div className="min-w-0">
          <div
            className={cn(
              'text-[12.5px] font-semibold tracking-[-0.015em]',
              pageText(light),
            )}
          >
            {title}
          </div>

          <p className={cn('mt-1 text-[11px] leading-4', mutedText(light))}>
            {description}
          </p>
        </div>
      </div>
    </ListRow>
  );
}

function EmptyState({
  children,
  light,
}: {
  children: ReactNode;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-[10px] border px-4 py-5 text-[12px]',
        insetTone(light),
        mutedText(light),
      )}
    >
      {children}
    </div>
  );
}

export default function CreateProfilePage() {
  const { ownedProfile, hasHydrated } = useApp();
  const { settings } = useAppearance();
  const { locale } = useLocale();
  const { resolvedTheme } = useTheme();

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
  const publicAccentColor = accentPalette[settings.publicAccent]?.solid ?? accentColor;

  const profileExists = Boolean(ownedProfile);
  const profileNameReady = Boolean(ownedProfile?.name?.trim());
  const servicesCount = ownedProfile?.services?.length ?? 0;
  const servicesReady = servicesCount > 0;
  const contactsReady = Boolean(
    ownedProfile?.phone || ownedProfile?.telegram || ownedProfile?.whatsapp,
  );

  const serviceNames = useMemo(() => {
    return (ownedProfile?.services ?? [])
      .map((service) => {
        if (typeof service === 'string') return service;

        if (service && typeof service === 'object') {
          const record = service as Record<string, unknown>;

          if (typeof record.name === 'string') return record.name;
          if (typeof record.title === 'string') return record.title;
        }

        return null;
      })
      .filter(Boolean) as string[];
  }, [ownedProfile?.services]);

  const readinessItems = useMemo(() => {
    const ru = locale === 'ru';

    return [
      {
        title: ru ? 'Профиль мастера' : 'Specialist profile',
        description: ru
          ? 'Имя и базовое описание заполнены.'
          : 'Name and basic description are filled.',
        done: profileNameReady,
      },
      {
        title: ru ? 'Список услуг' : 'Service list',
        description: ru
          ? 'Клиент видит, на что можно записаться.'
          : 'The client can see what can be booked.',
        done: servicesReady,
      },
      {
        title: ru ? 'Контакт для связи' : 'Contact route',
        description: ru
          ? 'Есть телефон, Telegram или WhatsApp для подтверждения.'
          : 'Phone, Telegram, or WhatsApp is added for confirmation.',
        done: contactsReady,
      },
      {
        title: ru ? 'Публичная ссылка' : 'Public link',
        description: ru
          ? 'Страница сохранена и готова к отправке клиентам.'
          : 'The page is saved and ready to be shared.',
        done: profileExists,
      },
    ];
  }, [contactsReady, locale, profileExists, profileNameReady, servicesReady]);

  const readiness = Math.round(
    (readinessItems.filter((item) => item.done).length / readinessItems.length) * 100,
  );

  const copy = useMemo(() => {
    return locale === 'ru'
      ? {
          title: profileExists ? 'Профиль мастера' : 'Создание профиля',
          description:
            'Настройка публичной страницы мастера в едином стиле кабинета: данные, услуги, контакты, ссылка и оформление.',

          dataReady: profileExists ? 'Профиль активен' : 'Черновик',
          publicPage: profileExists ? 'Публичная online' : 'Публичная скрыта',
          readyLabel: readiness === 100 ? 'Готово к записи' : 'Требуется заполнение',

          summaryTitle: 'Сводка профиля',
          summaryDescription:
            'Короткий срез по готовности страницы, услугам, контактам и публичной ссылке.',

          editorTitle: 'Редактор страницы',
          editorDescription:
            'Основной рабочий блок. Здесь заполняются данные мастера, услуги и контакты.',
          qualityTitle: 'Контроль запуска',
          qualityDescription: 'Что нужно заполнить, чтобы страницу можно было отправлять клиентам.',
          linkTitle: 'Публичная ссылка',
          linkDescription: 'Ссылка появится после сохранения профиля.',
          appearanceTitle: 'Оформление',
          appearanceDescription: 'Акцент кабинета и публичной страницы.',
          servicesTitle: 'Услуги',
          servicesDescription: 'Список услуг, которые будут доступны клиенту.',
          systemTitle: 'Система',
          systemDescription: 'Техническое состояние публичной страницы.',

          profileName: 'Имя',
          pageStatus: 'Статус',
          readiness: 'Готовность',
          services: 'Услуги',
          contacts: 'Контакты',
          publication: 'Публикация',

          nameEmpty: 'Имя не указано',
          servicesEmpty: 'Услуги не добавлены',
          contactsReady: 'Контакт есть',
          contactsEmpty: 'Нет контакта',
          configured: 'Настроено',
          empty: 'Пусто',
          online: 'Online',
          draft: 'Draft',
          secure: 'Защищено',

          publicLink: 'Ссылка',
          linkDraft: '/m/your-name',
          open: 'Открыть',
          copy: 'Скопировать',
          copied: 'Скопировано',
          dashboard: 'Кабинет',

          workspaceAccent: 'Кабинет',
          publicAccent: 'Публичная',
        }
      : {
          title: profileExists ? 'Specialist profile' : 'Create profile',
          description:
            'Public specialist page setup in the same workspace style: data, services, contacts, link, and appearance.',

          dataReady: profileExists ? 'Profile active' : 'Draft',
          publicPage: profileExists ? 'Public online' : 'Public hidden',
          readyLabel: readiness === 100 ? 'Ready for booking' : 'Needs setup',

          summaryTitle: 'Profile summary',
          summaryDescription:
            'A short cut of page readiness, services, contacts, and public link.',

          editorTitle: 'Page editor',
          editorDescription:
            'The main working block. Master data, services, and contacts are edited here.',
          qualityTitle: 'Launch control',
          qualityDescription: 'What needs to be filled before sharing the page.',
          linkTitle: 'Public link',
          linkDescription: 'The link appears after saving the profile.',
          appearanceTitle: 'Appearance',
          appearanceDescription: 'Workspace and public page accent.',
          servicesTitle: 'Services',
          servicesDescription: 'Services that will be available to the client.',
          systemTitle: 'System',
          systemDescription: 'Technical state of the public page.',

          profileName: 'Name',
          pageStatus: 'Status',
          readiness: 'Readiness',
          services: 'Services',
          contacts: 'Contacts',
          publication: 'Publication',

          nameEmpty: 'Name is empty',
          servicesEmpty: 'No services added',
          contactsReady: 'Contact ready',
          contactsEmpty: 'No contact',
          configured: 'Configured',
          empty: 'Empty',
          online: 'Online',
          draft: 'Draft',
          secure: 'Secure',

          publicLink: 'Link',
          linkDraft: '/m/your-name',
          open: 'Open',
          copy: 'Copy',
          copied: 'Copied',
          dashboard: 'Dashboard',

          workspaceAccent: 'Workspace',
          publicAccent: 'Public',
        };
  }, [locale, profileExists, readiness]);

  if (!hasHydrated || !mounted) return null;

  const publicHref = ownedProfile ? `/m/${ownedProfile.slug}` : null;
  const publicSlug = ownedProfile ? `/m/${ownedProfile.slug}` : copy.linkDraft;

  const publicUrl =
    typeof window !== 'undefined' && publicHref
      ? `${window.location.origin}${publicHref}`
      : publicSlug;

  const profileName = ownedProfile?.name?.trim() || copy.nameEmpty;

  const profileFormStyle = {
    '--profile-action-bg': isLight ? '#232321' : '#e8e4dc',
    '--profile-action-border': isLight
      ? 'rgba(0,0,0,0.14)'
      : 'rgba(255,255,255,0.18)',
    '--profile-action-fg': isLight ? '#ffffff' : '#111111',
    '--profile-input-bg': isLight ? '#ffffff' : 'rgba(255,255,255,0.045)',
    '--profile-input-border': isLight
      ? 'rgba(0,0,0,0.08)'
      : 'rgba(255,255,255,0.08)',
    '--profile-card-bg': 'transparent',
    '--profile-panel-bg': 'transparent',
  } as CSSProperties;

  const handleCopyPublicLink = async () => {
    if (!publicHref) return;

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

      window.setTimeout(() => {
        setCopiedPublicLink(false);
      }, 1400);
    } catch {
      setCopiedPublicLink(false);
    }
  };

  const kpis = [
    {
      label: copy.readiness,
      value: `${readiness}%`,
      hint: copy.readyLabel,
      icon: <BadgeCheck className="size-4" />,
    },
    {
      label: copy.services,
      value: String(servicesCount),
      hint: servicesReady ? copy.configured : copy.empty,
      icon: <Sparkles className="size-4" />,
    },
    {
      label: copy.contacts,
      value: contactsReady ? copy.configured : copy.empty,
      hint: contactsReady ? copy.contactsReady : copy.contactsEmpty,
      icon: <Phone className="size-4" />,
    },
    {
      label: copy.publication,
      value: profileExists ? copy.online : copy.draft,
      hint: profileExists ? copy.publicPage : copy.readyLabel,
      icon: <Globe2 className="size-4" />,
    },
  ] as const;

  return (
    <WorkspaceShell>
      <main
        className={cn(
          'min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6',
          pageBg(isLight),
        )}
      >
        <style jsx global>{`
          .create-profile-ref-form [data-preview-panel],
          .create-profile-ref-form [data-public-preview],
          .create-profile-ref-form [data-profile-preview],
          .create-profile-ref-form [data-sidebar-preview] {
            display: none !important;
          }

          .create-profile-ref-form,
          .create-profile-ref-form * {
            box-shadow: none !important;
            transition-property: color, border-color, background-color, opacity,
              transform !important;
          }

          .create-profile-ref-form > *,
          .create-profile-ref-form form,
          .create-profile-ref-form form > div,
          .create-profile-ref-form section,
          .create-profile-ref-form article {
            box-shadow: none !important;
          }

          .create-profile-ref-form input,
          .create-profile-ref-form textarea,
          .create-profile-ref-form select {
            background: var(--profile-input-bg) !important;
            border-color: var(--profile-input-border) !important;
            box-shadow: none !important;
            border-radius: 9px !important;
            min-height: 36px !important;
          }

          .create-profile-ref-form input:focus,
          .create-profile-ref-form textarea:focus,
          .create-profile-ref-form select:focus {
            border-color: var(--profile-input-border) !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .create-profile-ref-form button[type='submit'],
          .create-profile-ref-form .cb-soft-gradient-button,
          .create-profile-ref-form .cb-menu-button-primary {
            background: var(--profile-action-bg) !important;
            border-color: var(--profile-action-border) !important;
            color: var(--profile-action-fg) !important;
            border-radius: 9px !important;
            height: 32px !important;
            min-height: 32px !important;
            font-size: 12px !important;
          }

          .create-profile-ref-form textarea {
            min-height: 96px !important;
            height: 96px !important;
          }

          .create-profile-ref-form [class*='rounded-[32px]'],
          .create-profile-ref-form [class*='rounded-[30px]'],
          .create-profile-ref-form [class*='rounded-[28px]'],
          .create-profile-ref-form [class*='rounded-[26px]'],
          .create-profile-ref-form [class*='rounded-[24px]'],
          .create-profile-ref-form [class*='rounded-[22px]'],
          .create-profile-ref-form [class*='rounded-[20px]'],
          .create-profile-ref-form [class*='rounded-[18px]'],
          .create-profile-ref-form [class*='rounded-[16px]'],
          .create-profile-ref-form [class*='rounded-xl'],
          .create-profile-ref-form [class*='rounded-2xl'],
          .create-profile-ref-form [class*='rounded-3xl'] {
            border-radius: 10px !important;
          }

          .create-profile-ref-form [class*='shadow-'],
          .create-profile-ref-form [class*='drop-shadow'] {
            box-shadow: none !important;
            filter: none !important;
          }

          .create-profile-ref-form [class*='min-h-[360px]'],
          .create-profile-ref-form [class*='min-h-[380px]'],
          .create-profile-ref-form [class*='min-h-[400px]'],
          .create-profile-ref-form [class*='min-h-[420px]'],
          .create-profile-ref-form [class*='min-h-[460px]'],
          .create-profile-ref-form [class*='min-h-[520px]'] {
            min-height: 0 !important;
          }

          .create-profile-ref-form [class*='h-[360px]'],
          .create-profile-ref-form [class*='h-[380px]'],
          .create-profile-ref-form [class*='h-[400px]'],
          .create-profile-ref-form [class*='h-[420px]'],
          .create-profile-ref-form [class*='h-[460px]'],
          .create-profile-ref-form [class*='h-[520px]'] {
            height: auto !important;
          }
        `}</style>

        <div className="mx-auto w-full max-w-[var(--page-max-width)]">
          <div className="mb-6 md:mb-7">
            <div className="min-w-0">
              <h1
                className={cn(
                  'text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]',
                  pageText(isLight),
                )}
              >
                {copy.title}
              </h1>

              <p
                className={cn(
                  'mt-2 max-w-[760px] text-[13px] leading-5',
                  mutedText(isLight),
                )}
              >
                {copy.description}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Card light={isLight} className="overflow-hidden">
              <div className="p-5 md:p-6">
                <div className="min-w-0">
                  <div
                    className={cn(
                      'break-all text-[32px] font-semibold tracking-[-0.08em] md:text-[44px]',
                      pageText(isLight),
                    )}
                  >
                    {publicSlug}
                  </div>

                  <p
                    className={cn(
                      'mt-3 max-w-[680px] text-[12.5px] leading-6',
                      mutedText(isLight),
                    )}
                  >
                    {copy.summaryDescription}
                  </p>
                </div>

                <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <HeroStat
                    label={copy.profileName}
                    value={profileName}
                    hint={profileNameReady ? copy.configured : copy.empty}
                    light={isLight}
                  />

                  <HeroStat
                    label={copy.services}
                    value={servicesCount}
                    hint={servicesReady ? copy.configured : copy.empty}
                    light={isLight}
                  />

                  <HeroStat
                    label={copy.contacts}
                    value={contactsReady ? copy.configured : copy.empty}
                    hint={contactsReady ? copy.contactsReady : copy.contactsEmpty}
                    light={isLight}
                  />

                  <HeroStat
                    label={copy.pageStatus}
                    value={profileExists ? copy.online : copy.draft}
                    hint={copy.publicPage}
                    light={isLight}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {publicHref ? (
                    <ActionLink href={publicHref} light={isLight} active>
                      <ExternalLink className="size-3.5" />
                      {copy.open}
                    </ActionLink>
                  ) : null}

                  <ActionButton
                    light={isLight}
                    disabled={!publicHref}
                    onClick={handleCopyPublicLink}
                  >
                    {copiedPublicLink ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copiedPublicLink ? copy.copied : copy.copy}
                  </ActionButton>

                  <ActionLink href="/dashboard" light={isLight}>
                    <LayoutDashboard className="size-3.5" />
                    {copy.dashboard}
                  </ActionLink>
                </div>
              </div>
            </Card>

            <Card light={isLight}>
              <CardTitle
                title={copy.summaryTitle}
                description={copy.summaryDescription}
                light={isLight}
              />

              <div
                className={cn(
                  'grid divide-y md:grid-cols-4 md:divide-x md:divide-y-0',
                  divideTone(isLight),
                )}
              >
                {kpis.map((metric) => (
                  <StatTile
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    hint={metric.hint}
                    icon={metric.icon}
                    light={isLight}
                  />
                ))}
              </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Card light={isLight} className="min-w-0 overflow-hidden">
                <CardTitle
                  title={copy.editorTitle}
                  description={copy.editorDescription}
                  light={isLight}
                  action={
                    <MicroLabel light={isLight}>
                      <SquarePen className="size-3.5" />
                      {profileExists ? copy.configured : copy.draft}
                    </MicroLabel>
                  }
                />

                <div className="p-4">
                  <div className="create-profile-ref-form" style={profileFormStyle}>
                    <MasterProfileForm
                      initialProfile={ownedProfile}
                      mode={ownedProfile ? 'edit' : 'create'}
                      showHeader={false}
                      showOverviewCards={false}
                      showPreviewPanel={false}
                    />
                  </div>
                </div>
              </Card>

              <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                <Card light={isLight}>
                  <CardTitle
                    title={copy.qualityTitle}
                    description={copy.qualityDescription}
                    light={isLight}
                    action={
                      <MicroLabel
                        light={isLight}
                        active={readiness === 100}
                        accentColor={accentColor}
                      >
                        {readiness}%
                      </MicroLabel>
                    }
                  />

                  <div className="p-4">
                    <ListBox light={isLight}>
                      {readinessItems.map((item) => (
                        <QualityRow
                          key={item.title}
                          title={item.title}
                          description={item.description}
                          done={item.done}
                          light={isLight}
                          accentColor={accentColor}
                        />
                      ))}
                    </ListBox>
                  </div>
                </Card>

                <Card light={isLight}>
                  <CardTitle
                    title={copy.linkTitle}
                    description={copy.linkDescription}
                    light={isLight}
                  />

                  <div className="p-4">
                    <Panel light={isLight} className="p-4">
                      <MicroLabel light={isLight}>
                        <Link2 className="size-3.5" />
                        {copy.publicLink}
                      </MicroLabel>

                      <div
                        className={cn(
                          'mt-4 break-all text-[20px] font-semibold leading-tight tracking-[-0.055em]',
                          pageText(isLight),
                        )}
                      >
                        {publicSlug}
                      </div>

                      <div className={cn('mt-2 break-all text-[11px] leading-4', faintText(isLight))}>
                        {publicUrl}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {publicHref ? (
                          <ActionLink href={publicHref} light={isLight} active className="w-full">
                            <ExternalLink className="size-3.5" />
                            {copy.open}
                          </ActionLink>
                        ) : (
                          <ActionButton light={isLight} disabled className="w-full">
                            <ExternalLink className="size-3.5" />
                            {copy.open}
                          </ActionButton>
                        )}

                        <ActionButton
                          light={isLight}
                          disabled={!publicHref}
                          onClick={handleCopyPublicLink}
                          className="w-full"
                        >
                          {copiedPublicLink ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                          {copiedPublicLink ? copy.copied : copy.copy}
                        </ActionButton>
                      </div>
                    </Panel>
                  </div>
                </Card>

                <Card light={isLight}>
                  <CardTitle
                    title={copy.servicesTitle}
                    description={copy.servicesDescription}
                    light={isLight}
                  />

                  <div className="p-4">
                    {serviceNames.length > 0 ? (
                      <ListBox light={isLight}>
                        {serviceNames.slice(0, 6).map((service, index) => (
                          <ListRow key={`${service}-${index}`}>
                            <div className="flex items-center justify-between gap-3">
                              <span
                                className={cn(
                                  'truncate text-[12.5px] font-semibold',
                                  pageText(isLight),
                                )}
                              >
                                {index + 1}. {service}
                              </span>

                              <MicroLabel light={isLight}>
                                <Sparkles className="size-3.5" />
                                {copy.configured}
                              </MicroLabel>
                            </div>
                          </ListRow>
                        ))}
                      </ListBox>
                    ) : (
                      <EmptyState light={isLight}>{copy.servicesEmpty}</EmptyState>
                    )}
                  </div>
                </Card>

                <Card light={isLight}>
                  <CardTitle
                    title={copy.appearanceTitle}
                    description={copy.appearanceDescription}
                    light={isLight}
                  />

                  <div className={cn('grid grid-cols-2 divide-x', divideTone(isLight))}>
                    <div className="min-w-0 p-4">
                      <MicroLabel light={isLight}>
                        <StatusDot light={isLight} active accentColor={accentColor} />
                        {copy.workspaceAccent}
                      </MicroLabel>

                      <div
                        className={cn(
                          'mt-3 truncate text-[18px] font-semibold tracking-[-0.045em]',
                          pageText(isLight),
                        )}
                      >
                        {settings.accentTone}
                      </div>
                    </div>

                    <div className="min-w-0 p-4">
                      <MicroLabel light={isLight}>
                        <StatusDot light={isLight} active accentColor={publicAccentColor} />
                        {copy.publicAccent}
                      </MicroLabel>

                      <div
                        className={cn(
                          'mt-3 truncate text-[18px] font-semibold tracking-[-0.045em]',
                          pageText(isLight),
                        )}
                      >
                        {settings.publicAccent}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card light={isLight}>
                  <CardTitle
                    title={copy.systemTitle}
                    description={copy.systemDescription}
                    light={isLight}
                  />

                  <div className={cn('grid grid-cols-2 divide-x', divideTone(isLight))}>
                    <div className="p-4">
                      <MicroLabel light={isLight} active={profileExists} accentColor={accentColor}>
                        <Globe2 className="size-3.5" />
                        {profileExists ? copy.online : copy.draft}
                      </MicroLabel>

                      <div
                        className={cn(
                          'mt-3 truncate text-[18px] font-semibold tracking-[-0.045em]',
                          pageText(isLight),
                        )}
                      >
                        {profileExists ? copy.online : copy.draft}
                      </div>
                    </div>

                    <div className="p-4">
                      <MicroLabel light={isLight}>
                        <LockKeyhole className="size-3.5" />
                        {copy.secure}
                      </MicroLabel>

                      <div
                        className={cn(
                          'mt-3 truncate text-[18px] font-semibold tracking-[-0.045em]',
                          pageText(isLight),
                        )}
                      >
                        OK
                      </div>
                    </div>
                  </div>
                </Card>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}