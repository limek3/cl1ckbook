// components/marketing/about-product-page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Globe2,
  Layers3,
  MessageCircleMore,
  Palette,
  Repeat2,
  Send,
  Sparkles,
  Star,
  UserRound,
  Users2,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

import { BrandLogo } from '@/components/brand/brand-logo';
import { SiteHeader } from '@/components/shared/site-header';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

type Locale = 'ru' | 'en';

type IconCard = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const ru = {
  heroBadge: 'Платформа для мастера',
  heroTitle: 'Онлайн-запись, клиенты и каналы связи в одном кабинете.',
  heroText:
    'ClickBook помогает мастеру принимать записи, не терять клиентов из web, Telegram и VK, вести карточки клиентов и возвращать людей на повторный визит.',
  primaryCta: 'Войти в кабинет',
  secondaryCta: 'Посмотреть демо',
  publicCta: 'Публичная страница',
  quickStats: [
    ['1 ссылка', 'для записи и профиля'],
    ['3 канала', 'web, Telegram, VK'],
    ['1 база', 'все клиенты внутри'],
  ] as const,
  flowKicker: 'Как работает',
  flowTitle: 'Один понятный путь клиента',
  flowText:
    'Клиент может записаться через публичную страницу, Telegram, VK или просто оставить телефон. Для мастера всё выглядит одинаково — запись, карточка клиента и следующее действие.',
  flow: [
    {
      icon: Globe2,
      title: 'Web-заявка',
      text: 'Клиент открывает ссылку мастера, выбирает услугу, время и оставляет контакты.',
    },
    {
      icon: Send,
      title: 'Telegram',
      text: 'Запись, подтверждения, напоминания и быстрые действия работают через бота и Mini App.',
    },
    {
      icon: MessageCircleMore,
      title: 'VK',
      text: 'Клиент может прийти через VK, а мастер продолжит работу в том же кабинете.',
    },
    {
      icon: UserRound,
      title: 'Карточка клиента',
      text: 'Внутри собираются телефон, канал связи, записи, заметки, статусы и история.',
    },
  ] satisfies IconCard[],
  productKicker: 'Продукт',
  productTitle: 'Что внутри ClickBook',
  productText:
    'Не набор отдельных страниц, а рабочая цепочка: ссылка → запись → клиент → коммуникация → визит → отзыв → повторная запись.',
  product: [
    {
      icon: Globe2,
      title: 'Публичная страница мастера',
      text: 'Фото, описание, услуги, портфолио, отзывы, адрес и кнопка записи в одном аккуратном профиле.',
    },
    {
      icon: CalendarClock,
      title: 'Запись и график',
      text: 'Клиент выбирает услугу и свободное окно, а мастер видит рабочий день без хаоса в сообщениях.',
    },
    {
      icon: Users2,
      title: 'База клиентов',
      text: 'Каждый клиент попадает в базу, даже если он пришёл только с web-формы и без Telegram/VK.',
    },
    {
      icon: MessageCircleMore,
      title: 'Чаты и каналы',
      text: 'Web, Telegram и VK приводятся к одной логике, чтобы не плодить разные карточки одного человека.',
    },
    {
      icon: Bell,
      title: 'Напоминания и действия',
      text: 'Подтверждение, перенос, ручная связь по телефону и сценарии после записи становятся понятными.',
    },
    {
      icon: Repeat2,
      title: 'Отзывы и повтор',
      text: 'После визита можно запросить отзыв, отметить результат и вернуть клиента на следующую запись.',
    },
  ] satisfies IconCard[],
  audienceKicker: 'Аудитория',
  audienceTitle: 'Для кого это сделано',
  audienceText:
    'ClickBook лучше всего подходит тем, кому нужна красивая онлайн-запись и клиентская база без тяжёлой CRM.',
  audience: [
    'Маникюр и педикюр',
    'Брови и ресницы',
    'Барберы и стилисты',
    'Массаж и SPA',
    'Тату-мастера',
    'Тренеры и занятия',
    'Психологи и коучи',
    'Фотографы и эксперты',
  ],
  compareKicker: 'Фокус',
  compareTitle: 'Не CRM-комбайн. Рабочий кабинет мастера.',
  compareText:
    'DIKIDI и YCLIENTS сильны как большие экосистемы. ClickBook берёт другой фокус: быстро запустить красивую запись, не терять заявки и вести клиентов в простом кабинете.',
  compare: [
    ['Тяжёлая CRM', 'много ролей, склад, касса, филиалы, сложные настройки'],
    ['ClickBook', 'одна ссылка, запись, клиенты, чаты, напоминания и понятный рабочий день'],
  ] as const,
  brandKicker: 'Брендинг',
  brandTitle: 'Страница должна выглядеть как ваша, а не как чужая CRM',
  brandText:
    'Внешний вид, логотип, цвета, тексты, отзывы и публичная ссылка помогают мастеру выглядеть профессионально и не стыдиться отправлять страницу клиенту.',
  bottomKicker: 'Главный принцип',
  bottomTitle: 'Сначала делаем ядро железным',
  bottomText:
    'Главная цель ClickBook — стабильная цепочка: клиент записался, попал в базу, мастер увидел действие, клиент получил напоминание, визит состоялся, отзыв и повторная запись не потерялись.',
};

