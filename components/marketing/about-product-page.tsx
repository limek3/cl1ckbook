// components/marketing/about-product-page.tsx
'use client';

import Link from 'next/link';
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
  heroTitle: 'КликБук — онлайн-запись, клиенты и каналы связи в одном кабинете.',
  heroText:
    'Не тяжёлая CRM и не просто ссылка. КликБук помогает мастеру красиво принимать записи, не терять клиентов из web, Telegram и VK, вести карточки клиентов и возвращать людей на повторный визит.',
  primaryCta: 'Войти в кабинет',
  secondaryCta: 'Посмотреть демо',
  publicCta: 'Публичная страница',
  quickStats: [
    ['1 ссылка', 'для записи и профиля'],
    ['3 канала', 'web, Telegram, VK'],
    ['1 база', 'все клиенты внутри'],
  ] as const,
  flowTitle: 'Один понятный путь клиента',
  flowText:
    'Клиент может записаться как угодно: через публичную страницу, Telegram, VK или просто оставив телефон. Для мастера всё выглядит одинаково — запись, карточка клиента и следующее действие.',
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
  productTitle: 'Что внутри ClickBook',
  productText:
    'Мы собираем не набор отдельных страниц, а рабочую цепочку: ссылка → запись → клиент → коммуникация → визит → отзыв → повторная запись.',
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
  compareTitle: 'Не CRM-комбайн. Рабочий кабинет мастера.',
  compareText:
    'DIKIDI и YCLIENTS сильны как большие экосистемы. ClickBook берёт другой фокус: быстро запустить красивую запись, не терять заявки и вести клиентов в простом кабинете.',
  compare: [
    ['Тяжёлая CRM', 'много ролей, склад, касса, филиалы, сложные настройки'],
    ['ClickBook', 'одна ссылка, запись, клиенты, чаты, напоминания и понятный рабочий день'],
  ] as const,
  brandTitle: 'Страница должна выглядеть как ваша, а не как чужая CRM',
  brandText:
    'Внешний вид, логотип, цвета, тексты, отзывы и публичная ссылка помогают мастеру выглядеть профессионально и не стыдиться отправлять страницу клиенту.',
  bottomTitle: 'Сначала делаем ядро железным',
  bottomText:
    'Главная цель ClickBook — стабильная цепочка: клиент записался, попал в базу, мастер увидел действие, клиент получил напоминание, визит состоялся, отзыв и повторная запись не потерялись.',
};

