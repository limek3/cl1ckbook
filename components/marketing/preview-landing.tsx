// components/marketing/about-product-page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  ArrowDown,
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

type SheetId =
  | 'intro'
  | 'path'
  | 'product'
  | 'audience'
  | 'focus'
  | 'brand'
  | 'core';

const ru = {
  nav: [
    ['intro', 'Старт'],
    ['path', 'Путь'],
    ['product', 'Продукт'],
    ['audience', 'Для кого'],
    ['focus', 'Фокус'],
    ['brand', 'Брендинг'],
    ['core', 'Ядро'],
  ] satisfies Array<[SheetId, string]>,

  heroBadge: 'Платформа для мастера',
  heroTitle: 'Онлайн-запись, клиенты и каналы связи в одном рабочем кабинете.',
  heroText:
    'ClickBook помогает мастеру красиво принимать записи, не терять клиентов из web, Telegram и VK, вести карточки клиентов и возвращать людей на повторный визит.',
  primaryCta: 'Войти в кабинет',
  secondaryCta: 'Посмотреть демо',
  publicCta: 'Публичная страница',
  scrollHint: 'Листайте ниже',
  quickStats: [
    ['1 ссылка', 'профиль и запись'],
    ['3 канала', 'web, Telegram, VK'],
    ['1 база', 'все клиенты внутри'],
  ] as const,

  pathKicker: 'Лист 02',
  pathTitle: 'Клиент приходит из любого канала. Мастер видит один понятный сценарий.',
  pathText:
    'Клиент может записаться через публичную страницу, Telegram, VK или просто оставить телефон. Для мастера это не разные хаотичные источники, а одна запись, одна карточка клиента и одно следующее действие.',
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

  productKicker: 'Лист 03',
  productTitle: 'Внутри не набор страниц, а рабочая цепочка.',
  productText:
    'Ссылка → запись → клиент → коммуникация → визит → отзыв → повторная запись. Всё должно быть связано между собой, а не жить отдельными кусками.',
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

  audienceKicker: 'Лист 04',
  audienceTitle: 'Для мастеров и специалистов, которым нужна запись без тяжёлой CRM.',
  audienceText:
    'ClickBook лучше всего подходит тем, кто работает с личными услугами, ведёт клиентов сам или в небольшой команде и хочет выглядеть профессионально.',
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

  focusKicker: 'Лист 05',
  focusTitle: 'Не CRM-комбайн. Рабочий кабинет мастера.',
  focusText:
    'DIKIDI и YCLIENTS сильны как большие экосистемы. ClickBook берёт другой фокус: быстро запустить красивую запись, не терять заявки и вести клиентов в простом кабинете.',
  compare: [
    ['Тяжёлая CRM', 'много ролей, склад, касса, филиалы, сложные настройки'],
    ['ClickBook', 'одна ссылка, запись, клиенты, чаты, напоминания и понятный рабочий день'],
  ] as const,

  brandKicker: 'Лист 06',
  brandTitle: 'Страница должна выглядеть как ваша, а не как чужая CRM.',
  brandText:
    'Внешний вид, логотип, цвета, тексты, отзывы и публичная ссылка помогают мастеру выглядеть профессионально и не стыдиться отправлять страницу клиенту.',
  brandItems: [
    ['Цвета и стиль', 'Аккуратная публичная страница под мастера.'],
    ['Отзывы и доверие', 'Клиент видит живой профиль, а не пустую форму.'],
    ['Своя ссылка', 'Можно отправлять клиенту как нормальную страницу.'],
  ] as const,

  coreKicker: 'Лист 07',
  coreTitle: 'Сначала делаем ядро железным.',
  coreText:
    'Главная цель ClickBook — стабильная цепочка: клиент записался, попал в базу, мастер увидел действие, клиент получил напоминание, визит состоялся, отзыв и повторная запись не потерялись.',
  coreItems: [
    ['Запись', 'услуга, дата, время, источник'],
    ['Клиент', 'контакты, канал, история, заметки'],
    ['Повтор', 'напоминание, отзыв, следующий визит'],
  ] as const,
};