const en = {
  heroBadge: 'Platform for specialists',
  heroTitle: 'Bookings, clients, and communication channels in one workspace.',
  heroText:
    'ClickBook helps specialists accept bookings, keep web, Telegram, and VK clients in one database, and bring people back for repeat visits.',
  primaryCta: 'Open workspace',
  secondaryCta: 'View demo',
  publicCta: 'Public page',
  quickStats: [
    ['1 link', 'profile and booking'],
    ['3 channels', 'web, Telegram, VK'],
    ['1 base', 'all clients inside'],
  ] as const,
  flowKicker: 'How it works',
  flowTitle: 'One clear client path',
  flowText:
    'A client can book from the public page, Telegram, VK, or by leaving a phone number. For the specialist it all becomes one booking, one client card, and one next action.',
  flow: [
    {
      icon: Globe2,
      title: 'Web request',
      text: 'The client opens the link, chooses a service and time, and leaves contact details.',
    },
    {
      icon: Send,
      title: 'Telegram',
      text: 'Bookings, confirmations, reminders, and quick actions work through the bot and Mini App.',
    },
    {
      icon: MessageCircleMore,
      title: 'VK',
      text: 'The client can come from VK while the specialist continues in the same workspace.',
    },
    {
      icon: UserRound,
      title: 'Client card',
      text: 'Phone, channel, bookings, notes, statuses, and history are stored in one place.',
    },
  ] satisfies IconCard[],
  productKicker: 'Product',
  productTitle: 'What is inside ClickBook',
  productText:
    'The product is built around one working chain: link → booking → client → communication → visit → review → repeat booking.',
  product: [
    {
      icon: Globe2,
      title: 'Public specialist page',
      text: 'Photo, description, services, portfolio, reviews, address, and booking in one polished profile.',
    },
    {
      icon: CalendarClock,
      title: 'Booking and schedule',
      text: 'The client chooses a service and slot, while the specialist sees the workday without message chaos.',
    },
    {
      icon: Users2,
      title: 'Client database',
      text: 'Every client gets into the database, even when they only came from a web form without Telegram/VK.',
    },
    {
      icon: MessageCircleMore,
      title: 'Chats and channels',
      text: 'Web, Telegram, and VK follow one logic so one person does not become several records.',
    },
    {
      icon: Bell,
      title: 'Reminders and actions',
      text: 'Confirm, reschedule, call manually, and post-booking steps become clear.',
    },
    {
      icon: Repeat2,
      title: 'Reviews and repeat visits',
      text: 'After a visit, the specialist can request a review and bring the client back.',
    },
  ] satisfies IconCard[],
  audienceKicker: 'Audience',
  audienceTitle: 'Who it is for',
  audienceText:
    'ClickBook is best for specialists who need beautiful booking and a client database without a heavy CRM.',
  audience: [
    'Nails',
    'Brows and lashes',
    'Barbers and stylists',
    'Massage and SPA',
    'Tattoo',
    'Trainers and classes',
    'Psychologists and coaches',
    'Photographers and experts',
  ],
  compareKicker: 'Focus',
  compareTitle: 'Not a CRM monster. A specialist workspace.',
  compareText:
    'DIKIDI and YCLIENTS are strong as large ecosystems. ClickBook focuses on launching beautiful booking fast, keeping requests, and managing clients in a simple workspace.',
  compare: [
    ['Heavy CRM', 'many roles, stock, cash desk, branches, complex settings'],
    ['ClickBook', 'one link, booking, clients, chats, reminders, and a clear workday'],
  ] as const,
  brandKicker: 'Branding',
  brandTitle: 'The page should feel like yours, not like somebody else’s CRM',
  brandText:
    'Appearance, logo, colors, copy, reviews, and the public link help the specialist look professional and confidently share the page with clients.',
  bottomKicker: 'Main principle',
  bottomTitle: 'First, the core must be solid',
  bottomText:
    'The goal is a stable chain: the client books, enters the database, the specialist sees the next action, the client receives reminders, the visit happens, and the review and repeat booking are not lost.',
};

function MicroLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'text-[10px] font-semibold uppercase tracking-[0.16em] text-black/38 dark:text-white/34',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Surface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'relative rounded-[18px] border border-black/[0.08] bg-[#fbfbfa] text-[#0e0e0e] shadow-none dark:border-white/[0.09] dark:bg-[#101010] dark:text-white',
        className,
      )}
    >
      {children}
    </section>
  );
}

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[12px] border border-black/[0.075] bg-black/[0.025] dark:border-white/[0.08] dark:bg-white/[0.035]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function MovingLine() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px overflow-hidden">
      <motion.div
        className="h-px w-1/2 bg-gradient-to-r from-transparent via-black/28 to-transparent dark:via-white/34"
        animate={{ x: ['-100%', '260%'] }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 1.4,
        }}
      />
    </div>
  );
}

function SectionHeader({
  label,
  title,
  text,
  className,
}: {
  label: string;
  title: string;
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <MicroLabel>{label}</MicroLabel>
      <h2 className="mt-3 text-[28px] font-semibold leading-[1.02] tracking-[-0.075em] text-black dark:text-white sm:text-[38px]">
        {title}
      </h2>
      {text ? (
        <p className="mt-3 max-w-[760px] text-[13px] leading-6 text-black/50 dark:text-white/42 sm:text-[13.5px]">
          {text}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex h-10 items-center justify-center gap-2 rounded-[11px] border border-black bg-black px-4 text-[12px] font-semibold text-white transition hover:bg-black/88 active:scale-[0.99] dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/88"
    >
      {children}
      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

function SecondaryLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-[11px] border border-black/[0.08] bg-black/[0.025] px-4 text-[12px] font-semibold text-black/58 transition hover:border-black/[0.14] hover:bg-black/[0.04] hover:text-black active:scale-[0.99] dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/52 dark:hover:border-white/[0.14] dark:hover:bg-white/[0.06] dark:hover:text-white"
    >
      {icon}
      {children}
    </Link>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <Panel className="px-3.5 py-3">
      <div className="text-[18px] font-semibold leading-none tracking-[-0.055em] text-black/78 dark:text-white/78">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] leading-4 text-black/40 dark:text-white/35">
        {label}
      </div>
    </Panel>
  );
}

function FeatureCard({ item, index }: { item: IconCard; index: number }) {
  const Icon = item.icon;

  return (
    <Panel className="group p-4 transition hover:border-black/[0.13] hover:bg-black/[0.035] dark:hover:border-white/[0.13] dark:hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-black/[0.08] bg-[#fbfbfa] text-black/52 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/50">
          <Icon className="size-4" />
        </div>

        <span className="text-[10.5px] font-semibold text-black/26 dark:text-white/24">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="mt-5 text-[15px] font-semibold leading-5 tracking-[-0.035em] text-black/78 dark:text-white/78">
        {item.title}
      </div>

      <p className="mt-2 text-[12px] leading-5 text-black/46 dark:text-white/40">
        {item.text}
      </p>
    </Panel>
  );
}

function FlowRow({
  item,
  index,
  total,
}: {
  item: IconCard;
  index: number;
  total: number;
}) {
  const Icon = item.icon;

  return (
    <div className="relative">
      {index < total - 1 ? (
        <div className="absolute left-[18px] top-11 h-[calc(100%-26px)] w-px bg-black/[0.07] dark:bg-white/[0.08]" />
      ) : null}

      <div className="relative flex gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-[11px] border border-black/[0.08] bg-[#fbfbfa] text-black/52 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/50">
          <Icon className="size-4" />
        </div>

        <Panel className="flex-1 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold tracking-[-0.02em] text-black/76 dark:text-white/76">
                {item.title}
              </div>
              <div className="mt-1 text-[11.5px] leading-5 text-black/44 dark:text-white/38">
                {item.text}
              </div>
            </div>

            <span className="mt-0.5 shrink-0 text-[10.5px] font-semibold text-black/28 dark:text-white/24">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ProductPreviewCard({ locale }: { locale: Locale }) {
  const channels: Array<{ icon: LucideIcon; label: string }> = [
    { icon: Globe2, label: 'Web' },
    { icon: Send, label: 'TG' },
    { icon: MessageCircleMore, label: 'VK' },
  ];

  return (
    <Surface className="overflow-hidden p-4">
      <MovingLine />

      <div className="flex items-center justify-between gap-3 border-b border-black/[0.07] pb-4 dark:border-white/[0.08]">
        <BrandLogo className="w-[124px]" />

        <div className="inline-flex items-center gap-1.5 rounded-[9px] border border-black/[0.08] bg-black/[0.025] px-2.5 py-1.5 text-[10.5px] font-semibold text-black/42 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/38">
          <span className="size-1.5 rounded-full bg-black/42 dark:bg-white/42" />
          Live
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Panel className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <MicroLabel>
                {locale === 'ru' ? 'Новая запись' : 'New booking'}
              </MicroLabel>

              <div className="mt-2 text-[18px] font-semibold leading-5 tracking-[-0.05em] text-black/82 dark:text-white/82">
                14:00 · {locale === 'ru' ? 'Маникюр' : 'Nails'}
              </div>

              <div className="mt-1 text-[12px] text-black/44 dark:text-white/38">
                {locale === 'ru' ? 'Мария Иванова' : 'Maria Ivanova'} · +7 934 000 53 9
              </div>
            </div>

            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-black/44 dark:text-white/42" />
          </div>
        </Panel>

        <div className="grid grid-cols-3 gap-2">
          {channels.map((item) => {
            const Icon = item.icon;

            return (
              <Panel
                key={item.label}
                className="grid min-h-[76px] place-items-center p-3 text-center"
              >
                <Icon className="size-4 text-black/48 dark:text-white/42" />
                <div className="mt-2 text-[11px] font-semibold text-black/50 dark:text-white/44">
                  {item.label}
                </div>
              </Panel>
            );
          })}
        </div>

        <Panel className="p-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-black text-[14px] font-semibold text-white dark:bg-white dark:text-black">
              {locale === 'ru' ? 'М' : 'M'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-black/78 dark:text-white/76">
                {locale === 'ru' ? 'Мария Иванова' : 'Maria Ivanova'}
              </div>
              <div className="mt-1 truncate text-[11px] text-black/40 dark:text-white/35">
                web → client card → reminder
              </div>
            </div>

            <ChevronRight className="size-4 shrink-0 text-black/32 dark:text-white/30" />
          </div>
        </Panel>

        <Panel className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              [locale === 'ru' ? 'Сегодня' : 'Today', '7'],
              [locale === 'ru' ? 'Клиенты' : 'Clients', '124'],
              [locale === 'ru' ? 'Повтор' : 'Repeat', '38%'],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <div className="truncate text-[10.5px] text-black/36 dark:text-white/30">
                  {label}
                </div>
                <div className="mt-1 text-[17px] font-semibold tracking-[-0.055em] text-black/74 dark:text-white/72">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Surface>
  );
}

function AudiencePill({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[48px] items-center gap-2 rounded-[12px] border border-black/[0.075] bg-black/[0.025] px-3 text-[12px] font-semibold text-black/58 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/54">
      <Check className="size-3.5 shrink-0 text-black/38 dark:text-white/34" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function CompareItem({
  title,
  text,
  active,
}: {
  title: string;
  text: string;
  active?: boolean;
}) {
  return (
    <Panel
      className={cn(
        'p-4',
        active &&
          'border-black/[0.12] bg-black/[0.045] dark:border-white/[0.12] dark:bg-white/[0.055]',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[10px] border border-black/[0.08] bg-[#fbfbfa] text-black/48 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/44">
          {active ? <Sparkles className="size-4" /> : <Layers3 className="size-4" />}
        </div>

        <div className="min-w-0">
          <div className="text-[14px] font-semibold tracking-[-0.025em] text-black/76 dark:text-white/76">
            {title}
          </div>
          <div className="mt-1 text-[12px] leading-5 text-black/44 dark:text-white/38">
            {text}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export default function AboutProductPage() {
  const { locale } = useLocale();
  const currentLocale: Locale = locale === 'en' ? 'en' : 'ru';
  const t = currentLocale === 'ru' ? ru : en;

  const brandItems: Array<{ icon: LucideIcon; label: string }> = [
    {
      icon: Palette,
      label: currentLocale === 'ru' ? 'Цвета и стиль' : 'Colors and style',
    },
    {
      icon: Star,
      label: currentLocale === 'ru' ? 'Отзывы и доверие' : 'Reviews and trust',
    },
    {
      icon: Copy,
      label: currentLocale === 'ru' ? 'Своя ссылка' : 'Own link',
    },
  ];

  const coreItems: Array<{ icon: LucideIcon; label: string }> = [
    {
      icon: Clock3,
      label: currentLocale === 'ru' ? 'Запись' : 'Booking',
    },
    {
      icon: UserRound,
      label: currentLocale === 'ru' ? 'Клиент' : 'Client',
    },
    {
      icon: WalletCards,
      label: currentLocale === 'ru' ? 'Повтор' : 'Repeat',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <Surface className="overflow-hidden">
          <MovingLine />

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:p-7">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <MicroLabel>{t.heroBadge}</MicroLabel>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-black/[0.025] px-2.5 py-1 text-[10px] font-semibold text-black/38 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/34">
                  <Sparkles className="size-3" />
                  ClickBook
                </div>
              </div>

              <h1 className="mt-5 max-w-[820px] text-[38px] font-semibold leading-[0.98] tracking-[-0.085em] text-black dark:text-white sm:text-[52px] lg:text-[60px]">
                {t.heroTitle}
              </h1>

              <p className="mt-5 max-w-[720px] text-[13.5px] leading-7 text-black/52 dark:text-white/44 sm:text-[14px]">
                {t.heroText}
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <PrimaryLink href="/login">{t.primaryCta}</PrimaryLink>

                <SecondaryLink href="/demo/klikbuk-demo">
                  {t.secondaryCta}
                </SecondaryLink>

                <SecondaryLink href="/m/admin" icon={<Globe2 className="size-4" />}>
                  {t.publicCta}
                </SecondaryLink>
              </div>

              <div className="mt-6 grid max-w-[720px] gap-3 sm:grid-cols-3">
                {t.quickStats.map(([value, label]) => (
                  <StatCard key={value} value={value} label={label} />
                ))}
              </div>
            </div>

            <ProductPreviewCard locale={currentLocale} />
          </div>
        </Surface>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <Surface className="p-5 sm:p-6">
            <SectionHeader
              label={t.flowKicker}
              title={t.flowTitle}
              text={t.flowText}
            />

            <div className="mt-6 space-y-3">
              {t.flow.map((item, index) => (
                <FlowRow
                  key={item.title}
                  item={item}
                  index={index}
                  total={t.flow.length}
                />
              ))}
            </div>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <SectionHeader
              label={t.productKicker}
              title={t.productTitle}
              text={t.productText}
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {t.product.map((item, index) => (
                <FeatureCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </Surface>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Surface className="p-5 sm:p-6">
            <SectionHeader
              label={t.audienceKicker}
              title={t.audienceTitle}
              text={t.audienceText}
            />

            <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {t.audience.map((item) => (
                <AudiencePill key={item}>{item}</AudiencePill>
              ))}
            </div>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <SectionHeader
              label={t.compareKicker}
              title={t.compareTitle}
              text={t.compareText}
            />

            <div className="mt-6 grid gap-3">
              {t.compare.map(([title, text], index) => (
                <CompareItem
                  key={title}
                  title={title}
                  text={text}
                  active={index === 1}
                />
              ))}
            </div>
          </Surface>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Surface className="p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-[170px_minmax(0,1fr)]">
              <Panel className="flex min-h-[170px] items-center justify-center p-5">
                <BrandLogo className="w-[148px]" />
              </Panel>

              <div className="min-w-0">
                <SectionHeader
                  label={t.brandKicker}
                  title={t.brandTitle}
                  text={t.brandText}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {brandItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Panel key={item.label} className="p-3">
                    <Icon className="size-4 text-black/46 dark:text-white/40" />
                    <div className="mt-3 text-[12px] font-semibold text-black/60 dark:text-white/54">
                      {item.label}
                    </div>
                  </Panel>
                );
              })}
            </div>
          </Surface>

          <Surface className="overflow-hidden p-5 sm:p-6">
            <MovingLine />

            <SectionHeader
              label={t.bottomKicker}
              title={t.bottomTitle}
              text={t.bottomText}
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {coreItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Panel key={item.label} className="p-4">
                    <Icon className="size-4 text-black/46 dark:text-white/40" />

                    <div className="mt-8 text-[18px] font-semibold tracking-[-0.055em] text-black/74 dark:text-white/70">
                      {item.label}
                    </div>
                  </Panel>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <PrimaryLink href="/login">{t.primaryCta}</PrimaryLink>

              <SecondaryLink href="/dashboard">
                {currentLocale === 'ru' ? 'Открыть кабинет' : 'Open dashboard'}
              </SecondaryLink>
            </div>
          </Surface>
        </section>
      </main>
    </div>
  );
}