'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { Globe2, MapPin, MessageCircle, Phone, Star } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useLocale } from '@/lib/locale-context';
import { useAppearance, type AppearanceSettings } from '@/lib/appearance-context';
import { applyAppearanceToElement, normalizeAppearanceSettings } from '@/lib/appearance';
import { MasterAvatar } from '@/components/profile/master-avatar';
import { BookingForm } from '@/components/booking/booking-form';
import { SiteHeader } from '@/components/shared/site-header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getMaxHref, getPhoneHref, getTelegramHref } from '@/lib/contact-links';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
import type { MasterProfile } from '@/lib/types';
import { getPublicButtonClassName } from '@/lib/appearance';
import { accentPalette } from '@/lib/appearance-palette';

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={cn('size-4', index < Math.round(value) ? 'fill-current workspace-gold' : 'text-foreground/15')} />
      ))}
    </div>
  );
}

function ContactCard({
  label,
  value,
  href,
  icon,
  compact = false,
  hidden = false,
  hiddenLabel,
}: {
  label: string;
  value: string;
  href?: string;
  icon: ReactNode;
  compact?: boolean;
  hidden?: boolean;
  hiddenLabel?: string;
}) {
  const content = (
    <div className={cn('workspace-link-card relative flex items-center gap-3 transition', compact ? 'px-3 py-2.5' : 'px-4 py-3')}>
      <div className="flex size-10 items-center justify-center rounded-[12px] border border-border bg-card text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className={cn('truncate text-[13px] font-medium text-foreground transition', hidden && 'select-none blur-[6px]')}>{value}</div>
      </div>
      {hidden ? (
        <span className="pointer-events-none absolute inset-y-2 right-2 inline-flex items-center rounded-full border border-border/80 bg-background/92 px-2.5 text-[10px] font-medium text-muted-foreground shadow-sm">
          {hiddenLabel}
        </span>
      ) : null}
    </div>
  );

  if (!href || hidden) return content;
  const external = href.startsWith('https://');
  return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{content}</a>;
}


function buildSectionClass(settings: AppearanceSettings) {
  if (settings.publicSectionStyle === 'minimal') {
    return 'rounded-[18px] border border-border/60 bg-transparent p-4 md:p-5 shadow-none';
  }

  if (settings.publicSectionStyle === 'dividers') {
    return 'rounded-[18px] border border-border bg-card/78 p-4 md:p-5 shadow-[var(--shadow-soft)]';
  }

  return 'workspace-card rounded-[18px] p-5';
}

