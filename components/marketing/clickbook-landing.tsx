'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Menu,
  MessageCircle,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Store,
  Users,
  WandSparkles,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const navItems = [
  { label: 'Возможности', href: '#features' },
  { label: 'Для кого', href: '#audience' },
  { label: 'Как работает', href: '#how' },
  { label: 'Тарифы', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const badges = ['Без лишних звонков', '24/7 онлайн-запись', 'Удобно для клиентов'];

const features: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: CalendarCheck,
    title: 'Онлайн-запись 24/7',
    text: 'Клиенты бронируют услуги в любое время — даже когда вы заняты или не на связи.',
  },
  {
    icon: CalendarDays,
    title: 'Автоматическое расписание',
    text: 'Свободные окна, занятость специалистов и график работы всегда под контролем.',
  },
  {
    icon: Bell,
    title: 'Напоминания клиентам',
    text: 'Уменьшайте количество неявок с помощью автоматических уведомлений о записи.',
  },
  {
    icon: Users,
    title: 'Удобная база клиентов',
    text: 'Храните историю визитов, контакты, заметки и предпочтения клиентов в одном месте.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Управление услугами и специалистами',
    text: 'Настраивайте услуги, длительность, цены, сотрудников и доступные временные слоты.',
  },
  {
    icon: Zap,
    title: 'Быстрый запуск без сложных настроек',
    text: 'Создайте страницу бронирования за несколько минут без сложных интеграций.',
  },
];

const audiences: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Scissors, title: 'Салоны красоты', text: 'Маникюр, косметология, уход, spa и комплексные услуги.' },
  { icon: Store, title: 'Барбершопы', text: 'Запись к мастерам, управление сменами и повторные визиты.' },
  { icon: Sparkles, title: 'Частные специалисты', text: 'Идеально для мастеров, консультантов, тренеров и экспертов.' },
  { icon: Stethoscope, title: 'Клиники и кабинеты', text: 'Приемы, консультации, кабинеты, специалисты и уведомления.' },
  { icon: WandSparkles, title: 'Студии и школы', text: 'Уроки, занятия, мастер-классы, групповые и личные встречи.' },
  { icon: BriefcaseBusiness, title: 'Сервисные компании', text: 'Выезды, диагностика, консультации и работа с заявками.' },
];

const steps = [
  'Бизнес добавляет услуги, специалистов и расписание',
  'Клиент выбирает услугу, дату и удобное время',
  'Запись автоматически появляется в календаре',
  'Команда управляет заявками, клиентами и загрузкой',
];

const pricing = [
  {
    name: 'Старт',
    subtitle: 'для одного специалиста',
    price: '₽0',
    period: '/ месяц',
    description: 'Базовый набор для быстрого запуска онлайн-записи.',
    features: ['1 специалист', 'Страница бронирования', 'До 50 записей', 'База клиентов', 'Email-уведомления'],
    cta: 'Начать со Старта',
  },
  {
    name: 'Бизнес',
    subtitle: 'для команды',
    price: '₽990',
    period: '/ месяц',
    description: 'Оптимальный тариф для растущего сервиса и нескольких сотрудников.',
    features: ['До 10 специалистов', 'Умное расписание', 'SMS и email-напоминания', 'Статистика записей', 'Приоритетная поддержка'],
    cta: 'Выбрать Бизнес',
    popular: true,
  },
  {
    name: 'Pro',
    subtitle: 'для растущего бизнеса',
    price: '₽2490',
    period: '/ месяц',
    description: 'Расширенные возможности для сети, филиалов и активных команд.',
    features: ['Неограниченно специалистов', 'Филиалы и роли', 'Расширенная аналитика', 'Интеграции', 'Персональные настройки'],
    cta: 'Перейти на Pro',
  },
];

