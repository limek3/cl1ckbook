'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Copy,
  ExternalLink,
  Globe2,
  Link2,
  MessageCircle,
  Paperclip,
  Phone,
  Plus,
  Save,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import type { MasterProfile, MasterProfileFormValues } from '@/lib/types';
import { useApp } from '@/lib/app-context';
import { useLocale } from '@/lib/locale-context';
import { parseServices, slugify, cn } from '@/lib/utils';
import { getServiceSuggestions } from '@/lib/service-presets';
import { useAppearance } from '@/lib/appearance-context';
import { MasterAvatar } from '@/components/profile/master-avatar';
import { Button } from '@/components/ui/button';
import { HelpHint } from '@/components/ui/help-hint';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function createInitialValues(profile?: MasterProfile | null): MasterProfileFormValues {
  return {
    name: profile?.name ?? '',
    profession: profile?.profession ?? '',
    city: profile?.city ?? '',
    bio: profile?.bio ?? '',
    servicesText: profile?.services.join('\n') ?? '',
    phone: profile?.phone ?? '',
    telegram: profile?.telegram ?? '',
    whatsapp: profile?.whatsapp ?? '',
    hidePhone: profile?.hidePhone ?? false,
    hideTelegram: profile?.hideTelegram ?? false,
    hideWhatsapp: profile?.hideWhatsapp ?? false,
    slug: profile?.slug ?? '',
    avatar: profile?.avatar ?? '',
  };
}

function uniqueServices(items: string[]) {
  return Array.from(
    new Map(
      items
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => [item.toLowerCase(), item] as const),
    ).values(),
  );
}

function stringifyServices(items: string[]) {
  return uniqueServices(items).join('\n');
}

function getAvatarMeta(value: string, locale: 'ru' | 'en') {
  if (!value) return undefined;
  if (value.startsWith('data:image/')) {
    return locale === 'ru' ? 'Фото загружено с устройства' : 'Photo uploaded from device';
  }
  return value;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });
}

async function optimizeImage(file: File, maxSide = 720) {
  const source = await readFileAsDataUrl(file);
  const image = new Image();
  image.src = source;
  await image.decode();

  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return source;

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/webp', 0.9);
}

function PrivacyToggle({
  checked,
  onToggle,
  labels,
}: {
  checked: boolean;
  onToggle: () => void;
  labels: { visible: string; hidden: string };
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition',
        checked
          ? 'border-border/80 bg-background/80 text-muted-foreground'
          : 'border-primary/18 bg-primary/8 text-foreground',
      )}
    >
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full transition',
          checked ? 'bg-muted-foreground/45' : 'bg-primary',
        )}
      />
      {checked ? labels.hidden : labels.visible}
    </button>
  );
}

function SettingRow({
  label,
  caption,
  meta,
  children,
  className,
}: {
  label: ReactNode;
  caption?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0 rounded-[18px] border border-border/80 bg-card/82 p-3.5 md:p-4', className)}>
      <div className="flex min-w-0 flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">{label}</div>
          {caption ? <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{caption}</div> : null}
        </div>
      </div>
      <div className="mt-3 min-w-0 space-y-2">
        {children}
        {meta ? <div className="min-w-0 break-all text-[11px] leading-5 text-muted-foreground">{meta}</div> : null}
      </div>
    </div>
  );
}

function SectionShell({
  id,
  title,
  description,
  icon,
  children,
  contentClassName,
}: {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <section
      id={id}
      className="workspace-card workspace-card-hover scroll-mt-24 overflow-hidden rounded-[24px] p-5 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/80 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-[14px] border border-border/80 bg-accent/55 text-muted-foreground">
              {icon}
            </div>
            <div>
              <div className="text-[16px] font-semibold tracking-[-0.02em] text-foreground">{title}</div>
              <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={cn('mt-4 grid gap-3 md:gap-4', contentClassName)}>{children}</div>
    </section>
  );
}

function InfoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border/80 bg-accent/30 px-4 py-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[16px] font-semibold tracking-[-0.03em] text-foreground">{value}</div>
    </div>
  );
}