export function PublicMasterPage({
  slug,
  isDemo = false,
}: {
  slug: string;
  isDemo?: boolean;
}) {
  const { hasHydrated, getDemoProfileBySlug, getPublicPath } = useApp();
  const { locale } = useLocale();
  const { settings: localSettings } = useAppearance();
  const isMobile = useMobile();
  const [remoteProfile, setRemoteProfile] = useState<MasterProfile | null>(null);
  const [remoteAppearance, setRemoteAppearance] = useState<AppearanceSettings | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(!isDemo);

  useEffect(() => {
    if (isDemo) return;

    let active = true;
    setRemoteLoading(true);

    fetch(`/api/public/${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ profile: MasterProfile; appearance?: Partial<AppearanceSettings> | null }>;
      })
      .then((payload) => {
        if (!active) return;
        setRemoteProfile(payload?.profile ?? null);
        setRemoteAppearance(normalizeAppearanceSettings(payload?.appearance ?? null));
      })
      .catch(() => {
        if (!active) return;
        setRemoteProfile(null);
      })
      .finally(() => {
        if (active) {
          setRemoteLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isDemo, slug]);

  useEffect(() => {
    if (!remoteAppearance || isDemo || typeof document === 'undefined') return;
    applyAppearanceToElement(document.documentElement, remoteAppearance);
  }, [isDemo, remoteAppearance]);

  const settings = remoteAppearance ?? localSettings;
  const profile = isDemo ? getDemoProfileBySlug(slug) : remoteProfile;
  const publicPath = profile ? getPublicPath(profile.slug) : null;

  const labels = locale === 'ru'
    ? {
        notFound: 'Профиль не найден',
        back: 'Вернуться в рабочее пространство',
        faqTitle: 'Частые вопросы',
        reviewsTitle: 'Отзывы',
        contactsTitle: 'Контакты',
        worksTitle: 'Мои работы',
        worksHint: 'Небольшая галерея, которую можно свернуть или открыть полностью.',
        secure: 'Все данные заявки сохраняются в кабинете мастера.',
        demoBadge: 'Демо',
        bookingTitle: 'Онлайн-запись',
        loading: 'Загружаем страницу мастера…',
        call: 'Позвонить',
        whatsapp: 'MAX',
        telegram: 'Telegram',
        quickActions: 'Быстрые действия',
        hiddenContact: 'После подтверждения',
      }
    : {
        notFound: 'Profile not found',
        back: 'Back to workspace',
        faqTitle: 'FAQ',
        reviewsTitle: 'Reviews',
        contactsTitle: 'Contacts',
        worksTitle: 'My work',
        worksHint: 'A compact gallery that can be collapsed or expanded.',
        secure: 'All request details are saved in the master dashboard.',
        demoBadge: 'Demo',
        bookingTitle: 'Online booking',
        loading: 'Loading the master page…',
        call: 'Call',
        whatsapp: 'MAX',
        telegram: 'Telegram',
        quickActions: 'Quick actions',
        hiddenContact: 'After confirmation',
      };

  const accent = accentPalette[settings.publicAccent];
  const publicAccentStyle = {
    ['--accent-hue' as string]: accent.hue,
    ['--accent-sat' as string]: accent.sat,
    ['--accent-solid' as string]: accent.solid,
    ['--accent-hover' as string]: accent.solid,
    ['--accent-gradient' as string]: accent.gradient,
    ['--accent-soft' as string]: accent.soft,
    ['--primary' as string]: accent.solid,
    ['--primary-hover' as string]: accent.solid,
    ['--gradient-primary' as string]: accent.gradient,
    ['--ring' as string]: `${accent.solid}2e`,
  } as CSSProperties;

  if (!isDemo && !hasHydrated) {
    return (
      <div className="min-h-screen bg-background text-foreground" style={publicAccentStyle}>
        <SiteHeader compact />
        <div className={cn('workspace-page', isMobile && '!px-2 !pt-2 !pb-[calc(88px+env(safe-area-inset-bottom))]')}>
          <div className="workspace-card rounded-[18px] p-8">
            <div className="animate-pulse">
              <div className="h-4 w-48 rounded-full bg-accent/70" />
              <div className="mt-4 h-10 w-full rounded-[18px] bg-accent/50" />
              <div className="mt-3 h-10 w-10 rounded-[12px] bg-accent/45" />
              <div className="mt-6 h-3 w-56 rounded-full bg-accent/55" />
            </div>
            <div className="mt-5 text-[13px] text-muted-foreground">{labels.loading}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground" style={publicAccentStyle}>
        <SiteHeader compact />
        <div className={cn('workspace-page', isMobile && '!px-2 !pt-2 !pb-[calc(88px+env(safe-area-inset-bottom))]')}>
          <div className="workspace-card rounded-[18px] p-8 text-center">
            <div className="text-[22px] font-semibold text-foreground">{labels.notFound}</div>
            <div className="mt-4">
              <Button asChild className={getPublicButtonClassName(settings.publicButtonStyle, 'secondary')} variant="outline">
                <Link href="/">{labels.back}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const reviews = profile.reviews ?? [];
  const works = profile.workGallery ?? [];
  const rating = profile.rating ?? 4.9;
  const heroClass = settings.publicCover === 'minimal'
    ? 'bg-card/84'
    : settings.publicCover === 'portrait'
      ? 'hero-grid accent-gradient'
      : 'accent-gradient hero-grid';

  const heroLayoutClass = settings.publicHeroLayout === 'centered'
    ? 'flex flex-col items-center text-center'
    : settings.publicHeroLayout === 'compact'
      ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]'
      : cn('flex flex-wrap items-start justify-between', isMobile ? 'gap-3' : 'gap-4');

  const introClass = settings.publicHeroLayout === 'centered'
    ? 'flex min-w-0 flex-col items-center gap-4'
    : cn('flex min-w-0 items-start', isMobile ? 'gap-3' : 'gap-4');

  const compactHero = settings.publicHeroLayout === 'compact';
  const sectionClass = buildSectionClass(settings);
  const surfaceClass = settings.publicSurface === 'glass'
    ? 'backdrop-blur-xl bg-card/76'
    : settings.publicSurface === 'contrast'
      ? 'bg-card shadow-[var(--shadow-card)]'
      : 'bg-card/88 shadow-[var(--shadow-soft)]';

  const serviceLayoutClass = settings.publicServicesStyle === 'chips'
    ? 'mt-5 flex flex-wrap gap-2'
    : settings.publicServicesStyle === 'stacked'
      ? 'mt-5 grid gap-2'
      : 'mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3';

  const serviceCardClass = settings.publicServicesStyle === 'chips'
    ? 'chip-muted'
    : settings.publicServicesStyle === 'stacked'
      ? cn('rounded-[16px] border px-4 py-3 text-[13px] text-foreground', settings.publicSurface === 'contrast' ? 'border-primary/16 bg-primary/8' : 'border-border bg-accent/25')
      : cn('rounded-[14px] border px-3.5 py-3 text-[13px] text-foreground', settings.publicSurface === 'contrast' ? 'border-primary/16 bg-primary/8' : 'border-border bg-accent/30');

  const galleryClass = settings.publicGalleryStyle === 'compact'
    ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4'
    : settings.publicGalleryStyle === 'editorial'
      ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'
      : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3';

  const primaryActionClass = getPublicButtonClassName(settings.publicButtonStyle, 'primary');
  const secondaryActionClass = getPublicButtonClassName(settings.publicButtonStyle, 'secondary');
  const quickActions = [
    profile.phone && !profile.hidePhone
      ? { label: labels.call, href: getPhoneHref(profile.phone), icon: <Phone className="size-4" />, primary: true }
      : null,
    profile.whatsapp && !profile.hideWhatsapp
      ? {
          label: labels.whatsapp,
          href: getMaxHref(
            profile.whatsapp,
            locale === 'ru'
              ? `Здравствуйте! Хочу уточнить запись к ${profile.name}.`
              : `Hello! I would like to clarify a booking with ${profile.name}.`,
          ),
          icon: <MessageCircle className="size-4" />,
          primary: true,
          external: true,
        }
      : null,
    profile.telegram && !profile.hideTelegram
      ? { label: labels.telegram, href: getTelegramHref(profile.telegram), icon: <Globe2 className="size-4" />, primary: false, external: true }
      : null,
  ].filter(Boolean) as Array<{ label: string; href?: string; icon: ReactNode; primary: boolean; external?: boolean }>;
  const quickActionsToRender = isMobile ? quickActions.slice(0, 2) : quickActions;
  const servicesToRender = isMobile ? profile.services.slice(0, 4) : profile.services;

  return (
    <div className="min-h-screen bg-background text-foreground" style={publicAccentStyle}>
      <SiteHeader compact />
      <div className={cn('workspace-page', isMobile && '!px-2 !pt-2 !pb-[calc(88px+env(safe-area-inset-bottom))]')}>
        <div className={cn('grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_372px]', isMobile && 'gap-3')}>
          <div className={cn('space-y-5', isMobile && 'space-y-3')}>
            <section
              className={cn(
                'rounded-[24px] border p-4 md:p-6',
                heroClass,
                surfaceClass,
                settings.publicCardStyle === 'editorial' && 'border-primary/20',
                settings.publicCardStyle === 'compact' && 'p-4 md:p-5',
              )}
            >
              <div className={cn('border-b border-border pb-4 md:pb-5', heroLayoutClass)}>
                <div className={introClass}>
                  <MasterAvatar name={profile.name} avatar={profile.avatar} className={cn(compactHero ? 'h-16 w-16 rounded-[18px]' : isMobile ? 'h-14 w-14 rounded-[16px]' : 'h-20 w-20 rounded-[22px]')} />
                  <div className={cn('min-w-0', settings.publicHeroLayout === 'centered' && 'flex flex-col items-center')}>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className={cn('truncate font-semibold tracking-[-0.03em] text-foreground', compactHero ? 'text-[24px]' : isMobile ? 'text-[19px]' : 'text-[28px]')}>
                        {profile.name}
                      </h1>
                      {isDemo ? <Badge variant="outline">{labels.demoBadge}</Badge> : null}
                    </div>
                    <div className="mt-1 text-[13px] text-muted-foreground md:text-[14px]">{profile.profession}</div>
                    <div className={cn('mt-3 flex flex-wrap items-center gap-2', settings.publicHeroLayout === 'centered' && 'justify-center')}>
                      <Badge variant="outline">
                        <MapPin className="size-3.5" />
                        {profile.city}
                      </Badge>
                      {profile.priceHint ? <Badge variant="outline">{profile.priceHint}</Badge> : null}
                      {profile.experienceLabel ? <Badge variant="outline">{profile.experienceLabel}</Badge> : null}
                    </div>
                  </div>
                </div>

                <div className={cn('rounded-[16px] border border-border px-3 py-2.5 md:px-4', settings.publicHeroLayout === 'centered' ? 'mt-4' : compactHero ? 'self-start' : '', settings.publicSurface === 'contrast' ? 'bg-primary/8' : 'bg-accent/30', isMobile && 'w-full')}>
                  <RatingStars value={rating} />
                  <div className="mt-2 text-[13px] text-foreground">{rating.toFixed(1)} · {profile.reviewCount ?? reviews.length}</div>
                  <div className="text-[11px] text-muted-foreground">{profile.responseTime || labels.secure}</div>
                </div>
              </div>

              <p className={cn('max-w-[760px] text-[13px] text-muted-foreground md:text-[14px] md:leading-7', compactHero ? 'mt-3' : 'mt-3 md:mt-5', settings.publicHeroLayout === 'centered' && 'mx-auto text-center', isMobile ? 'line-clamp-3 leading-5' : 'leading-6')}>
                {profile.bio}
              </p>

              {quickActionsToRender.length > 0 ? (
                <div className={cn('mt-4 grid gap-2 sm:flex sm:flex-wrap', isMobile ? 'grid-cols-2' : '', settings.publicHeroLayout === 'centered' && 'justify-center')}>
                  <div className="sr-only">{labels.quickActions}</div>
                  {quickActionsToRender.map((action) => (
                    <Button
                      key={action.label}
                      asChild
                      variant={action.primary ? 'default' : 'outline'}
                      size="sm"
                      className={cn(isMobile ? 'h-10 text-[13px]' : '', 'w-full justify-center sm:w-auto', action.primary ? primaryActionClass : secondaryActionClass)}
                    >
                      <a href={action.href} target={action.external ? '_blank' : undefined} rel={action.external ? 'noreferrer' : undefined}>
                        {action.icon}
                        {action.label}
                      </a>
                    </Button>
                  ))}
                </div>
              ) : null}

              <div className={serviceLayoutClass}>
                {servicesToRender.map((service) => (
                  <div key={service} className={cn(serviceCardClass, isMobile && 'text-[12.5px]')}>
                    {service}
                  </div>
                ))}
              </div>
            </section>

            {isMobile ? (
              <section className={cn(sectionClass, surfaceClass)}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="text-[16px] font-semibold text-foreground">{labels.bookingTitle}</div>
                  <Badge variant="outline">{locale === 'ru' ? 'Онлайн' : 'Online'}</Badge>
                </div>
                <BookingForm profile={profile} embedded />
              </section>
            ) : null}

            <section className="grid gap-4 md:gap-5 lg:grid-cols-2">
              <div className={cn(sectionClass, surfaceClass)}>
                <div className="text-[16px] font-semibold text-foreground">{labels.contactsTitle}</div>
                <div className="mt-3 grid gap-2">
                  {profile.phone ? <ContactCard compact={settings.publicSectionStyle !== 'cards'} label={locale === 'ru' ? 'Телефон' : 'Phone'} value={profile.phone} href={profile.hidePhone ? undefined : getPhoneHref(profile.phone)} hidden={Boolean(profile.hidePhone)} hiddenLabel={labels.hiddenContact} icon={<Phone className="size-4" />} /> : null}
                  {profile.whatsapp ? <ContactCard compact={settings.publicSectionStyle !== 'cards'} label="MAX" value={profile.whatsapp} href={profile.hideWhatsapp ? undefined : getMaxHref(profile.whatsapp, locale === 'ru' ? `Здравствуйте! Хочу уточнить запись к ${profile.name}.` : `Hello! I would like to clarify a booking with ${profile.name}.`)} hidden={Boolean(profile.hideWhatsapp)} hiddenLabel={labels.hiddenContact} icon={<MessageCircle className="size-4" />} /> : null}
                  {profile.telegram ? <ContactCard compact={settings.publicSectionStyle !== 'cards'} label={locale === 'ru' ? 'Телеграм' : 'Telegram'} value={profile.telegram} href={profile.hideTelegram ? undefined : getTelegramHref(profile.telegram)} hidden={Boolean(profile.hideTelegram)} hiddenLabel={labels.hiddenContact} icon={<Globe2 className="size-4" />} /> : null}
                </div>
              </div>

              <div className={cn(sectionClass, surfaceClass)}>
                <div className="text-[16px] font-semibold text-foreground">{labels.faqTitle}</div>
                <Accordion type="single" collapsible className="mt-2">
                  {[
                    {
                      id: 'faq-1',
                      q: locale === 'ru' ? 'Как быстро подтверждается запись?' : 'How quickly is the booking confirmed?',
                      a: locale === 'ru' ? 'Заявка сразу попадает в кабинет мастера. Подтверждение приходит напрямую по указанному номеру.' : 'The request lands in the master dashboard immediately. Confirmation is sent directly to the provided phone number.',
                    },
                    {
                      id: 'faq-2',
                      q: locale === 'ru' ? 'Можно ли указать пожелания?' : 'Can I leave preferences?',
                      a: locale === 'ru' ? 'Да, в последнем шаге формы есть поле комментария для оттенка, длины или удобного времени.' : 'Yes. The final booking step includes a note field for shade, length or timing preferences.',
                    },
                    {
                      id: 'faq-3',
                      q: locale === 'ru' ? 'Где находится публичная ссылка?' : 'Where is the public link?',
                      a: publicPath ?? getPublicPath(profile.slug),
                    },
                  ].map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger>{item.q}</AccordionTrigger>
                      <AccordionContent>{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>

            {works.length > 0 ? (
              <section className={cn(sectionClass, surfaceClass)}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[16px] font-semibold text-foreground">{labels.worksTitle}</div>
                    <div className="mt-1 text-[12px] text-muted-foreground">{labels.worksHint}</div>
                  </div>
                  <Badge variant="outline">{works.length}</Badge>
                </div>

                <Accordion type="single" collapsible defaultValue="works-gallery" className="mt-3">
                  <AccordionItem value="works-gallery">
                    <AccordionTrigger>{labels.worksTitle}</AccordionTrigger>
                    <AccordionContent>
                      <div className={galleryClass}>
                        {works.map((work, index) => (
                          <div
                            key={work.id}
                            className={cn(
                              'group overflow-hidden rounded-[18px] border border-border bg-accent/20',
                              settings.publicGalleryStyle === 'editorial' && index === 0 && 'sm:row-span-2',
                            )}
                          >
                            <div
                              className={cn(
                                'overflow-hidden bg-accent/30',
                                settings.publicGalleryStyle === 'compact' ? 'aspect-square' : settings.publicGalleryStyle === 'editorial' && index === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]',
                              )}
                            >
                              <img src={work.image} alt={work.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                            </div>
                            <div className="p-3">
                              <div className="text-[13px] font-medium text-foreground">{work.title}</div>
                              {work.note ? <div className="mt-1 text-[10.5px] text-muted-foreground">{work.note}</div> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
            ) : null}

            {reviews.length > 0 ? (
              <section className={cn(sectionClass, surfaceClass)}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[16px] font-semibold text-foreground">{labels.reviewsTitle}</div>
                  <Badge variant="outline">{reviews.length}</Badge>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className={cn(
                        'rounded-[16px] border px-4 py-4',
                        settings.publicSectionStyle === 'minimal' ? 'border-border/60 bg-transparent' : 'border-border bg-accent/20',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[12px] font-semibold text-foreground">{review.author}</div>
                          <div className="text-[11px] text-muted-foreground">{review.service}</div>
                        </div>
                        <RatingStars value={review.rating} />
                      </div>
                      <p className="mt-3 text-[13px] leading-6 text-muted-foreground">{review.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className={cn('hidden xl:block xl:sticky xl:top-[84px] xl:self-start xl:max-h-[calc(100vh-112px)] xl:overflow-y-auto', settings.publicBookingStyle === 'step' && '2xl:top-[96px]')}>
            <section className={cn(sectionClass, surfaceClass)}>
              <BookingForm profile={profile} embedded />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