const testimonials = [
  {
    quote:
      'После запуска КликБук администратор перестал постоянно отвечать на звонки. Клиенты сами выбирают время, а мы видим загрузку мастеров в одном календаре.',
    name: 'Анна Морозова',
    role: 'владелец салона красоты',
  },
  {
    quote:
      'Я работаю одна, и раньше записи терялись в мессенджерах. Теперь у клиентов есть аккуратная страница, а у меня — понятное расписание на неделю.',
    name: 'Мария Лебедева',
    role: 'частный мастер',
  },
  {
    quote:
      'Для клиники важно, чтобы запись была простой и надежной. КликБук помогает быстро распределять приемы и не путаться в заявках.',
    name: 'Игорь Ковалев',
    role: 'администратор клиники',
  },
];

const faqs = [
  {
    q: 'Можно ли пользоваться бесплатно?',
    a: 'Да. Вы можете начать с базового тарифа, протестировать онлайн-запись и позже перейти на расширенный план.',
  },
  {
    q: 'Нужно ли устанавливать приложение?',
    a: 'Нет. КликБук работает онлайн: бизнес управляет записями в веб-интерфейсе, а клиенты бронируют услуги по ссылке.',
  },
  {
    q: 'Подходит ли сервис для команды?',
    a: 'Да. Можно добавлять специалистов, настраивать графики, услуги, роли и отслеживать загрузку каждого сотрудника.',
  },
  {
    q: 'Можно ли настроить свои услуги?',
    a: 'Конечно. Вы задаете название, описание, стоимость, длительность услуги и специалистов, которые ее выполняют.',
  },
  {
    q: 'Будут ли уведомления клиентам?',
    a: 'Да. Сервис может отправлять напоминания о записи, чтобы клиент не забыл о визите, а бизнес снизил количество неявок.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function SectionHeading({
  eyebrow,
  title,
  text,
  centered = true,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  centered?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      className={`${centered ? 'mx-auto text-center' : ''} max-w-3xl`}
    >
      {eyebrow ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/70 backdrop-blur">
          <Sparkles className="h-4 w-4" />
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{title}</h2>
      {text ? <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">{text}</p> : null}
    </motion.div>
  );
}

function PrimaryButton({ children, className = '', href = '#pricing' }: { children: ReactNode; className?: string; href?: string }) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/30 ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
    </a>
  );
}