function PreviewPanel({
  profile,
  publicPath,
  labels,
  completionPercent,
  servicesCount,
  contactCount,
  onCopyLink,
  copied,
}: {
  profile: MasterProfile;
  publicPath: string;
  labels: {
    previewPanel: string;
    previewPanelDescription: string;
    publicLink: string;
    publicReady: string;
    openPreview: string;
    copyLink: string;
    copied: string;
    checklist: string;
    checklistDescription: string;
    cardPreview: string;
    miniPublicPage: string;
    servicesCount: string;
    contactsCount: string;
    fillRate: string;
    needs: string;
    ready: string;
    publicCardCaption: string;
    officeCardCaption: string;
    noContacts: string;
  };
}) {
  const readinessText = completionPercent >= 90 ? labels.ready : labels.needs;
  const contacts = [
    profile.phone ? 'Phone' : null,
    profile.telegram ? 'Telegram' : null,
    profile.whatsapp ? 'MAX' : null,
  ].filter(Boolean) as string[];

  return (
    <aside className="space-y-4 2xl:sticky 2xl:top-[84px] 2xl:self-start">
      <section className="workspace-card accent-gradient hero-grid rounded-[24px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold text-foreground">{labels.previewPanel}</div>
            <p className="mt-1 max-w-[320px] text-[12px] leading-5 text-muted-foreground">
              {labels.previewPanelDescription}
            </p>
          </div>
          <span className="chip-muted">{completionPercent}%</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 2xl:grid-cols-1 3xl:grid-cols-3">
          <InfoMetric label={labels.servicesCount} value={String(servicesCount)} />
          <InfoMetric label={labels.contactsCount} value={String(contactCount)} />
          <InfoMetric label={labels.fillRate} value={`${completionPercent}%`} />
        </div>

        <div className="mt-4 rounded-[20px] border border-border/80 bg-card/88 p-4 shadow-[var(--shadow-card)] backdrop-blur">
          <div className="flex items-start gap-3">
            <MasterAvatar name={profile.name} avatar={profile.avatar} className="h-14 w-14 rounded-[16px]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-[15px] font-semibold text-foreground">{profile.name}</div>
                <span className="chip-muted">{labels.publicReady}</span>
              </div>
              <div className="truncate text-[12px] text-muted-foreground">{profile.profession}</div>
              <div className="mt-1 truncate text-[12px] text-muted-foreground">{profile.city}</div>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-border/80 bg-accent/30 p-3">
            <div className="text-[11px] text-muted-foreground">{labels.miniPublicPage}</div>
            <div className="mt-3 rounded-[18px] border border-border/70 bg-card/90 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-[14px] border border-border/70 bg-accent/30 text-[12px] font-semibold text-foreground">
                  {profile.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? '')
                    .join('') || 'M'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-foreground">{profile.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{profile.profession}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.services.slice(0, 3).map((service) => (
                  <span key={service} className="chip-muted">
                    {service}
                  </span>
                ))}
              </div>

              <div className="mt-4 rounded-[14px] border border-border/70 bg-primary px-3 py-2 text-center text-[12px] font-medium text-primary-foreground">
                {labels.openPreview}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <div className="workspace-soft-panel flex items-center gap-3 px-4 py-3">
              <Link2 className="size-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-muted-foreground">{labels.publicLink}</div>
                <div className="truncate text-[12px] font-medium text-foreground">{publicPath}</div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild variant="outline">
                <Link href={publicPath}>
                  <ExternalLink className="size-4" />
                  {labels.openPreview}
                </Link>
              </Button>
              <Button type="button" onClick={onCopyLink}>
                <Copy className="size-4" />
                {copied ? labels.copied : labels.copyLink}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="workspace-card rounded-[22px] p-5">
        <div className="text-[15px] font-semibold text-foreground">{labels.checklist}</div>
        <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{labels.checklistDescription}</p>

        <div className="mt-4 space-y-3">
          {[
            { label: labels.cardPreview, ok: Boolean(profile.name && profile.profession && profile.city) },
            { label: labels.publicCardCaption, ok: servicesCount > 0 },
            { label: labels.officeCardCaption, ok: completionPercent >= 70 },
            { label: contacts.length > 0 ? contacts.join(' · ') : labels.noContacts, ok: contacts.length > 0 },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                'flex items-center justify-between gap-3 rounded-[16px] border px-4 py-3',
                item.ok
                  ? 'border-primary/20 bg-primary/10 text-foreground'
                  : 'border-border/80 bg-accent/30 text-muted-foreground',
              )}
            >
              <div className="text-[12px]">{item.label}</div>
              <div
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  item.ok ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground',
                )}
              >
                {item.ok ? labels.ready : labels.needs}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="workspace-card rounded-[22px] p-5">
        <div className="text-[15px] font-semibold text-foreground">{labels.publicReady}</div>
        <div className="mt-3 rounded-[18px] border border-border/80 bg-accent/30 p-4">
          <div className="text-[12px] leading-6 text-muted-foreground">
            {completionPercent >= 90
              ? labels.publicCardCaption
              : labels.officeCardCaption}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{readinessText}</span>
            <span>{completionPercent}%</span>
          </div>
        </div>
      </section>
    </aside>
  );
}