const en = {
  nav: [
    ['intro', 'Start'],
    ['path', 'Path'],
    ['product', 'Product'],
    ['audience', 'Audience'],
    ['focus', 'Focus'],
    ['brand', 'Brand'],
    ['core', 'Core'],
  ] satisfies Array<[SheetId, string]>,

  heroBadge: 'Platform for specialists',
  heroTitle: 'Bookings, clients, and communication channels in one workspace.',
  heroText:
    'ClickBook helps specialists accept bookings beautifully, keep web, Telegram, and VK clients in one database, and bring people back for repeat visits.',
  primaryCta: 'Open workspace',
  secondaryCta: 'View demo',
  publicCta: 'Public page',
  scrollHint: 'Scroll down',
  quickStats: [
    ['1 link', 'profile and booking'],
    ['3 channels', 'web, Telegram, VK'],
    ['1 base', 'all clients inside'],
  ] as const,

  pathKicker: 'Sheet 02',
  pathTitle: 'Clients come from any channel. The specialist sees one clear flow.',
  pathText:
    'A client can book from the public page, Telegram, VK, or by leaving a phone number. For the specialist, it becomes one booking, one client card, and one next action.',
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

  productKicker: 'Sheet 03',
  productTitle: 'Inside, it is not a set of pages. It is a working chain.',
  productText:
    'Link → booking → client → communication → visit → review → repeat booking. Everything should be connected, not split into unrelated screens.',
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

  audienceKicker: 'Sheet 04',
  audienceTitle: 'For specialists who need booking without a heavy CRM.',
  audienceText:
    'ClickBook is best for personal services, solo specialists, and small teams that want to look professional.',
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

  focusKicker: 'Sheet 05',
  focusTitle: 'Not a CRM monster. A specialist workspace.',
  focusText:
    'DIKIDI and YCLIENTS are strong as large ecosystems. ClickBook focuses on launching beautiful booking fast, keeping requests, and managing clients in a simple workspace.',
  compare: [
    ['Heavy CRM', 'many roles, stock, cash desk, branches, complex settings'],
    ['ClickBook', 'one link, booking, clients, chats, reminders, and a clear workday'],
  ] as const,

  brandKicker: 'Sheet 06',
  brandTitle: 'The page should feel like yours, not like somebody else’s CRM.',
  brandText:
    'Appearance, logo, colors, copy, reviews, and the public link help the specialist look professional and confidently share the page with clients.',
  brandItems: [
    ['Colors and style', 'A polished public page for the specialist.'],
    ['Reviews and trust', 'The client sees a living profile, not an empty form.'],
    ['Own link', 'A page that feels good to send to clients.'],
  ] as const,

  coreKicker: 'Sheet 07',
  coreTitle: 'First, the core must be solid.',
  coreText:
    'The goal is a stable chain: the client books, enters the database, the specialist sees the next action, the client receives reminders, the visit happens, and review and repeat booking are not lost.',
  coreItems: [
    ['Booking', 'service, date, time, source'],
    ['Client', 'contacts, channel, history, notes'],
    ['Repeat', 'reminder, review, next visit'],
  ] as const,
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
        'relative rounded-[22px] border border-black/[0.08] bg-[#fbfbfa] text-[#0e0e0e] shadow-none dark:border-white/[0.09] dark:bg-[#101010] dark:text-white',
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
        'rounded-[14px] border border-black/[0.075] bg-black/[0.025] dark:border-white/[0.08] dark:bg-white/[0.035]',
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
        className="h-px w-1/2 bg-gradient-to-r from-transparent via-black/30 to-transparent dark:via-white/38"
        animate={{ x: ['-100%', '260%'] }}
        transition={{
          duration: 3.7,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 1.2,
        }}
      />
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

function Sheet({
  id,
  index,
  total,
  kicker,
  title,
  text,
  children,
  className,
}: {
  id: SheetId;
  index: number;
  total: number;
  kicker: string;
  title: string;
  text?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className="min-h-[calc(100vh-64px)] snap-start px-4 py-5 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex min-h-[calc(100vh-104px)] w-full max-w-[1320px] items-center">
        <Surface className={cn('w-full overflow-hidden', className)}>
          <MovingLine />

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:p-7 xl:p-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-[420px] flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <MicroLabel>{kicker}</MicroLabel>

                  <div className="rounded-full border border-black/[0.07] bg-black/[0.025] px-2.5 py-1 text-[10px] font-semibold text-black/36 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/32">
                    {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </div>
                </div>

                <h2 className="mt-5 max-w-[760px] text-[34px] font-semibold leading-[0.98] tracking-[-0.085em] text-black dark:text-white sm:text-[50px] lg:text-[58px]">
                  {title}
                </h2>

                {text ? (
                  <p className="mt-5 max-w-[680px] text-[13.5px] leading-7 text-black/52 dark:text-white/44 sm:text-[14px]">
                    {text}
                  </p>
                ) : null}
              </div>

              <div className="mt-8 hidden items-center gap-3 text-[11px] font-semibold text-black/34 dark:text-white/30 lg:flex">
                <span className="h-px w-12 bg-black/[0.12] dark:bg-white/[0.12]" />
                ClickBook
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              {children}
            </motion.div>
          </div>
        </Surface>
      </div>
    </section>
  );
}

function SheetNavigation({
  items,
}: {
  items: Array<[SheetId, string]>;
}) {
  return (
    <nav className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
      <div className="pointer-events-auto rounded-[16px] border border-black/[0.08] bg-[#fbfbfa]/82 p-1.5 backdrop-blur-[18px] dark:border-white/[0.08] dark:bg-[#101010]/82">
        <div className="grid gap-1">
          {items.map(([id, label], index) => (
            <a
              key={id}
              href={`#${id}`}
              className="group flex h-8 items-center gap-2 rounded-[10px] px-2 text-[10.5px] font-semibold text-black/36 transition hover:bg-black/[0.045] hover:text-black/72 dark:text-white/32 dark:hover:bg-white/[0.065] dark:hover:text-white/72"
            >
              <span className="grid size-4 place-items-center rounded-full border border-black/[0.08] text-[8px] dark:border-white/[0.08]">
                {index + 1}
              </span>
              <span className="w-[72px] truncate">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function StatStrip({
  items,
}: {
  items: readonly (readonly [string, string])[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(([value, label], index) => (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.35, delay: index * 0.06 }}
        >
          <Panel className="px-4 py-3">
            <div className="text-[20px] font-semibold leading-none tracking-[-0.06em] text-black/80 dark:text-white/78">
              {value}
            </div>
            <div className="mt-1.5 text-[11px] leading-4 text-black/42 dark:text-white/36">
              {label}
            </div>
          </Panel>
        </motion.div>
      ))}
    </div>
  );
}

function IntroPreview({ locale }: { locale: Locale }) {
  return (
    <Panel className="relative overflow-hidden p-4">
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.07] pb-4 dark:border-white/[0.08]">
        <BrandLogo className="w-[126px]" />

        <motion.div
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-1.5 rounded-[9px] border border-black/[0.08] bg-[#fbfbfa] px-2.5 py-1.5 text-[10.5px] font-semibold text-black/42 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/38"
        >
          <span className="size-1.5 rounded-full bg-black/42 dark:bg-white/42" />
          Live
        </motion.div>
      </div>

      <div className="mt-4 space-y-3">
        <Panel className="bg-[#fbfbfa]/70 p-3 dark:bg-[#101010]/70">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <MicroLabel>{locale === 'ru' ? 'Новая запись' : 'New booking'}</MicroLabel>
              <div className="mt-2 text-[18px] font-semibold tracking-[-0.055em] text-black/82 dark:text-white/80">
                14:00 · {locale === 'ru' ? 'Маникюр' : 'Nails'}
              </div>
              <div className="mt-1 text-[12px] text-black/44 dark:text-white/38">
                {locale === 'ru' ? 'Мария Иванова' : 'Maria Ivanova'} · Web
              </div>
            </div>

            <CheckCircle2 className="size-5 shrink-0 text-black/44 dark:text-white/40" />
          </div>
        </Panel>

        <div className="grid grid-cols-3 gap-2">
          {[
            [Globe2, 'Web'],
            [Send, 'TG'],
            [MessageCircleMore, 'VK'],
          ].map(([Icon, label], index) => {
            const NodeIcon = Icon as LucideIcon;

            return (
              <motion.div
                key={label as string}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
              >
                <Panel className="grid min-h-[74px] place-items-center p-3 text-center">
                  <NodeIcon className="size-4 text-black/48 dark:text-white/42" />
                  <div className="mt-2 text-[11px] font-semibold text-black/50 dark:text-white/44">
                    {label as string}
                  </div>
                </Panel>
              </motion.div>
            );
          })}
        </div>

        <Panel className="bg-[#fbfbfa]/70 p-3 dark:bg-[#101010]/70">
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
              <div key={label}>
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
    </Panel>
  );
}

function FlowBoard({ items }: { items: IconCard[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="relative"
          >
            <Panel className="p-4">
              <div className="flex gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-black/[0.08] bg-[#fbfbfa] text-black/52 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/48">
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[14px] font-semibold tracking-[-0.025em] text-black/78 dark:text-white/76">
                      {item.title}
                    </div>
                    <div className="text-[10.5px] font-semibold text-black/28 dark:text-white/24">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <div className="mt-1.5 text-[12px] leading-5 text-black/46 dark:text-white/40">
                    {item.text}
                  </div>
                </div>
              </div>
            </Panel>
          </motion.div>
        );
      })}
    </div>
  );
}

function ProductGrid({ items }: { items: IconCard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
          >
            <Panel className="h-full p-4 transition hover:border-black/[0.13] hover:bg-black/[0.035] dark:hover:border-white/[0.13] dark:hover:bg-white/[0.05]">
              <div className="flex items-start justify-between gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-black/[0.08] bg-[#fbfbfa] text-black/52 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/48">
                  <Icon className="size-4" />
                </div>

                <div className="text-[10.5px] font-semibold text-black/26 dark:text-white/22">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              <div className="mt-5 text-[15px] font-semibold leading-5 tracking-[-0.035em] text-black/78 dark:text-white/76">
                {item.title}
              </div>

              <div className="mt-2 text-[12px] leading-5 text-black/46 dark:text-white/40">
                {item.text}
              </div>
            </Panel>
          </motion.div>
        );
      })}
    </div>
  );
}