function SecondaryButton({ children, className = '', href = '#demo' }: { children: ReactNode; className?: string; href?: string }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-lg shadow-slate-200/60 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-xl ${className}`}
    >
      {children}
    </a>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-3" aria-label="КликБук — на главную">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/25">
        <CalendarCheck className="h-5 w-5" />
      </div>
      <div className="leading-none">
        <span className="block text-lg font-black tracking-tight text-slate-950">КликБук</span>
        <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">booking SaaS</span>
      </div>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-2xl">
      <Container>
        <div className="flex h-20 items-center justify-between gap-6">
          <Logo />

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/70 p-1.5 shadow-sm shadow-slate-200/70 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a href="#demo" className="text-sm font-bold text-slate-600 transition hover:text-blue-700">
              Демо
            </a>
            <PrimaryButton className="px-5 py-3">Попробовать бесплатно</PrimaryButton>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm lg:hidden"
            aria-label="Открыть меню"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-slate-100 bg-white/95 px-4 pb-5 pt-2 shadow-xl shadow-slate-200/40 backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
              >
                {item.label}
              </a>
            ))}
            <PrimaryButton className="mt-2 w-full">Попробовать бесплатно</PrimaryButton>
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}

function HeroMockup() {
  const bookings = [
    { time: '10:00', name: 'Ольга', service: 'Маникюр', status: 'Подтверждено' },
    { time: '12:30', name: 'Дмитрий', service: 'Стрижка', status: 'Ожидает' },
    { time: '15:00', name: 'Елена', service: 'Консультация', status: 'Новая' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
    >
      <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute -bottom-10 -right-8 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-2xl sm:p-5">
        <div className="rounded-[1.5rem] border border-slate-100 bg-slate-950 p-4 text-white shadow-2xl shadow-slate-900/20">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-200">Панель записи</p>
              <h3 className="mt-1 text-xl font-black">Сегодня, 18 июня</h3>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/10">+28% записей</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl bg-white p-4 text-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black">Июнь</span>
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-400">
                {['П', 'В', 'С', 'Ч', 'П', 'С', 'В'].map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-600">
                {Array.from({ length: 28 }).map((_, index) => {
                  const day = index + 1;
                  const active = [7, 12, 18, 22].includes(day);
                  return (
                    <div
                      key={day}
                      className={`flex aspect-square items-center justify-center rounded-xl ${
                        active
                          ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-slate-50'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.time}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 + index * 0.12 }}
                  className="rounded-3xl border border-white/10 bg-white/10 p-3 backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-violet-400 text-sm font-black">
                        {booking.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white">{booking.name}</p>
                        <p className="text-sm text-slate-300">{booking.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{booking.time}</p>
                      <p className="mt-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-200">{booking.status}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['Записей', '42', '+12%'],
            ['Клиентов', '318', '+24'],
            ['Свободно', '8', 'окон'],
          ].map(([label, value, hint]) => (
            <div key={label} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-black text-slate-950">{value}</span>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{hint}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-32 sm:pb-24 lg:pb-32 lg:pt-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]" />
      <div className="absolute left-1/2 top-24 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: 'easeOut' }}>
            <div className="mb-7 flex flex-wrap gap-3">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm shadow-blue-100/70 backdrop-blur"
                >
                  <Check className="h-4 w-4 text-blue-600" />
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl lg:leading-[1.02]">
              Онлайн-запись для вашего бизнеса в пару кликов
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              КликБук помогает клиентам быстро бронировать услуги, а бизнесу — управлять расписанием, заявками и клиентами в одном удобном интерфейсе.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <PrimaryButton>Начать бесплатно</PrimaryButton>
              <SecondaryButton>Посмотреть демо</SecondaryButton>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200 pt-7">
              {[
                ['5 мин', 'на запуск'],
                ['24/7', 'прием заявок'],
                ['−35%', 'неявок'],
              ].map(([value, label]) => (
                <div key={value}>
                  <p className="text-2xl font-black text-slate-950">{value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <HeroMockup />
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({ feature }: { feature: { icon: LucideIcon; title: string; text: string } }) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      className="group rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50 transition duration-300 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/80"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-blue-700 ring-1 ring-blue-100 transition duration-300 group-hover:scale-110 group-hover:from-blue-600 group-hover:to-violet-600 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-black text-slate-950">{feature.title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
    </motion.div>
  );
}

function Features() {
  return (
    <section id="features" className="bg-slate-50 py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="Возможности"
          title="Почему выбирают КликБук"
          text="Все необходимое для приема записей, управления расписанием и повышения качества клиентского сервиса — в одном аккуратном интерфейсе."
        />

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function Audience() {
  return (
    <section id="audience" className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-32">
      <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />
      <div className="absolute -left-32 bottom-24 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />

      <Container className="relative">
        <SectionHeading
          eyebrow="Для кого"
          title="Подходит бизнесу, где важны время, запись и сервис"
          text="КликБук легко адаптируется под разные услуги: от индивидуальных мастеров до команд с несколькими специалистами и филиалами."
        />

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-slate-200/50 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-100/70"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition duration-300 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-violet-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                    <p className="mt-2 leading-7 text-slate-600">{item.text}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bg-slate-950 py-20 text-white sm:py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <SectionHeading
            centered={false}
            eyebrow="Как это работает"
            title="От настройки до первой записи — без лишней сложности"
            text="КликБук превращает процесс бронирования в понятный путь для клиента и удобный рабочий инструмент для команды."
          />

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid gap-4">
            {steps.map((step, index) => (
              <motion.div key={step} variants={fadeUp} className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition hover:bg-white/[0.09]">
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-violet-400 opacity-0 transition group-hover:opacity-100" />
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-950 shadow-xl shadow-black/20">{index + 1}</div>
                  <p className="text-lg font-bold leading-7 text-slate-100">{step}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function DashboardDemo() {
  const dayStats: Array<{ label: string; value: string; icon: LucideIcon }> = [
    { label: 'Записей сегодня', value: '24', icon: CalendarCheck },
    { label: 'Новых клиентов', value: '7', icon: Users },
    { label: 'Средняя загрузка', value: '82%', icon: Clock3 },
  ];

  const clients = ['Наталья Смирнова', 'Артем Волков', 'Виктория Орлова', 'Павел Соколов'];

  return (
    <section id="demo" className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading
            centered={false}
            eyebrow="Интерфейс"
            title="Понятная панель управления для всей команды"
            text="Видите записи, клиентов, услуги, статусы и статистику в одном визуально чистом dashboard. Mockup ниже собран без изображений — только из UI-блоков."
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-blue-100 via-violet-100 to-white blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-2xl shadow-slate-200/80 sm:p-5">
              <div className="mb-4 flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-400">Dashboard</p>
                  <h3 className="text-xl font-black text-slate-950">Календарь записей</h3>
                </div>
                <div className="flex -space-x-2">
                  {['A', 'M', 'K'].map((letter) => (
                    <div key={letter} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-black text-white">
                      {letter}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-black text-slate-950">Расписание</h4>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Сегодня</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      ['09:30', 'Массаж', 'Подтверждено', 'bg-emerald-50 text-emerald-700'],
                      ['11:00', 'Стрижка', 'Ожидает', 'bg-amber-50 text-amber-700'],
                      ['14:30', 'Консультация', 'Новая', 'bg-blue-50 text-blue-700'],
                      ['17:00', 'Маникюр', 'Подтверждено', 'bg-emerald-50 text-emerald-700'],
                    ].map(([time, service, status, tone]) => (
                      <div key={`${time}-${service}`} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50/40">
                        <div className="w-14 text-sm font-black text-slate-500">{time}</div>
                        <div className="h-10 w-1 rounded-full bg-gradient-to-b from-blue-600 to-violet-600" />
                        <div className="flex-1">
                          <p className="font-bold text-slate-950">{service}</p>
                          <p className="text-sm text-slate-500">Специалист назначен</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <h4 className="font-black text-slate-950">Статистика за день</h4>
                    <div className="mt-4 grid gap-3">
                      {dayStats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <div key={stat.label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-bold text-slate-500">{stat.label}</span>
                            </div>
                            <span className="font-black text-slate-950">{stat.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-xl shadow-slate-950/20">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-black">Клиенты</h4>
                      <Users className="h-5 w-5 text-blue-300" />
                    </div>
                    <div className="space-y-3">
                      {clients.map((client, index) => (
                        <div key={client} className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-black ring-1 ring-white/10">{index + 1}</div>
                          <div>
                            <p className="text-sm font-bold">{client}</p>
                            <p className="text-xs text-slate-400">История визитов доступна</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 p-4 text-white shadow-xl shadow-blue-500/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-100">Карточка услуги</p>
                    <h4 className="mt-1 text-xl font-black">Первичная консультация</h4>
                    <p className="mt-1 text-sm text-blue-100">60 минут · 2 специалиста · онлайн-предоплата</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-700">
                    <ShieldCheck className="h-4 w-4" /> Активна
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-slate-50 py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="Тарифы"
          title="Выберите формат, который подходит вашему бизнесу"
          text="Начните с простого сценария и расширяйте возможности по мере роста команды, клиентской базы и количества записей."
        />

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricing.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className={`relative rounded-[2rem] border p-6 shadow-xl transition duration-300 ${
                plan.popular ? 'border-blue-200 bg-slate-950 text-white shadow-blue-950/20' : 'border-slate-200 bg-white text-slate-950 shadow-slate-200/60'
              }`}
            >
              {plan.popular ? (
                <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                  Популярный
                </div>
              ) : null}

              <div className="pr-28">
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <p className={`mt-1 text-sm font-bold ${plan.popular ? 'text-blue-200' : 'text-slate-500'}`}>{plan.subtitle}</p>
              </div>

              <div className="mt-8 flex items-end gap-1">
                <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                <span className={`pb-2 text-sm font-bold ${plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>{plan.period}</span>
              </div>
              <p className={`mt-5 leading-7 ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>{plan.description}</p>

              <div className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${plan.popular ? 'bg-white text-blue-700' : 'bg-blue-50 text-blue-700'}`}>
                      <Check className="h-4 w-4" />
                    </div>
                    <span className={`text-sm font-semibold ${plan.popular ? 'text-slate-100' : 'text-slate-700'}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href="#top"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-black transition duration-300 ${
                  plan.popular ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="Отзывы"
          title="Команды ценят простоту, скорость и порядок"
          text="КликБук выглядит привычно для клиентов и дает бизнесу ощущение контроля над каждой записью."
        />

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <motion.figure
              key={item.name}
              variants={fadeUp}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/70"
            >
              <div className="mb-5 flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <blockquote className="leading-8 text-slate-700">“{item.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-blue-500/20">
                  {item.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div>
                  <p className="font-black text-slate-950">{item.name}</p>
                  <p className="text-sm font-medium text-slate-500">{item.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-slate-50 py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <SectionHeading
            centered={false}
            eyebrow="FAQ"
            title="Частые вопросы о КликБук"
            text="Собрали основные ответы, которые помогают быстро понять, как сервис впишется в ежедневную работу бизнеса."
          />

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} className="space-y-4">
            {faqs.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div key={item.q} variants={fadeUp} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <button type="button" onClick={() => setOpenIndex(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left">
                    <span className="text-base font-black text-slate-950 sm:text-lg">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-blue-700 transition duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen ? (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.25 }} className="px-5 pb-5">
                      <p className="leading-7 text-slate-600">{item.a}</p>
                    </motion.div>
                  ) : null}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-14 text-center text-white shadow-2xl shadow-slate-950/20 sm:px-10 lg:px-20 lg:py-20"
        >
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-blue-100 backdrop-blur">
              <MessageCircle className="h-4 w-4" />
              Меньше звонков — больше записей
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-6xl">Запустите онлайн-запись уже сегодня</h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">Создайте удобный способ бронирования для клиентов и освободите себя от лишних звонков.</p>
            <div className="mt-9">
              <PrimaryButton href="#pricing" className="bg-white text-blue-700 shadow-none hover:shadow-white/10">
                Начать бесплатно
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <Logo />
            <p className="mt-4 leading-7 text-slate-600">КликБук — онлайн-сервис для удобного бронирования услуг, управления расписанием, клиентами и заявками.</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              ['Возможности', '#features'],
              ['Тарифы', '#pricing'],
              ['FAQ', '#faq'],
              ['Контакты', 'mailto:hello@clickbook.example'],
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-sm font-bold text-slate-600 transition hover:text-blue-700">
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 КликБук. Все права защищены.</p>
          <p>Сделано для современного сервиса онлайн-записи.</p>
        </div>
      </Container>
    </footer>
  );
}

export default function LandingPage() {
  const pageSections = useMemo(
    () => [
      <Hero key="hero" />,
      <Features key="features" />,
      <Audience key="audience" />,
      <HowItWorks key="how" />,
      <DashboardDemo key="demo" />,
      <Pricing key="pricing" />,
      <Testimonials key="testimonials" />,
      <FAQ key="faq" />,
      <FinalCTA key="cta" />,
    ],
    [],
  );

  return (
    <main className="min-h-screen scroll-smooth bg-white font-sans text-slate-900 antialiased">
      <Header />
      {pageSections}
      <Footer />
    </main>
  );
}