export function MasterProfileForm({
  initialProfile,
  mode,
  showOverviewCards = true,
  showHeader = true,
  showPreviewPanel = true,
}: {
  initialProfile?: MasterProfile | null;
  mode: 'create' | 'edit';
  showOverviewCards?: boolean;
  showHeader?: boolean;
  showPreviewPanel?: boolean;
}) {
  const router = useRouter();
  const { saveProfile, getPublicPath } = useApp();
  const { settings } = useAppearance();
  const { locale } = useLocale();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [values, setValues] = useState<MasterProfileFormValues>(() => createInitialValues(initialProfile));
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProfile?.slug));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customService, setCustomService] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    setValues(createInitialValues(initialProfile));
    setSlugTouched(Boolean(initialProfile?.slug));
    setCustomService('');
    setAvatarError(null);
  }, [initialProfile]);

  useEffect(() => {
    if (slugTouched) return;
    setValues((current) => ({ ...current, slug: slugify(current.name) }));
  }, [slugTouched, values.name]);

  const labels = locale === 'ru'
    ? {
        title: 'Профиль мастера',
        description:
          'Соберите страницу мастера так, чтобы клиенту было сразу понятно: кто вы, что делаете и как записаться.',
        general: 'Основное',
        content: 'Описание и услуги',
        contacts: 'Контакты',
        avatar: 'Фото мастера',
        avatarCaption: 'Загрузите аккуратное фото. Если оставить пусто, покажем инициалы.',
        avatarUpload: 'Загрузить фото',
        avatarReplace: 'Заменить фото',
        avatarRemove: 'Убрать',
        avatarUploading: 'Загружаем...',
        avatarReady: 'Фото загружено с устройства',
        avatarErrorInvalid: 'Нужен файл изображения: JPG, PNG или WebP.',
        avatarErrorGeneric: 'Не удалось обработать фото. Попробуйте другой файл.',
        avatarErrorTooLarge: 'Файл слишком большой. Лучше выбрать изображение до 5 МБ.',
        name: 'Имя',
        profession: 'Специализация',
        city: 'Город',
        slug: 'Ссылка',
        bio: 'О вас',
        services: 'Услуги',
        servicesCaption: 'Выбирайте из готовых вариантов или добавляйте свои.',
        servicesSelected: 'Выбрано',
        servicesPickerLabel: 'Популярные варианты',
        servicesAddCustom: 'Своя услуга',
        servicesCustomPlaceholder: 'Например: SPA-уход для рук',
        servicesAdd: 'Добавить',
        servicesEmpty: 'Пока ни одна услуга не выбрана.',
        phone: 'Телефон',
        telegram: 'Telegram',
        whatsapp: 'MAX',
        save: mode === 'create' ? 'Создать профиль' : 'Сохранить профиль',
        preview: 'Открыть страницу',
        back: 'К статистике',
        bioPlaceholder: 'Коротко расскажите о стиле работы, опыте и ощущении сервиса. 2–3 спокойных предложения достаточно.',
        accountCaption: 'Эти поля формируют карточку мастера в кабинете и на публичной странице.',
        contentCaption: 'Описание и услуги помогают клиенту понять, подходит ли ему ваш формат работы.',
        contactsCaption: 'Добавьте каналы, через которые удобно подтвердить запись или быстро ответить клиенту.',
        privacyTitle: 'Приватность контактов',
        privacyDescription: 'Можно скрыть отдельные контакты для клиента. На странице они будут показаны с аккуратным blur-эффектом и подписью, что контакт открывается после подтверждения.',
        privacyVisible: 'Виден клиенту',
        privacyHidden: 'Скрыт для клиента',
        privacyRevealed: 'Открывается после подтверждения',
        profileHealth: 'Готовность профиля',
        profileHealthDescription: 'Следите за заполнением и сразу проверяйте, как страница выглядит для клиента.',
        quickNav: 'Быстрый переход',
        quickNavDescription: 'Переходите к нужному блоку без длинного скролла.',
        accountSectionDescription: 'Имя, фото и адрес публичной страницы.',
        contentSectionDescription: 'Короткое описание мастера и список услуг.',
        contactsSectionDescription: 'Каналы для подтверждений и связи.',
        tipsTitle: 'Что усилит страницу',
        tips: [
          'Используйте чёткую специализацию вместо общей роли.',
          'Покажите 4–6 основных услуг — этого обычно достаточно.',
          'Короткое, спокойное описание работает лучше длинного полотна текста.',
        ],
        publicLink: 'Публичная ссылка',
        publicReady: 'Готово к приёму заявок',
        copyLink: 'Копировать ссылку',
        copied: 'Скопировано',
        previewPanel: 'Превью страницы',
        previewPanelDescription: 'Справа всегда видно, как данные складываются в карточку мастера и страницу записи.',
        checklist: 'Проверка перед публикацией',
        checklistDescription: 'Короткий чеклист помогает быстро довести страницу до аккуратного вида.',
        cardPreview: 'Карточка мастера заполнена',
        miniPublicPage: 'Мини-превью страницы',
        servicesCount: 'Услуг',
        contactsCount: 'Контактов',
        fillRate: 'Заполнение',
        needs: 'Нужно усилить',
        ready: 'Готово',
        publicCardCaption: 'Страница уже выглядит убедительно и её можно отправлять клиентам.',
        officeCardCaption: 'Добавьте ещё пару полей — и страница будет смотреться завершённо.',
        noContacts: 'Добавьте хотя бы один канал связи',
        badge: 'Редактор профиля',
        sectionAccount: 'Основное',
        sectionContent: 'Описание и услуги',
        sectionContacts: 'Контакты',
        slugHint: 'Ссылка собирается из имени автоматически, но её можно поправить вручную.',
        bioHint: 'Лучше всего работают короткие тексты с акцентом на стиль работы и удобство записи.',
        servicesHint: 'Добавьте в начало самые частые услуги — клиент увидит их первыми.',
        avatarHint: 'Лучше квадратное фото без мелких деталей. Оно аккуратнее смотрится в карточках.',
        openPreview: 'Открыть страницу',
      }
    : {
        title: 'Master profile',
        description:
          'Build the page so clients instantly understand who you are, what you offer, and how to book.',
        general: 'Core details',
        content: 'Description and services',
        contacts: 'Contacts',
        avatar: 'Master photo',
        avatarCaption: 'Upload a clean photo. If you skip it, the initials placeholder will be used.',
        avatarUpload: 'Upload photo',
        avatarReplace: 'Replace photo',
        avatarRemove: 'Remove',
        avatarUploading: 'Uploading...',
        avatarReady: 'Photo uploaded from device',
        avatarErrorInvalid: 'Please choose an image file: JPG, PNG, or WebP.',
        avatarErrorGeneric: 'Unable to process the image. Please try another file.',
        avatarErrorTooLarge: 'The file is too large. Please choose an image up to 5 MB.',
        name: 'Name',
        profession: 'Specialization',
        city: 'City',
        slug: 'Page link',
        bio: 'About you',
        services: 'Services',
        servicesCaption: 'Choose from the ready-made list or add your own.',
        servicesSelected: 'Selected',
        servicesPickerLabel: 'Popular options',
        servicesAddCustom: 'Custom service',
        servicesCustomPlaceholder: 'For example: SPA hand care',
        servicesAdd: 'Add',
        servicesEmpty: 'No services selected yet.',
        phone: 'Phone',
        telegram: 'Telegram',
        whatsapp: 'MAX',
        save: mode === 'create' ? 'Create profile' : 'Save profile',
        preview: 'Open page',
        back: 'Back to stats',
        bioPlaceholder: 'Describe your style, experience, and service feel in 2–3 calm sentences.',
        accountCaption: 'These fields define the master card in the workspace and on the public page.',
        contentCaption: 'Description and services help clients decide whether your style fits them.',
        contactsCaption: 'Add the channels you use for confirmations and quick replies.',
        privacyTitle: 'Contact privacy',
        privacyDescription: 'You can hide selected contacts from clients. On the page they stay visible as softly blurred cards and can be revealed after the booking is confirmed.',
        privacyVisible: 'Visible to clients',
        privacyHidden: 'Hidden from clients',
        privacyRevealed: 'Revealed after confirmation',
        profileHealth: 'Profile readiness',
        profileHealthDescription: 'Track completion and instantly see how the page looks to clients.',
        quickNav: 'Quick jump',
        quickNavDescription: 'Move to the right section without a long scroll.',
        accountSectionDescription: 'Name, photo, and public page address.',
        contentSectionDescription: 'Short master intro and visible services.',
        contactsSectionDescription: 'Channels for confirmations and follow-ups.',
        tipsTitle: 'What strengthens the page',
        tips: [
          'Use a clear specialization instead of a generic role.',
          'Show 4–6 key services for a balanced first impression.',
          'A short calm bio converts better than a long wall of text.',
        ],
        publicLink: 'Public link',
        publicReady: 'Ready for bookings',
        copyLink: 'Copy link',
        copied: 'Copied',
        previewPanel: 'Page preview',
        previewPanelDescription: 'The right side always shows how the profile turns into the master card and booking page.',
        checklist: 'Pre-publish check',
        checklistDescription: 'A short checklist helps you polish the page before sharing.',
        cardPreview: 'Master card is filled',
        miniPublicPage: 'Mini page preview',
        servicesCount: 'Services',
        contactsCount: 'Contacts',
        fillRate: 'Fill rate',
        needs: 'Needs work',
        ready: 'Ready',
        publicCardCaption: 'The page already looks convincing and can be shared with clients.',
        officeCardCaption: 'Add a few more fields and the page will feel complete.',
        noContacts: 'Add at least one contact channel',
        badge: 'Profile editor',
        sectionAccount: 'Core details',
        sectionContent: 'Description and services',
        sectionContacts: 'Contacts',
        slugHint: 'The link is generated from the name by default, but you can edit it manually.',
        bioHint: 'Short bios with a clear service feeling usually work best.',
        servicesHint: 'Put the most requested services first — clients notice them immediately.',
        avatarHint: 'Square photos with a clean crop work best inside cards.',
        openPreview: 'Open page',
      };

  const services = useMemo(() => uniqueServices(parseServices(values.servicesText)), [values.servicesText]);
  const suggestedServices = useMemo(
    () => getServiceSuggestions(values.profession, locale).filter((item) => !services.includes(item)),
    [locale, services, values.profession],
  );
  const avatarMeta = useMemo(() => getAvatarMeta(values.avatar, locale), [locale, values.avatar]);

  const previewProfile = useMemo<MasterProfile>(
    () => ({
      id: initialProfile?.id ?? 'preview',
      slug: slugify(values.slug || values.name) || 'master-preview',
      name: values.name || (locale === 'ru' ? 'Имя мастера' : 'Master name'),
      profession: values.profession || (locale === 'ru' ? 'Специализация' : 'Specialization'),
      city: values.city || (locale === 'ru' ? 'Город' : 'City'),
      bio: values.bio || (locale === 'ru' ? 'Краткое описание будущей страницы.' : 'Short summary for the upcoming page.'),
      services: services.length > 0 ? services : [locale === 'ru' ? 'Услуга' : 'Service'],
      phone: values.phone || undefined,
      telegram: values.telegram || undefined,
      whatsapp: values.whatsapp || undefined,
      hidePhone: values.hidePhone,
      hideTelegram: values.hideTelegram,
      hideWhatsapp: values.hideWhatsapp,
      avatar: values.avatar || undefined,
      createdAt: initialProfile?.createdAt ?? new Date().toISOString(),
    }),
    [initialProfile?.createdAt, initialProfile?.id, locale, services, values],
  );

  const publicPath = getPublicPath(previewProfile.slug);
  const contactCount = [values.phone, values.telegram, values.whatsapp].filter((item) => item.trim()).length;
  const completionItems = [
    values.name.trim(),
    values.profession.trim(),
    values.city.trim(),
    values.bio.trim(),
    slugify(values.slug || values.name),
    services.length > 0 ? 'services' : '',
    values.phone.trim() || values.telegram.trim() || values.whatsapp.trim(),
  ];
  const completionPercent = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);
  const currentScheme = locale === 'ru'
    ? settings.cardStyle === 'glass'
      ? 'glass'
      : settings.cardStyle === 'flat'
        ? 'flat'
        : 'soft'
    : settings.cardStyle;

  const updateServices = (nextServices: string[]) => {
    setValues((current) => ({ ...current, servicesText: stringifyServices(nextServices) }));
  };

  const addService = (service: string) => {
    const normalized = service.trim();
    if (!normalized) return;
    updateServices([...services, normalized]);
    setCustomService('');
  };

  const removeService = (service: string) => {
    updateServices(services.filter((item) => item !== service));
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError(labels.avatarErrorInvalid);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(labels.avatarErrorTooLarge);
      return;
    }

    setAvatarUploading(true);
    setAvatarError(null);

    try {
      const optimized = await optimizeImage(file);
      setValues((current) => ({ ...current, avatar: optimized }));
    } catch {
      setAvatarError(labels.avatarErrorGeneric);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const absoluteValue = typeof window === 'undefined' ? publicPath : `${window.location.origin}${publicPath}`;
      await navigator.clipboard.writeText(absoluteValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await saveProfile(values);
    if (!result.success || !result.profile) {
      setError(result.error || 'Unable to save profile');
      return;
    }

    setError(null);
    router.push('/dashboard/profile');
  };

  return (
    <div className="space-y-5">
      {showHeader ? (
        <section className="workspace-card accent-gradient hero-grid rounded-[24px] p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[760px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
                <Sparkles className="size-3.5" />
                {labels.badge}
              </div>
              <h2 className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-foreground md:text-[34px]">
                {labels.title}
              </h2>
              <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{labels.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoMetric label={labels.servicesCount} value={String(services.length)} />
              <InfoMetric label={labels.contactsCount} value={String(contactCount)} />
              <InfoMetric label={labels.fillRate} value={`${completionPercent}%`} />
            </div>
          </div>
        </section>
      ) : null}

      <div className={cn('grid gap-6', showPreviewPanel && '2xl:grid-cols-[minmax(0,1fr)_400px]')}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="workspace-card rounded-[22px] p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <div className="text-[15px] font-semibold text-foreground">{labels.profileHealth}</div>
                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {labels.profileHealthDescription}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip-muted">{currentScheme}</span>
                <span className="chip-muted">{completionPercent}%</span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(280px,1.1fr)]">
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoMetric label={labels.servicesCount} value={String(services.length)} />
                <InfoMetric label={labels.contactsCount} value={String(contactCount)} />
                <InfoMetric label={labels.fillRate} value={`${completionPercent}%`} />
              </div>

              <div className="rounded-[18px] border border-border/80 bg-accent/25 p-4">
                <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                  {labels.quickNav}
                  <HelpHint
                    content={labels.quickNavDescription}
                    className="h-5 w-5"
                    iconClassName="size-3.5"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href="#account" className="chip-muted">{labels.sectionAccount}</a>
                  <a href="#content" className="chip-muted">{labels.sectionContent}</a>
                  <a href="#contacts" className="chip-muted">{labels.sectionContacts}</a>
                  {showPreviewPanel ? <a href="#preview" className="chip-muted">{labels.preview}</a> : null}
                </div>
              </div>
            </div>
          </section>

          <SectionShell
            id="account"
            title={labels.general}
            description={labels.accountSectionDescription}
            icon={<UserRound className="size-4" />}
            contentClassName="md:grid-cols-2"
          >
            <SettingRow
              label={
                <>
                  {labels.avatar}
                  <HelpHint content={labels.avatarHint} className="h-5 w-5" iconClassName="size-3.5" />
                </>
              }
              caption={labels.avatarCaption}
              meta={avatarMeta}
              className="md:col-span-2 xl:col-span-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <div className="flex flex-col gap-3 rounded-[20px] border border-border/80 bg-accent/20 p-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <MasterAvatar name={previewProfile.name} avatar={values.avatar} className="h-16 w-16 rounded-[18px]" />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-foreground">{previewProfile.name}</div>
                    <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                      {avatarUploading ? labels.avatarUploading : values.avatar ? labels.avatarReady : labels.avatarCaption}
                    </div>
                    {avatarError ? <div className="mt-1 text-[12px] text-destructive">{avatarError}</div> : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={avatarUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="size-4" />
                    {values.avatar ? labels.avatarReplace : labels.avatarUpload}
                  </Button>

                  {values.avatar ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => {
                        setValues((current) => ({ ...current, avatar: '' }));
                        setAvatarError(null);
                      }}
                    >
                      <X className="size-4" />
                      {labels.avatarRemove}
                    </Button>
                  ) : null}
                </div>
              </div>
            </SettingRow>

            <SettingRow label={labels.name}>
              <Input
                value={values.name}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder={labels.name}
              />
            </SettingRow>

            <SettingRow label={labels.profession}>
              <Input
                value={values.profession}
                onChange={(event) => setValues((current) => ({ ...current, profession: event.target.value }))}
                placeholder={labels.profession}
              />
            </SettingRow>

            <SettingRow label={labels.city}>
              <Input
                value={values.city}
                onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))}
                placeholder={labels.city}
              />
            </SettingRow>

            <SettingRow
              label={
                <>
                  {labels.slug}
                  <HelpHint content={labels.slugHint} className="h-5 w-5" iconClassName="size-3.5" />
                </>
              }
              caption={labels.accountCaption}
              meta={
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip-muted">{publicPath}</span>
                </div>
              }
              className="xl:col-span-2"
            >
              <Input
                value={values.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setValues((current) => ({ ...current, slug: slugify(event.target.value) }));
                }}
                placeholder="anna-nails"
              />
            </SettingRow>
          </SectionShell>

          <SectionShell
            id="content"
            title={labels.content}
            description={labels.contentSectionDescription}
            icon={<Sparkles className="size-4" />}
            contentClassName="xl:grid-cols-2"
          >
            <SettingRow
              label={
                <>
                  {labels.bio}
                  <HelpHint content={labels.bioHint} className="h-5 w-5" iconClassName="size-3.5" />
                </>
              }
              caption={labels.contentCaption}
              meta={`${values.bio.trim().length} ${locale === 'ru' ? 'симв.' : 'chars'}`}
            >
              <Textarea
                value={values.bio}
                onChange={(event) => setValues((current) => ({ ...current, bio: event.target.value }))}
                placeholder={labels.bioPlaceholder}
                className="min-h-36"
              />
            </SettingRow>

            <SettingRow
              label={
                <>
                  {labels.services}
                  <HelpHint content={labels.servicesHint} className="h-5 w-5" iconClassName="size-3.5" />
                </>
              }
              caption={labels.servicesCaption}
              meta={`${services.length} ${labels.servicesCount.toLowerCase()}`}
            >
              <div className="space-y-3">
                <div className="rounded-[18px] border border-border/80 bg-background/60 p-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {labels.servicesSelected}
                  </div>
                  {services.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {services.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => removeService(service)}
                          className="inline-flex items-center gap-2 rounded-full border border-primary/16 bg-primary/10 px-3 py-2 text-[13px] font-medium text-foreground transition hover:border-primary/24 hover:bg-primary/12"
                        >
                          <span>{service}</span>
                          <X className="size-3.5 text-primary" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-[13px] text-muted-foreground">{labels.servicesEmpty}</div>
                  )}
                </div>

                <div className="rounded-[18px] border border-border/80 bg-accent/16 p-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {labels.servicesPickerLabel}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestedServices.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => addService(service)}
                        className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/78 px-3 py-2 text-[13px] text-foreground transition hover:border-primary/22 hover:bg-primary/10"
                      >
                        <Plus className="size-3.5 text-primary" />
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[18px] border border-dashed border-border/80 bg-background/56 p-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {labels.servicesAddCustom}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={customService}
                      onChange={(event) => setCustomService(event.target.value)}
                      placeholder={labels.servicesCustomPlaceholder}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addService(customService);
                        }
                      }}
                    />
                    <Button type="button" className="rounded-full sm:min-w-[132px]" onClick={() => addService(customService)}>
                      <Plus className="size-4" />
                      {labels.servicesAdd}
                    </Button>
                  </div>
                </div>
              </div>
            </SettingRow>
          </SectionShell>

          <SectionShell
            id="contacts"
            title={labels.contacts}
            description={labels.contactsSectionDescription}
            icon={<MessageCircle className="size-4" />}
            contentClassName="md:grid-cols-2 xl:grid-cols-3"
          >
            <SettingRow
              label={labels.phone}
              caption={labels.privacyTitle}
              meta={values.phone ? <span className="chip-muted">{values.phone}</span> : undefined}
            >
              <Input
                value={values.phone}
                onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+31 6 1234 5678"
              />
              <PrivacyToggle
                checked={values.hidePhone}
                onToggle={() => setValues((current) => ({ ...current, hidePhone: !current.hidePhone }))}
                labels={{ visible: labels.privacyVisible, hidden: labels.privacyHidden }}
              />
            </SettingRow>

            <SettingRow label={labels.telegram} meta={values.telegram ? <span className="chip-muted">{values.telegram}</span> : undefined}>
              <Input
                value={values.telegram}
                onChange={(event) => setValues((current) => ({ ...current, telegram: event.target.value }))}
                placeholder="@handle"
              />
              <PrivacyToggle
                checked={values.hideTelegram}
                onToggle={() => setValues((current) => ({ ...current, hideTelegram: !current.hideTelegram }))}
                labels={{ visible: labels.privacyVisible, hidden: labels.privacyHidden }}
              />
            </SettingRow>

            <SettingRow label={labels.whatsapp} meta={values.whatsapp ? <span className="chip-muted">{values.whatsapp}</span> : undefined}>
              <Input
                value={values.whatsapp}
                onChange={(event) => setValues((current) => ({ ...current, whatsapp: event.target.value }))}
                placeholder="@anna.max"
              />
              <PrivacyToggle
                checked={values.hideWhatsapp}
                onToggle={() => setValues((current) => ({ ...current, hideWhatsapp: !current.hideWhatsapp }))}
                labels={{ visible: labels.privacyVisible, hidden: labels.privacyHidden }}
              />
            </SettingRow>

            <div className="md:col-span-2 xl:col-span-3 rounded-[18px] border border-border/80 bg-accent/18 p-4">
              <div className="text-[13px] font-medium text-foreground">{labels.privacyTitle}</div>
              <p className="mt-1 max-w-[720px] text-[12px] leading-5 text-muted-foreground">{labels.privacyDescription}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  values.phone ? `${labels.phone}: ${values.hidePhone ? labels.privacyHidden : labels.privacyVisible}` : null,
                  values.telegram ? `${labels.telegram}: ${values.hideTelegram ? labels.privacyHidden : labels.privacyVisible}` : null,
                  values.whatsapp ? `${labels.whatsapp}: ${values.hideWhatsapp ? labels.privacyHidden : labels.privacyVisible}` : null,
                ].filter(Boolean).map((item) => (
                  <span key={String(item)} className="chip-muted">{item}</span>
                ))}
              </div>
            </div>
          </SectionShell>

          {showOverviewCards ? (
            <section className="workspace-card rounded-[22px] p-5">
              <div className="text-[15px] font-semibold text-foreground">{labels.tipsTitle}</div>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {labels.tips.map((tip) => (
                  <div key={tip} className="rounded-[18px] border border-border/80 bg-accent/25 p-4 text-[13px] leading-6 text-muted-foreground">
                    {tip}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {error ? (
            <div className="rounded-[16px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12px] text-destructive">
              {error}
            </div>
          ) : null}

          <div className="workspace-card rounded-[22px] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="ghost">
                <Link href="/dashboard">
                  <ArrowRight className="size-4 rotate-180" />
                  {labels.back}
                </Link>
              </Button>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={handleCopyLink}>
                  <Copy className="size-4" />
                  {copied ? labels.copied : labels.copyLink}
                </Button>
                <Button asChild variant="outline">
                  <Link href={publicPath}>
                    <Globe2 className="size-4" />
                    {labels.preview}
                  </Link>
                </Button>
                <Button type="submit">
                  <Save className="size-4" />
                  {labels.save}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {showPreviewPanel ? (
          <div id="preview">
            <PreviewPanel
              profile={previewProfile}
              publicPath={publicPath}
              labels={{
                previewPanel: labels.previewPanel,
                previewPanelDescription: labels.previewPanelDescription,
                publicLink: labels.publicLink,
                publicReady: labels.publicReady,
                openPreview: labels.openPreview,
                copyLink: labels.copyLink,
                copied: labels.copied,
                checklist: labels.checklist,
                checklistDescription: labels.checklistDescription,
                cardPreview: labels.cardPreview,
                miniPublicPage: labels.miniPublicPage,
                servicesCount: labels.servicesCount,
                contactsCount: labels.contactsCount,
                fillRate: labels.fillRate,
                needs: labels.needs,
                ready: labels.ready,
                publicCardCaption: labels.publicCardCaption,
                officeCardCaption: labels.officeCardCaption,
                noContacts: labels.noContacts,
              }}
              completionPercent={completionPercent}
              servicesCount={services.length}
              contactCount={contactCount}
              onCopyLink={handleCopyLink}
              copied={copied}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