const en = {
  heroBadge: 'Platform for specialists',
  heroTitle: 'ClickBook brings bookings, clients, and communication channels into one workspace.',
  heroText:
    'Not a heavy CRM and not just a link. ClickBook helps specialists accept bookings beautifully, keep web, Telegram, and VK clients in one database, and bring people back for repeat visits.',
  primaryCta: 'Open workspace',
  secondaryCta: 'View demo',
  publicCta: 'Public page',
  quickStats: [
    ['1 link', 'profile and booking'],
    ['3 channels', 'web, Telegram, VK'],
    ['1 base', 'all clients inside'],
  ] as const,
  flowTitle: 'One clear client path',
  flowText:
    'A client can book from the public page, Telegram, VK, or by leaving a phone number. For the specialist it all becomes one booking, one client card, and one next action.',
  flow: [
    { icon: Globe2, title: 'Web request', text: 'The client opens the link, chooses a service and time, and leaves contact details.' },
    { icon: Send, title: 'Telegram', text: 'Bookings, confirmations, reminders, and quick actions work through the bot and Mini App.' },
    { icon: MessageCircleMore, title: 'VK', text: 'The client can come from VK while the specialist continues in the same workspace.' },
    { icon: UserRound, title: 'Client card', text: 'Phone, channel, bookings, notes, statuses, and history are stored in one place.' },
  ] satisfies IconCard[],
  productTitle: 'What is inside ClickBook',
  productText:
    'The product is built around one working chain: link → booking → client → communication → visit → review → repeat booking.',
  product: [
    { icon: Globe2, title: 'Public specialist page', text: 'Photo, description, services, portfolio, reviews, address, and booking in one polished profile.' },
    { icon: CalendarClock, title: 'Booking and schedule', text: 'The client chooses a service and slot, while the specialist sees the workday without message chaos.' },
    { icon: Users2, title: 'Client database', text: 'Every client gets into the database, even when they only came from a web form without Telegram/VK.' },
    { icon: MessageCircleMore, title: 'Chats and channels', text: 'Web, Telegram, and VK follow one logic so one person does not become several records.' },
    { icon: Bell, title: 'Reminders and actions', text: 'Confirm, reschedule, call manually, and post-booking steps become clear.' },
    { icon: Repeat2, title: 'Reviews and repeat visits', text: 'After a visit, the specialist can request a review and bring the client back.' },
  ] satisfies IconCard[],
  audienceTitle: 'Who it is for',
  audienceText:
    'ClickBook is best for specialists who need beautiful booking and a client database without a heavy CRM.',
  audience: ['Nails', 'Brows and lashes', 'Barbers and stylists', 'Massage and SPA', 'Tattoo', 'Trainers and classes', 'Psychologists and coaches', 'Photographers and experts'],
  compareTitle: 'Not a CRM monster. A specialist workspace.',
  compareText:
    'DIKIDI and YCLIENTS are strong as large ecosystems. ClickBook focuses on launching beautiful booking fast, keeping requests, and managing clients in a simple workspace.',
  compare: [
    ['Heavy CRM', 'many roles, stock, cash desk, branches, complex settings'],
    ['ClickBook', 'one link, booking, clients, chats, reminders, and a clear workday'],
  ] as const,
  brandTitle: 'The page should feel like yours, not like somebody else’s CRM',
  brandText:
    'Appearance, logo, colors, copy, reviews, and the public link help the specialist look professional and confidently share the page with clients.',
  bottomTitle: 'First, the core must be solid',
  bottomText:
    'The goal is a stable chain: the client books, enters the database, the specialist sees the next action, the client receives reminders, the visit happens, and the review and repeat booking are not lost.',
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-black/[0.025] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/48 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/40">
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </div>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[16px] border border-black/[0.08] bg-[#fbfbfa] dark:border-white/[0.08] dark:bg-[#101010]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function SoftPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[12px] border border-black/[0.07] bg-black/[0.025] dark:border-white/[0.075] dark:bg-white/[0.035]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function FeatureCard({ item, index }: { item: IconCard; index: number }) {
  const Icon = item.icon;

  return (
    <Card className="group p-4 transition hover:border-black/[0.13] dark:hover:border-white/[0.13]">
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-black/[0.08] bg-black/[0.025] text-black/54 dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-white/54">
          <Icon className="size-4" />
        </div>
        <span className="text-[11px] font-semibold text-black/28 dark:text-white/24">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="mt-5 text-[16px] font-semibold tracking-[-0.035em] text-black/82 dark:text-white/82">
        {item.title}
      </div>
      <p className="mt-2 text-[12.5px] leading-5 text-black/48 dark:text-white/42">
        {item.text}
      </p>
    </Card>
  );
}

function ChannelNode({ item }: { item: IconCard }) {
  const Icon = item.icon;

  return (
    <SoftPanel className="p-3">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-[11px] border border-black/[0.08] bg-[#fbfbfa] text-black/55 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/56">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold tracking-[-0.02em] text-black/78 dark:text-white/78">
            {item.title}
          </div>
          <div className="mt-1 text-[11.5px] leading-4 text-black/45 dark:text-white/40">
            {item.text}
          </div>
        </div>
      </div>
    </SoftPanel>
  );
}

export default function AboutProductPage() {
  const { locale } = useLocale();
  const currentLocale: Locale = locale === 'en' ? 'en' : 'ru';
  const t = currentLocale === 'ru' ? ru : en;

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[24px] border border-black/[0.08] bg-[#fbfbfa] dark:border-white/[0.08] dark:bg-[#101010]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:34px_34px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)]" />
          </div>

          <div className="relative z-10 grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:p-10 xl:p-12">
            <div className="min-w-0">
              <SectionLabel>{t.heroBadge}</SectionLabel>

              <h1 className="mt-6 max-w-[900px] text-[42px] font-semibold leading-[0.98] tracking-[-0.085em] text-black dark:text-white sm:text-[58px] lg:text-[68px]">
                {t.heroTitle}
              </h1>

              <p className="mt-6 max-w-[760px] text-[14px] leading-7 text-black/55 dark:text-white/45 sm:text-[15px]">
                {t.heroText}
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[11px] bg-black px-4 text-[12px] font-semibold text-white transition active:scale-[0.99] dark:bg-white dark:text-black"
                >
                  {t.primaryCta}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/demo/klikbuk-demo"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[11px] border border-black/[0.08] bg-white/55 px-4 text-[12px] font-semibold text-black/62 transition hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/58 dark:hover:bg-white/[0.07]"
                >
                  {t.secondaryCta}
                </Link>
                <Link
                  href="/m/admin"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[11px] border border-black/[0.08] bg-white/35 px-4 text-[12px] font-semibold text-black/52 transition hover:bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-white/48 dark:hover:bg-white/[0.055]"
                >
                  <Globe2 className="size-4" />
                  {t.publicCta}
                </Link>
              </div>

              <div className="mt-8 grid max-w-[720px] gap-3 sm:grid-cols-3">
                {t.quickStats.map(([value, label]) => (
                  <SoftPanel key={value} className="px-4 py-3">
                    <div className="text-[20px] font-semibold tracking-[-0.055em] text-black/80 dark:text-white/80">
                      {value}
                    </div>
                    <div className="mt-1 text-[11px] leading-4 text-black/42 dark:text-white/36">
                      {label}
                    </div>
                  </SoftPanel>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden p-4 shadow-[0_28px_80px_rgba(15,15,15,0.09)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
              <div className="flex items-center justify-between gap-3 border-b border-black/[0.07] pb-4 dark:border-white/[0.08]">
                <BrandLogo className="w-[128px]" />
                <div className="rounded-[9px] border border-black/[0.08] bg-black/[0.025] px-2.5 py-1.5 text-[10.5px] font-semibold text-black/45 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/40">
                  Live
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <SoftPanel className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/36 dark:text-white/32">
                        {currentLocale === 'ru' ? 'Новая запись' : 'New booking'}
                      </div>
                      <div className="mt-2 text-[18px] font-semibold tracking-[-0.05em] text-black/82 dark:text-white/82">
                        14:00 · {currentLocale === 'ru' ? 'Маникюр' : 'Nails'}
                      </div>
                      <div className="mt-1 text-[12px] text-black/45 dark:text-white/40">
                        Мария · +7 934 000 53 9
                      </div>
                    </div>
                    <CheckCircle2 className="size-5 text-black/48 dark:text-white/46" />
                  </div>
                </SoftPanel>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    [Globe2, 'Web'],
                    [Send, 'TG'],
                    [MessageCircleMore, 'VK'],
                  ].map(([Icon, label]) => {
                    const NodeIcon = Icon as LucideIcon;
                    return (
                      <SoftPanel key={label as string} className="grid place-items-center p-3 text-center">
                        <NodeIcon className="size-4 text-black/50 dark:text-white/46" />
                        <div className="mt-2 text-[11px] font-semibold text-black/52 dark:text-white/46">
                          {label as string}
                        </div>
                      </SoftPanel>
                    );
                  })}
                </div>

                <SoftPanel className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-[12px] bg-black text-[14px] font-semibold text-white dark:bg-white dark:text-black">
                      М
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-black/78 dark:text-white/78">
                        Мария Иванова
                      </div>
                      <div className="mt-1 text-[11px] text-black/42 dark:text-white/36">
                        web → client card → reminder
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-black/35 dark:text-white/32" />
                  </div>
                </SoftPanel>
              </div>
            </Card>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-5 sm:p-6">
            <SectionLabel>{currentLocale === 'ru' ? 'Как работает' : 'How it works'}</SectionLabel>
            <h2 className="mt-5 text-[30px] font-semibold leading-[1.02] tracking-[-0.075em] sm:text-[42px]">
              {t.flowTitle}
            </h2>
            <p className="mt-4 text-[13.5px] leading-7 text-black/52 dark:text-white/44">
              {t.flowText}
            </p>

            <div className="mt-6 space-y-3">
              {t.flow.map((item) => (
                <ChannelNode key={item.title} item={item} />
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionLabel>{currentLocale === 'ru' ? 'Цепочка продукта' : 'Product chain'}</SectionLabel>
            <h2 className="mt-5 text-[30px] font-semibold leading-[1.02] tracking-[-0.075em] sm:text-[42px]">
              {t.productTitle}
            </h2>
            <p className="mt-4 max-w-[760px] text-[13.5px] leading-7 text-black/52 dark:text-white/44">
              {t.productText}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {t.product.map((item, index) => (
                <FeatureCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="p-5 sm:p-6">
            <SectionLabel>{currentLocale === 'ru' ? 'Аудитория' : 'Audience'}</SectionLabel>
            <h2 className="mt-5 text-[30px] font-semibold leading-[1.02] tracking-[-0.075em] sm:text-[42px]">
              {t.audienceTitle}
            </h2>
            <p className="mt-4 max-w-[760px] text-[13.5px] leading-7 text-black/52 dark:text-white/44">
              {t.audienceText}
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {t.audience.map((item) => (
                <div
                  key={item}
                  className="flex min-h-[58px] items-center gap-2 rounded-[12px] border border-black/[0.07] bg-black/[0.025] px-3 text-[12px] font-semibold text-black/62 dark:border-white/[0.075] dark:bg-white/[0.035] dark:text-white/58"
                >
                  <Check className="size-3.5 shrink-0 text-black/42 dark:text-white/36" />
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionLabel>{currentLocale === 'ru' ? 'Фокус' : 'Focus'}</SectionLabel>
            <h2 className="mt-5 text-[30px] font-semibold leading-[1.02] tracking-[-0.075em] sm:text-[38px]">
              {t.compareTitle}
            </h2>
            <p className="mt-4 text-[13.5px] leading-7 text-black/52 dark:text-white/44">
              {t.compareText}
            </p>

            <div className="mt-6 grid gap-3">
              {t.compare.map(([title, text], index) => (
                <SoftPanel
                  key={title}
                  className={cn(
                    'p-4',
                    index === 1 && 'border-black/[0.12] bg-black/[0.045] dark:border-white/[0.12] dark:bg-white/[0.055]',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[10px] border border-black/[0.08] bg-[#fbfbfa] dark:border-white/[0.08] dark:bg-[#101010]">
                      {index === 1 ? <Sparkles className="size-4" /> : <Layers3 className="size-4" />}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold tracking-[-0.025em] text-black/78 dark:text-white/78">
                        {title}
                      </div>
                      <div className="mt-1 text-[12px] leading-5 text-black/46 dark:text-white/40">
                        {text}
                      </div>
                    </div>
                  </div>
                </SoftPanel>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-[170px_minmax(0,1fr)]">
              <SoftPanel className="flex min-h-[170px] items-center justify-center p-5">
                <BrandLogo className="w-[148px]" />
              </SoftPanel>
              <div>
                <SectionLabel>{currentLocale === 'ru' ? 'Брендинг' : 'Branding'}</SectionLabel>
                <h2 className="mt-5 text-[30px] font-semibold leading-[1.02] tracking-[-0.075em] sm:text-[40px]">
                  {t.brandTitle}
                </h2>
                <p className="mt-4 text-[13.5px] leading-7 text-black/52 dark:text-white/44">
                  {t.brandText}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                [Palette, currentLocale === 'ru' ? 'Цвета и стиль' : 'Colors and style'],
                [Star, currentLocale === 'ru' ? 'Отзывы и доверие' : 'Reviews and trust'],
                [Copy, currentLocale === 'ru' ? 'Своя ссылка' : 'Own link'],
              ].map(([Icon, label]) => {
                const NodeIcon = Icon as LucideIcon;
                return (
                  <SoftPanel key={label as string} className="p-3">
                    <NodeIcon className="size-4 text-black/48 dark:text-white/42" />
                    <div className="mt-3 text-[12px] font-semibold text-black/62 dark:text-white/58">
                      {label as string}
                    </div>
                  </SoftPanel>
                );
              })}
            </div>
          </Card>

          <Card className="relative overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_280px_at_100%_0%,rgba(0,0,0,0.045),transparent_62%)] dark:bg-[radial-gradient(700px_280px_at_100%_0%,rgba(255,255,255,0.055),transparent_62%)]" />
            <div className="relative z-10">
              <SectionLabel>{currentLocale === 'ru' ? 'Главный принцип' : 'Main principle'}</SectionLabel>
              <h2 className="mt-5 max-w-[760px] text-[32px] font-semibold leading-[1.02] tracking-[-0.08em] sm:text-[48px]">
                {t.bottomTitle}
              </h2>
              <p className="mt-5 max-w-[780px] text-[14px] leading-7 text-black/54 dark:text-white/44">
                {t.bottomText}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  [Clock3, currentLocale === 'ru' ? 'Запись' : 'Booking'],
                  [UserRound, currentLocale === 'ru' ? 'Клиент' : 'Client'],
                  [WalletCards, currentLocale === 'ru' ? 'Повтор' : 'Repeat'],
                ].map(([Icon, label]) => {
                  const NodeIcon = Icon as LucideIcon;
                  return (
                    <SoftPanel key={label as string} className="p-4">
                      <NodeIcon className="size-4 text-black/48 dark:text-white/42" />
                      <div className="mt-8 text-[18px] font-semibold tracking-[-0.055em] text-black/76 dark:text-white/72">
                        {label as string}
                      </div>
                    </SoftPanel>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[11px] bg-black px-4 text-[12px] font-semibold text-white transition active:scale-[0.99] dark:bg-white dark:text-black"
                >
                  {t.primaryCta}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[11px] border border-black/[0.08] bg-white/45 px-4 text-[12px] font-semibold text-black/60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/54"
                >
                  {currentLocale === 'ru' ? 'Открыть кабинет' : 'Open dashboard'}
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