function AudienceDeck({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {items.map((item, index) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.32, delay: index * 0.045 }}
        >
          <Panel className="flex min-h-[58px] items-center gap-3 px-3.5 py-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-black/[0.08] bg-[#fbfbfa] text-black/42 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/38">
              <Check className="size-3.5" />
            </div>

            <div className="text-[12.5px] font-semibold text-black/64 dark:text-white/58">
              {item}
            </div>
          </Panel>
        </motion.div>
      ))}
    </div>
  );
}

function CompareBoard({
  items,
}: {
  items: readonly (readonly [string, string])[];
}) {
  return (
    <div className="grid gap-3">
      {items.map(([title, text], index) => {
        const active = index === 1;

        return (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.36, delay: index * 0.1 }}
          >
            <Panel
              className={cn(
                'p-5',
                active &&
                  'border-black/[0.13] bg-black/[0.045] dark:border-white/[0.13] dark:bg-white/[0.055]',
              )}
            >
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-black/[0.08] bg-[#fbfbfa] text-black/50 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/46">
                  {active ? (
                    <Sparkles className="size-4" />
                  ) : (
                    <Layers3 className="size-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-[16px] font-semibold tracking-[-0.045em] text-black/78 dark:text-white/76">
                    {title}
                  </div>
                  <div className="mt-2 text-[12.5px] leading-5 text-black/46 dark:text-white/40">
                    {text}
                  </div>
                </div>
              </div>
            </Panel>
          </motion.div>
        );
      })}
    </div>
  );
}

function BrandBoard({
  items,
}: {
  items: readonly (readonly [string, string])[];
}) {
  const icons: LucideIcon[] = [Palette, Star, Copy];

  return (
    <div className="grid gap-3">
      <Panel className="flex min-h-[150px] items-center justify-center p-5">
        <BrandLogo className="w-[154px]" />
      </Panel>

      <div className="grid gap-3 sm:grid-cols-3">
        {items.map(([title, text], index) => {
          const Icon = icons[index] ?? Sparkles;

          return (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.34, delay: index * 0.08 }}
            >
              <Panel className="h-full p-4">
                <Icon className="size-4 text-black/46 dark:text-white/40" />
                <div className="mt-4 text-[13px] font-semibold tracking-[-0.025em] text-black/70 dark:text-white/66">
                  {title}
                </div>
                <div className="mt-1.5 text-[11.5px] leading-5 text-black/42 dark:text-white/36">
                  {text}
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function CoreBoard({
  items,
}: {
  items: readonly (readonly [string, string])[];
}) {
  const icons: LucideIcon[] = [Clock3, UserRound, WalletCards];

  return (
    <div className="grid gap-3">
      {items.map(([title, text], index) => {
        const Icon = icons[index] ?? Sparkles;

        return (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
          >
            <Panel className="p-5">
              <div className="flex items-center gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-[14px] border border-black/[0.08] bg-[#fbfbfa] text-black/50 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/46">
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0">
                  <div className="text-[22px] font-semibold leading-none tracking-[-0.065em] text-black/78 dark:text-white/76">
                    {title}
                  </div>
                  <div className="mt-2 text-[12px] leading-5 text-black/44 dark:text-white/38">
                    {text}
                  </div>
                </div>
              </div>
            </Panel>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function AboutProductPage() {
  const { locale } = useLocale();
  const currentLocale: Locale = locale === 'en' ? 'en' : 'ru';
  const t = currentLocale === 'ru' ? ru : en;

  const totalSheets = 7;

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
      <SiteHeader />

      <SheetNavigation items={t.nav} />

      <main className="h-[calc(100vh-64px)] snap-y snap-mandatory overflow-y-auto scroll-smooth">
        <section
          id="intro"
          className="min-h-[calc(100vh-64px)] snap-start px-4 py-5 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex min-h-[calc(100vh-104px)] w-full max-w-[1320px] items-center">
            <Surface className="w-full overflow-hidden">
              <MovingLine />

              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:p-7 xl:p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex min-h-[500px] flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <MicroLabel>{t.heroBadge}</MicroLabel>

                      <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-black/[0.025] px-2.5 py-1 text-[10px] font-semibold text-black/38 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/34">
                        <Sparkles className="size-3" />
                        ClickBook
                      </div>
                    </div>

                    <h1 className="mt-6 max-w-[860px] text-[40px] font-semibold leading-[0.95] tracking-[-0.09em] text-black dark:text-white sm:text-[58px] lg:text-[70px]">
                      {t.heroTitle}
                    </h1>

                    <p className="mt-6 max-w-[720px] text-[13.5px] leading-7 text-black/52 dark:text-white/44 sm:text-[14px]">
                      {t.heroText}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-2.5">
                      <PrimaryLink href="/login">{t.primaryCta}</PrimaryLink>

                      <SecondaryLink href="/demo/klikbuk-demo">
                        {t.secondaryCta}
                      </SecondaryLink>

                      <SecondaryLink
                        href="/m/admin"
                        icon={<Globe2 className="size-4" />}
                      >
                        {t.publicCta}
                      </SecondaryLink>
                    </div>

                    <div className="mt-7 max-w-[720px]">
                      <StatStrip items={t.quickStats} />
                    </div>
                  </div>

                  <a
                    href="#path"
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-[11px] border border-black/[0.08] bg-black/[0.025] px-3 py-2 text-[11px] font-semibold text-black/42 transition hover:bg-black/[0.04] hover:text-black/70 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/36 dark:hover:bg-white/[0.06] dark:hover:text-white/68"
                  >
                    {t.scrollHint}
                    <ArrowDown className="size-3.5" />
                  </a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.985 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{
                    duration: 0.5,
                    delay: 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="min-w-0"
                >
                  <IntroPreview locale={currentLocale} />
                </motion.div>
              </div>
            </Surface>
          </div>
        </section>

        <Sheet
          id="path"
          index={2}
          total={totalSheets}
          kicker={t.pathKicker}
          title={t.pathTitle}
          text={t.pathText}
        >
          <FlowBoard items={t.flow} />
        </Sheet>

        <Sheet
          id="product"
          index={3}
          total={totalSheets}
          kicker={t.productKicker}
          title={t.productTitle}
          text={t.productText}
          className="lg:[&>div]:grid-cols-[minmax(0,0.72fr)_minmax(520px,1.28fr)]"
        >
          <ProductGrid items={t.product} />
        </Sheet>

        <Sheet
          id="audience"
          index={4}
          total={totalSheets}
          kicker={t.audienceKicker}
          title={t.audienceTitle}
          text={t.audienceText}
        >
          <AudienceDeck items={t.audience} />
        </Sheet>

        <Sheet
          id="focus"
          index={5}
          total={totalSheets}
          kicker={t.focusKicker}
          title={t.focusTitle}
          text={t.focusText}
        >
          <CompareBoard items={t.compare} />
        </Sheet>

        <Sheet
          id="brand"
          index={6}
          total={totalSheets}
          kicker={t.brandKicker}
          title={t.brandTitle}
          text={t.brandText}
        >
          <BrandBoard items={t.brandItems} />
        </Sheet>

        <Sheet
          id="core"
          index={7}
          total={totalSheets}
          kicker={t.coreKicker}
          title={t.coreTitle}
          text={t.coreText}
        >
          <div className="grid gap-5">
            <CoreBoard items={t.coreItems} />

            <Panel className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[18px] font-semibold tracking-[-0.055em] text-black/78 dark:text-white/76">
                    ClickBook
                  </div>
                  <div className="mt-1 text-[12px] text-black/42 dark:text-white/36">
                    {currentLocale === 'ru'
                      ? 'Запустить рабочий кабинет мастера'
                      : 'Launch the specialist workspace'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <PrimaryLink href="/login">{t.primaryCta}</PrimaryLink>
                  <SecondaryLink href="/dashboard">
                    {currentLocale === 'ru' ? 'Открыть кабинет' : 'Open dashboard'}
                  </SecondaryLink>
                </div>
              </div>
            </Panel>
          </div>
        </Sheet>
      </main>
    </div>
  );
}