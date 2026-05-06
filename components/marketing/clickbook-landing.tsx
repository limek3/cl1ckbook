'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  Users,
  Bell,
  BarChart3,
  Building2,
  Sparkles,
  Scissors,
  Stethoscope,
  Dumbbell,
  GraduationCap,
  UserRound,
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  Shield,
  TrendingUp,
  Star,
  ChevronRight,
  Globe,
  MessageSquare,
  Settings,
  Quote,
  Phone,
  PiggyBank,
  Search,
  Bot,
  CreditCard,
  Check,
  Copy,
  Bookmark,
  Plus,
  Home,
  Image as ImageIcon,
  Calendar,
  ListChecks,
  TrendingDown,
  Workflow,
  ShieldCheck,
} from 'lucide-react';

// Brand
const ACCENT = '#127dfe';

// ───────────────────────── Helpers
function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-6 lg:px-10 ${className}`}>{children}</div>;
}

function Reveal({
  children,
  delay = 0,
  y = 24,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  href = '#cta',
  className = '',
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(15,23,42,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_20px_42px_-12px_rgba(15,23,42,0.8)] active:translate-y-0 ${className}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function GhostButton({
  children,
  href = '#features',
  className = '',
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-[14px] font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_24px_-12px_rgba(15,23,42,0.2)] ${className}`}
    >
      {children}
    </Link>
  );
}

// ───────────────────────── Header
function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200/70 bg-white/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2">
          <Image
            src="/brand/clickbook-logo-dark-transparent.png"
            alt="КликБук"
            width={140}
            height={32}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {[
            ['Возможности', '#features'],
            ['Для кого', '#segments'],
            ['Как работает', '#how'],
            ['Тарифы', '#pricing'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-[13.5px] font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden text-[13.5px] font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline"
          >
            Войти
          </Link>
          <PrimaryButton href="#cta" className="!px-4 !py-2.5 !text-[13px]">
            Попробовать
          </PrimaryButton>
        </div>
      </Container>
    </header>
  );
}

// ───────────────────────── Hero
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yMockup = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacityMockup = useTransform(scrollYProgress, [0, 0.6], [1, 0.4]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-40 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full opacity-50 blur-[120px]"
          style={{
            background: 'radial-gradient(circle at center, rgba(18,125,254,0.22), rgba(18,125,254,0) 70%)',
          }}
        />
        <div className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-violet-100/50 blur-3xl" />
        <div className="absolute left-0 top-60 h-[380px] w-[380px] rounded-full bg-cyan-100/40 blur-3xl" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
        }}
      />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mx-auto max-w-3xl text-center"
        >
          <Eyebrow>Платформа онлайн-записи нового поколения</Eyebrow>
          <h1 className="mt-6 text-[44px] font-semibold leading-[1.04] tracking-[-0.035em] text-slate-900 sm:text-[60px] lg:text-[76px]">
            Онлайн-запись
            <br />и управление клиентами для{' '}
            <span className="relative inline-block">
              <span className="relative z-10">современного бизнеса</span>
              <motion.span
                aria-hidden
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="absolute bottom-1 left-0 h-[10px] w-full rounded-full"
                style={{ background: `${ACCENT}22` }}
              />
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-[16.5px] leading-relaxed text-slate-600 sm:text-[18px]">
            КликБук помогает клиентам записываться в пару кликов, а бизнесу — управлять расписанием,
            сотрудниками, заявками и клиентской базой без хаоса.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryButton href="#cta">Начать бесплатно</PrimaryButton>
            <GhostButton href="#features">Посмотреть возможности</GhostButton>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-slate-500">
            {['Бесплатный старт', 'Без карты', 'Запуск за 5 минут'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Mockup */}
        <motion.div style={{ y: yMockup, opacity: opacityMockup }} className="relative mx-auto mt-16 max-w-[1200px]">
          <div
            className="absolute -inset-x-10 -inset-y-10 -z-10 rounded-[44px] opacity-70 blur-[80px]"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 40%, rgba(18,125,254,0.25), rgba(18,125,254,0) 70%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="rounded-[28px] border border-slate-200/80 bg-white/90 p-2.5 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl"
          >
            <DashboardMockMain />
          </motion.div>

          {/* Floating widgets */}
          <FloatingChip
            className="left-[-3%] top-[12%] hidden lg:flex"
            delay={0.7}
            icon={<Bell className="h-4 w-4" />}
            tone="bg-amber-50 text-amber-600"
            title="Напоминание отправлено"
            sub="Анна · через 2 часа"
          />
          <FloatingChip
            className="right-[-3%] top-[34%] hidden lg:flex"
            delay={0.9}
            icon={<TrendingUp className="h-4 w-4" />}
            tone="bg-emerald-50 text-emerald-600"
            title="+38% записей"
            sub="за этот месяц"
          />
          <FloatingChip
            className="left-[2%] bottom-[12%] hidden lg:flex"
            delay={1.1}
            icon={<MessageSquare className="h-4 w-4" />}
            tone="bg-violet-50 text-violet-600"
            title="Новая заявка"
            sub="Дарья · Маникюр"
          />
        </motion.div>
      </Container>
    </section>
  );
}

function FloatingChip({
  className = '',
  icon,
  title,
  sub,
  tone,
  delay = 0,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`absolute z-10 items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.18)] backdrop-blur ${className}`}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeInOut' }}
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}
      >
        {icon}
      </motion.div>
      <div>
        <div className="text-[12.5px] font-semibold text-slate-900">{title}</div>
        <div className="text-[11px] text-slate-500">{sub}</div>
      </div>
    </motion.div>
  );
}

// ───────────────────────── Mockup primitives (matches platform style)
function MockSidebar({ active = 'home' }: { active?: 'home' | 'today' | 'stats' }) {
  const sections = [
    {
      title: 'РЕЖИМЫ',
      items: [
        { label: 'Рабочий', sub: 'боевой кабинет', icon: <Globe className="h-3.5 w-3.5" />, active: false, dot: true },
        { label: 'Демо', sub: 'пример профиля', icon: <Sparkles className="h-3.5 w-3.5" />, active: false },
      ],
      mode: true,
    },
    {
      title: 'ОСНОВНОЕ',
      items: [
        { label: 'Главная', icon: <Home className="h-3.5 w-3.5" />, active: active === 'home' },
        { label: 'Записи на сегодня', icon: <Calendar className="h-3.5 w-3.5" />, active: active === 'today', badge: '2' },
        { label: 'Статистика', icon: <BarChart3 className="h-3.5 w-3.5" />, active: active === 'stats' },
      ],
    },
    {
      title: 'РАБОТА',
      items: [
        { label: 'Чаты', icon: <MessageSquare className="h-3.5 w-3.5" />, badge: '[бот]' },
        { label: 'Клиенты', icon: <Users className="h-3.5 w-3.5" /> },
      ],
    },
    {
      title: 'ВИТРИНА И ЗАПИСЬ',
      items: [
        { label: 'Услуги', icon: <Sparkles className="h-3.5 w-3.5" /> },
        { label: 'График', icon: <CalendarDays className="h-3.5 w-3.5" /> },
        { label: 'Шаблоны', icon: <ListChecks className="h-3.5 w-3.5" /> },
      ],
    },
    {
      title: 'УПРАВЛЕНИЕ',
      items: [
        { label: 'Профиль', icon: <UserRound className="h-3.5 w-3.5" /> },
        { label: 'Внешний вид', icon: <ImageIcon className="h-3.5 w-3.5" /> },
        { label: 'Уведомления', icon: <Bell className="h-3.5 w-3.5" /> },
        { label: 'Продвижение', icon: <Zap className="h-3.5 w-3.5" /> },
      ],
    },
    {
      title: 'ОПЛАТА И ДОСТУП',
      items: [{ label: 'Подписка', icon: <CreditCard className="h-3.5 w-3.5" /> }],
    },
  ];

  return (
    <aside className="col-span-3 hidden border-r border-slate-200 bg-[#fafbfc] p-3.5 lg:block">
      <div className="flex items-center gap-2 px-2 pt-1">
        <Image
          src="/brand/clickbook-logo-dark-transparent.png"
          alt="КликБук"
          width={100}
          height={20}
          className="h-5 w-auto"
        />
      </div>
      <div className="mt-1 px-2 text-[10px] text-slate-400">Кабинет мастера</div>

      <div className="relative mt-4 px-1">
        <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          readOnly
          placeholder="Поиск"
          className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-[11px] text-slate-500 outline-none"
        />
      </div>

      <div className="mt-4 space-y-4 px-1">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {section.title}
            </div>
            <div className={`mt-2 ${section.mode ? 'grid grid-cols-2 gap-1.5' : 'space-y-0.5'}`}>
              {section.items.map((it: any) => {
                if (section.mode) {
                  return (
                    <div
                      key={it.label}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"
                    >
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-700">
                        <span className="text-slate-500">{it.icon}</span>
                        {it.label}
                      </div>
                      <div className="mt-0.5 text-[9px] text-slate-400">{it.sub}</div>
                    </div>
                  );
                }
                return (
                  <div
                    key={it.label}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-medium transition ${
                      it.active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={it.active ? 'text-white' : 'text-slate-500'}>{it.icon}</span>
                      {it.label}
                    </span>
                    {it.badge && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                          it.active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {it.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function MockProfileFooter() {
  return (
    <div className="hidden border-t border-slate-200 bg-[#fafbfc] px-4 py-2.5 lg:block">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-semibold text-slate-600">
          Б
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-semibold text-slate-900">Борис</div>
          <div className="text-[9px] text-slate-500">@admin</div>
        </div>
        <Bookmark className="h-3.5 w-3.5 text-slate-400" />
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-medium text-slate-500">{label}</div>
        {icon && (
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-1.5 text-[20px] font-semibold leading-none tracking-tight text-slate-900">
        {value}
      </div>
      {hint && <div className="mt-1.5 text-[9.5px] text-slate-400">{hint}</div>}
    </div>
  );
}

function MockSection({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <div className="text-[13px] font-semibold tracking-tight text-slate-900">{title}</div>
        {desc && <div className="mt-0.5 text-[10.5px] text-slate-500">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

// ───────────────────────── Mockups
function DashboardMockMain() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-[#f5f6f8]">
      {/* topbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-0.5 text-[10px] text-slate-500">
          app.klikbuk.com
        </div>
        <div className="h-2.5 w-12" />
      </div>

      <div className="grid grid-cols-12">
        <MockSidebar active="home" />

        <main className="col-span-12 flex flex-col lg:col-span-9">
          <div className="flex-1 px-5 py-5 lg:px-7 lg:py-6">
            <div>
              <div className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-slate-900 sm:text-[32px]">
                Кабинет мастера
              </div>
              <div className="mt-1.5 text-[12px] text-slate-500">
                Минималистичный рабочий экран: записи, публичная ссылка, деньги, трафик и клиенты без шума.
              </div>
            </div>

            {/* Persona link */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-medium text-slate-500">Персональная ссылка</div>
              <div className="mt-1 flex items-center gap-3">
                <div className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
                  /m/klikbuk-demo
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Отправляйте клиентам или закрепите в Telegram / Instagram.
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                <MetricTile label="Конверсия" value="100%" hint="конверсия" />
                <MetricTile label="Новые клиенты" value="10" hint="новых за 30 дней" />
                <MetricTile label="Источник" value="Web" hint="channel" />
                <MetricTile label="Визиты" value="10" hint="визитов" />
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <MetricTile
                label="Заявки сегодня"
                value="10"
                hint="7 запланировано"
                icon={<Calendar className="h-3 w-3" />}
              />
              <MetricTile
                label="Факт недели"
                value="2 750 ₽"
                hint="средний чек 1 375 ₽"
                icon={<PiggyBank className="h-3 w-3" />}
              />
              <MetricTile
                label="Просмотры"
                value="10"
                hint="100% конверсия"
                icon={<Globe className="h-3 w-3" />}
              />
              <MetricTile
                label="Повторные"
                value="0%"
                hint="10 новых за 30 дней"
                icon={<Users className="h-3 w-3" />}
              />
            </div>

            {/* Two columns */}
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <MockSection title="Ближайшая запись" desc="Клиент в фокусе и очередь после него.">
                <div className="rounded-xl border border-slate-200 bg-[#fafbfc] p-3.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                      <span className="font-medium text-slate-700">В фокусе</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-slate-400">Следующая запись</div>
                      <div className="text-[10px] font-medium text-slate-700">30 апр · 16:00</div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-end justify-between">
                    <div>
                      <div className="text-[20px] font-semibold tracking-tight text-slate-900">Дарья</div>
                      <div className="text-[10.5px] text-slate-500">Укрепление гелем</div>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
                        Пришёл
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[9px]">
                      <div className="text-slate-400">Слот</div>
                      <div className="font-semibold text-slate-700">30 апр · 16:00</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[9px]">
                      <div className="text-slate-400">Телефон</div>
                      <div className="font-semibold text-slate-700">+7 999 ···</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[9px]">
                      <div className="text-slate-400">Статус</div>
                      <div className="font-semibold text-emerald-600">Пришёл</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[10px] font-medium text-slate-500">Очередь</div>
                <div className="mt-1.5 space-y-1.5">
                  {[
                    { n: 'Мария', s: 'Маникюр + покрытие', t: '5 мая · 09:30' },
                    { n: 'Ольга', s: 'Снятие + укрепление', t: '5 мая · 11:00' },
                    { n: 'Елена', s: 'Наращивание', t: '5 мая · 12:30' },
                  ].map((b) => (
                    <div
                      key={b.n}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-2.5 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-6 w-1 rounded-full"
                          style={{ background: ACCENT, opacity: 0.6 }}
                        />
                        <div>
                          <div className="text-[11px] font-semibold text-slate-900">{b.n}</div>
                          <div className="text-[9px] text-slate-500">{b.s}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-medium text-slate-600">{b.t}</div>
                        <div className="text-[8.5px] text-slate-400">Запланирована</div>
                      </div>
                    </div>
                  ))}
                </div>
              </MockSection>

              <MockSection title="Услуги" desc="Что чаще выбирают клиенты.">
                <div className="space-y-2">
                  {[
                    { n: '#1', name: 'Маникюр + покрытие', meta: '2 записей · 45 мин', price: '0 ₽', pct: 0.3 },
                    { n: '#2', name: 'Укрепление гелем', meta: '2 записей · 75 мин', price: '2 750 ₽', pct: 0.8 },
                    { n: '#3', name: 'Смарт-педикюр', meta: '2 записей · 60 мин', price: '0 ₽', pct: 0.45 },
                    { n: '#4', name: 'Снятие + новый дизайн', meta: '0 записей · 90 мин', price: '0 ₽', pct: 0.05 },
                  ].map((s) => (
                    <div key={s.n} className="rounded-xl border border-slate-100 bg-white p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[8.5px] font-semibold text-slate-500">
                              {s.n}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-900">{s.name}</span>
                          </div>
                          <div className="mt-0.5 text-[9px] text-slate-500">{s.meta}</div>
                        </div>
                        <div className="text-[11px] font-semibold tracking-tight text-slate-900">
                          {s.price}
                        </div>
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.pct * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                          className="h-full rounded-full"
                          style={{ background: ACCENT }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </MockSection>
            </div>
          </div>

          <MockProfileFooter />
        </main>
      </div>
    </div>
  );
}

// Stats mockup screen
function DashboardMockStats() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-[#f5f6f8]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-0.5 text-[10px] text-slate-500">
          app.klikbuk.com / stats
        </div>
        <div className="h-2.5 w-12" />
      </div>
      <div className="grid grid-cols-12">
        <MockSidebar active="stats" />
        <main className="col-span-12 px-5 py-5 lg:col-span-9 lg:px-7 lg:py-6">
          <div className="text-[26px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-[32px]">
            Статистика
          </div>
          <div className="mt-1 text-[12px] text-slate-500">
            Аналитика по записям, доходу, клиентам и публичной странице — в одном спокойном экране.
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[34px]">
              2 750 ₽
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Короткий срез по доходу, записям, просмотрам и конверсии.
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <MetricTile label="Записи за 30 дней" value="10" hint="записей" />
              <MetricTile label="Просмотры страницы" value="10" hint="переходов" />
              <MetricTile label="Конверсия" value="100%" hint="конверсия" />
              <MetricTile label="Средний чек" value="1 375 ₽" hint="средний" />
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[13px] font-semibold tracking-tight text-slate-900">
                  Активность по дням
                </div>
                <div className="mt-0.5 text-[10.5px] text-slate-500">
                  Динамика просмотров, записей, подтверждений и дохода за 30 дн.
                </div>
              </div>
              <div className="flex rounded-md border border-slate-200 p-0.5 text-[10px] font-medium">
                <span className="rounded px-2 py-1 text-slate-500">7 дн.</span>
                <span className="rounded px-2 py-1 text-slate-500">14 дн.</span>
                <span className="rounded bg-slate-900 px-2 py-1 text-white">30 дн.</span>
              </div>
            </div>
            <ChartLine />
          </div>
        </main>
      </div>
      <MockProfileFooter />
    </div>
  );
}

function ChartLine() {
  // 30 days, peak in the middle-late
  const points = Array.from({ length: 30 }, (_, i) => {
    const peak = i === 23 ? 1 : 0;
    const small = Math.max(0, Math.sin(i / 4) * 0.05);
    return Math.max(small, peak);
  });
  const max = Math.max(...points);
  const W = 720;
  const H = 200;
  const stepX = W / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * stepX;
      const y = H - (v / max) * (H - 12) - 6;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `${path} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-[#fafbfc] p-4">
        <svg viewBox={`0 0 ${W} ${H + 24}`} className="h-[180px] w-full">
          <defs>
            <linearGradient id="cb-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.25" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.33, 0.66, 1].map((p, i) => (
            <line
              key={i}
              x1="0"
              x2={W}
              y1={p * H}
              y2={p * H}
              stroke="rgba(15,23,42,0.06)"
              strokeDasharray="3 4"
            />
          ))}
          <motion.path
            d={area}
            fill="url(#cb-grad)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          />
          {/* peak marker */}
          {points.map((v, i) =>
            v === max ? (
              <g key={i}>
                <motion.circle
                  cx={i * stepX}
                  cy={H - (v / max) * (H - 12) - 6}
                  r="5"
                  fill={ACCENT}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.4, duration: 0.4 }}
                />
                <motion.circle
                  cx={i * stepX}
                  cy={H - (v / max) * (H - 12) - 6}
                  r="12"
                  fill={ACCENT}
                  fillOpacity="0.18"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.6 }}
                />
              </g>
            ) : null
          )}
        </svg>
        <div className="mt-2 flex justify-between text-[9px] text-slate-400">
          <span>7 апр</span>
          <span>13 апр</span>
          <span>19 апр</span>
          <span>25 апр</span>
          <span>1 мая</span>
          <span>6 мая</span>
        </div>
      </div>
    </div>
  );
}

// Today bookings mockup
function DashboardMockToday() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-[#f5f6f8]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-0.5 text-[10px] text-slate-500">
          app.klikbuk.com / today
        </div>
        <div className="h-2.5 w-12" />
      </div>
      <div className="grid grid-cols-12">
        <MockSidebar active="today" />
        <main className="col-span-12 px-5 py-5 lg:col-span-9 lg:px-7 lg:py-6">
          <div className="text-[26px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-[32px]">
            Записи на сегодня
          </div>
          <div className="mt-1 text-[12px] text-slate-500">
            Рабочий день мастера: таймлайн, статусы, быстрые действия и карточка клиента.
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[34px]">
              13:00 · Борис
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Ближайшие визиты, статусы и ритм дня в одном спокойном экране.
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <MetricTile label="На сегодня" value="2" hint="Рабочий день" />
              <MetricTile label="Ближайшие" value="2" hint="Дизайн ногтей" />
              <MetricTile label="Запланировано" value="2" hint="Запланирована" />
              <MetricTile label="Завершено" value="0" hint="0% дня закрыто" />
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[13px] font-semibold tracking-tight text-slate-900">Таймлайн дня</div>
                  <div className="mt-0.5 text-[10.5px] text-slate-500">
                    Список визитов сверху вниз. Видно, кто следующий, где плотный блок и где есть окно.
                  </div>
                </div>
                <div className="flex gap-1 rounded-md border border-slate-200 p-0.5 text-[9.5px]">
                  <span className="rounded bg-slate-900 px-2 py-1 text-white">Весь день</span>
                  <span className="rounded px-2 py-1 text-slate-500">Утро</span>
                  <span className="rounded px-2 py-1 text-slate-500">День</span>
                  <span className="rounded px-2 py-1 text-slate-500">Вечер</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { n: 'Борис', s: 'Дизайн ногтей · Проверка', t: '13:00—14:00', state: 'Скоро', tone: 'amber' },
                  { n: 'Борис', s: 'Хочу что-то · входит', t: '15:30—16:30', state: 'Скоро', tone: 'amber' },
                ].map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#fafbfc] px-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-1 rounded-full bg-amber-400" />
                      <div>
                        <div className="text-[12.5px] font-semibold text-slate-900">{b.n}</div>
                        <div className="text-[10px] text-slate-500">{b.s}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10.5px] font-medium text-slate-700">{b.t}</div>
                      <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {b.state}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[13px] font-semibold tracking-tight text-slate-900">Карточка визита</div>
              <div className="mt-0.5 text-[10.5px] text-slate-500">Контакт, заметка и статус.</div>
              <div className="mt-3 rounded-xl border border-slate-100 bg-[#fafbfc] p-3">
                <div className="text-[10px] text-slate-500">Активная запись</div>
                <div className="mt-0.5 text-[16px] font-semibold tracking-tight text-slate-900">Борис</div>
                <div className="text-[10px] text-slate-500">Дизайн ногтей</div>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {['6 мая', '13:00–14:00', '60 мин', 'День'].map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {[
                  ['Время', '13:00–14:00'],
                  ['Телефон', '+7 934 ···'],
                  ['Статус', 'Скоро'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-2.5 py-1.5 text-[10px]"
                  >
                    <span className="text-slate-500">{k}</span>
                    <span className="font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <button className="flex items-center justify-center gap-1 rounded-lg bg-slate-900 px-2.5 py-2 text-[10px] font-semibold text-white">
                  <Phone className="h-3 w-3" />
                  Позвонить
                </button>
                <button className="flex items-center justify-center gap-1 rounded-lg bg-slate-900 px-2.5 py-2 text-[10px] font-semibold text-white">
                  <MessageSquare className="h-3 w-3" />
                  Открыть чат
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <MockProfileFooter />
    </div>
  );
}

// ───────────────────────── Sections
function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <Reveal>
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-5 text-[36px] font-semibold leading-[1.08] tracking-[-0.028em] text-slate-900 sm:text-[48px]">
          {title}
        </h2>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-[15.5px] leading-relaxed text-slate-600">{subtitle}</p>
        )}
      </div>
    </Reveal>
  );
}

function ProblemSolution() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <SectionTitle
          eyebrow="Зачем это нужно"
          title="От хаоса в чатах — к спокойному рабочему экрану"
          subtitle="Записи теряются в мессенджерах, клиенты забывают о визитах, расписание ведётся вручную. КликБук собирает всё в одной системе."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-rose-50/70 via-white to-orange-50/40 p-9">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">Проблема</div>
              <h3 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
                Записи теряются. Расписание — в голове и таблицах.
              </h3>
              <div className="mt-7 space-y-2.5">
                {[
                  'Звонки и переписки в десяти каналах',
                  'Двойные записи и пропущенные визиты',
                  'Нет данных о клиентах и истории',
                  'Часы ручной работы каждый день',
                ].map((it) => (
                  <div key={it} className="flex items-start gap-3 rounded-xl border border-rose-100/70 bg-white/70 px-3.5 py-2.5">
                    <TrendingDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                    <span className="text-[13.5px] text-slate-700">{it}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-[28px] border border-slate-200 bg-white p-9">
              <div
                className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(18,125,254,0.2), transparent 70%)' }}
              />
              <div className="relative">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: ACCENT }}>
                  Решение
                </div>
                <h3 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
                  КликБук собирает всё в одной системе.
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-slate-600">
                  Все записи, клиенты, услуги, сотрудники и расписание — в одном понятном продукте.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  {[
                    { icon: <CalendarDays className="h-4 w-4" />, label: 'Единое расписание' },
                    { icon: <Users className="h-4 w-4" />, label: 'База клиентов' },
                    { icon: <Bell className="h-4 w-4" />, label: 'Авто-напоминания' },
                    { icon: <BarChart3 className="h-4 w-4" />, label: 'Аналитика' },
                  ].map((it) => (
                    <div
                      key={it.label}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12.5px] font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(15,23,42,0.18)]"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                        {it.icon}
                      </div>
                      {it.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Segments() {
  const segments = [
    { icon: <Scissors className="h-5 w-5" />, title: 'Салоны и барбершопы', desc: 'Маникюр, косметология, парикмахерские, студии красоты.' },
    { icon: <Stethoscope className="h-5 w-5" />, title: 'Клиники и врачи', desc: 'Массажисты, wellness- и health-специалисты, частные приёмы.' },
    { icon: <Dumbbell className="h-5 w-5" />, title: 'Спорт и фитнес', desc: 'Тренеры, спорт-студии, йога-центры, фитнес-клубы.' },
    { icon: <GraduationCap className="h-5 w-5" />, title: 'Школы и курсы', desc: 'Репетиторы, образовательные проекты, мастер-классы.' },
    { icon: <UserRound className="h-5 w-5" />, title: 'Частные специалисты', desc: 'Самозанятые мастера, эксперты, консультанты.' },
    { icon: <Layers className="h-5 w-5" />, title: 'Команды и сети', desc: 'Бизнесы с филиалами, сотрудниками и расписаниями.' },
  ];

  return (
    <section id="segments" className="relative bg-[#fafbfc] py-24 lg:py-32">
      <Container>
        <SectionTitle
          eyebrow="Для кого"
          title="Подходит бизнесу любого масштаба"
          subtitle="От частного мастера до сети филиалов — платформа адаптируется под любой размер команды."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_28px_56px_-24px_rgba(15,23,42,0.18)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-[color:var(--cb-accent)]" style={{ ['--cb-accent' as any]: ACCENT }}>
                  {s.icon}
                </div>
                <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">{s.desc}</p>
                <ChevronRight className="absolute right-5 top-7 h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-slate-900" />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Features() {
  const items = [
    { icon: <Globe className="h-5 w-5" />, title: 'Онлайн-запись', desc: 'Клиент сам выбирает услугу, специалиста, дату и время — в пару кликов.' },
    { icon: <CalendarDays className="h-5 w-5" />, title: 'Календарь', desc: 'Удобный календарь по сотрудникам, услугам и филиалам.' },
    { icon: <Users className="h-5 w-5" />, title: 'Клиенты и история', desc: 'Карточки клиентов, контакты, заметки и история визитов.' },
    { icon: <Bell className="h-5 w-5" />, title: 'Уведомления', desc: 'Авто-напоминания клиентам и оповещения сотрудникам.' },
    { icon: <Building2 className="h-5 w-5" />, title: 'Команда и филиалы', desc: 'Управляйте сотрудниками, ролями и несколькими локациями.' },
    { icon: <BarChart3 className="h-5 w-5" />, title: 'Аналитика', desc: 'Записи, загрузка, выручка и повторные визиты в реальном времени.' },
    { icon: <Sparkles className="h-5 w-5" />, title: 'Услуги и цены', desc: 'Гибкое управление длительностью, стоимостью и категориями.' },
    { icon: <Workflow className="h-5 w-5" />, title: 'Интеграции', desc: 'Виджет на сайт, ссылка для соцсетей, Telegram и VK.' },
  ];

  return (
    <section id="features" className="py-24 lg:py-32">
      <Container>
        <SectionTitle
          eyebrow="Возможности"
          title="Всё, что нужно для записи и управления клиентами"
          subtitle="Один продукт вместо десяти таблиц, чатов и CRM. Запускается за 5 минут."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="group relative bg-white p-7 transition-colors hover:bg-slate-50/60"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white transition-all duration-300 group-hover:scale-105 group-hover:bg-[color:var(--cb-a)]" style={{ ['--cb-a' as any]: ACCENT }}>
                {it.icon}
              </div>
              <h3 className="mt-5 text-[15.5px] font-semibold tracking-tight text-slate-900">{it.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// Showcase split: live mockups
function ShowcaseSplit() {
  const blocks = [
    {
      eyebrow: 'Аналитика',
      title: 'Видите бизнес как на ладони',
      desc: 'Записи, доход, просмотры и конверсия в одном экране. Графики, средний чек и журнал бронирований.',
      mockup: <DashboardMockStats />,
      reverse: false,
    },
    {
      eyebrow: 'Расписание',
      title: 'Чёткий ритм рабочего дня',
      desc: 'Таймлайн дня, статусы, быстрые действия. Видно следующий визит, плотные блоки и свободные окна.',
      mockup: <DashboardMockToday />,
      reverse: true,
    },
  ];

  return (
    <section className="bg-[#fafbfc] py-24 lg:py-32">
      <Container>
        <div className="space-y-24 lg:space-y-32">
          {blocks.map((b, i) => (
            <div
              key={b.title}
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${b.reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}
            >
              <Reveal y={32}>
                <Eyebrow>{b.eyebrow}</Eyebrow>
                <h3 className="mt-4 text-[34px] font-semibold leading-[1.08] tracking-[-0.025em] text-slate-900 sm:text-[42px]">
                  {b.title}
                </h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">{b.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {[
                    'Авто-обновление в реальном времени',
                    'Метрики по сотрудникам и филиалам',
                    'Экспорт и интеграция с CRM',
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2.5 text-[13.5px] text-slate-700">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <PrimaryButton href="#cta">Попробовать</PrimaryButton>
                </div>
              </Reveal>

              <Reveal delay={0.15} y={36}>
                <div className="relative">
                  <div
                    className="absolute -inset-6 -z-10 rounded-[36px] opacity-60 blur-3xl"
                    style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(18,125,254,0.18), transparent 70%)' }}
                  />
                  <div className="rounded-[24px] border border-slate-200 bg-white/80 p-2 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
                    {b.mockup}
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Создайте страницу записи', desc: 'Зарегистрируйтесь и оформите свой профиль за 2 минуты.' },
    { n: '02', title: 'Добавьте услуги и команду', desc: 'Услуги, цены, длительность, сотрудники и расписание.' },
    { n: '03', title: 'Клиенты записываются онлайн', desc: 'Делитесь ссылкой или встраивайте виджет в сайт и соцсети.' },
    { n: '04', title: 'Управляйте всем в одном месте', desc: 'Расписание, напоминания, клиенты, аналитика и выручка.' },
  ];

  return (
    <section id="how" className="relative overflow-hidden py-24 lg:py-32">
      <Container>
        <SectionTitle eyebrow="Как это работает" title="Запуск за 5 минут — без обучения" />

        <div className="relative mt-14">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-slate-200 lg:block" />
          <div className="grid gap-4 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_48px_-16px_rgba(15,23,42,0.18)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[12px] font-semibold text-white">
                  {s.n}
                </div>
                <h3 className="mt-5 text-[16px] font-semibold tracking-tight text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-300 lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: <Zap className="h-5 w-5" />, title: 'Меньше ручной работы', desc: 'Автоматизация рутины — больше времени на клиентов.' },
    { icon: <TrendingUp className="h-5 w-5" />, title: 'Больше записей', desc: 'Запись 24/7 без звонков и переписок.' },
    { icon: <Bell className="h-5 w-5" />, title: 'Меньше пропусков', desc: 'Напоминания снижают количество no-show.' },
    { icon: <Sparkles className="h-5 w-5" />, title: 'Удобство для клиентов', desc: 'Запись в пару кликов с любого устройства.' },
    { icon: <Clock className="h-5 w-5" />, title: 'Контроль расписания', desc: 'Прозрачная загрузка по сотрудникам и филиалам.' },
    { icon: <ShieldCheck className="h-5 w-5" />, title: 'База в одном месте', desc: 'Вся клиентская база, история и контакты под рукой.' },
  ];

  return (
    <section className="bg-[#fafbfc] py-24 lg:py-32">
      <Container>
        <SectionTitle eyebrow="Преимущества" title="Что вы получите с КликБук" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_48px_-16px_rgba(15,23,42,0.18)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-transform group-hover:scale-105">
                    {it.icon}
                  </div>
                  <div>
                    <h3 className="text-[15.5px] font-semibold tracking-tight text-slate-900">{it.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">{it.desc}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Trust() {
  const stats = [
    { num: 'до 78%', label: 'меньше пропущенных записей' },
    { num: '2 500+', label: 'бизнесов используют КликБук' },
    { num: '5 минут', label: 'на запуск страницы записи' },
    { num: '24/7', label: 'клиенты записываются онлайн' },
  ];

  const reviews = [
    {
      quote:
        'Раньше расписание было в трёх таблицах и голове администратора. Теперь всё в одном месте — и клиенты записываются сами.',
      author: 'Анна Лебедева',
      role: 'Владелица студии маникюра',
    },
    {
      quote:
        'Количество no-show упало почти в три раза. Напоминания делают своё дело, а сотрудники видят расписание в телефоне.',
      author: 'Дмитрий Орлов',
      role: 'Барбершоп, 2 филиала',
    },
    {
      quote:
        'Запустили страницу записи за вечер. Через неделю поняли, что без аналитики уже не сможем — выручка стала прозрачной.',
      author: 'Марина Соколова',
      role: 'Косметолог, частная практика',
    },
  ];

  return (
    <section className="py-24 lg:py-32">
      <Container>
        <SectionTitle eyebrow="Доверие" title="Бизнесы уже растут вместе с КликБук" />

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="rounded-2xl border border-slate-200 bg-white p-7 text-center"
            >
              <div className="text-[40px] font-semibold leading-none tracking-tight text-slate-900 sm:text-[44px]">
                {stat.num}
              </div>
              <div className="mt-2 text-[12.5px] leading-snug text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {reviews.map((t, i) => (
            <Reveal key={t.author} delay={i * 0.07}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-7">
                <Quote className="h-6 w-6" style={{ color: ACCENT, opacity: 0.4 }} />
                <p className="mt-4 text-[14px] leading-relaxed text-slate-700">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-[13px] font-semibold text-white">
                    {t.author
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-slate-900">{t.author}</div>
                    <div className="text-[11.5px] text-slate-500">{t.role}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-24 lg:py-32">
      <Container>
        <Reveal y={32}>
          <div className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-slate-950 px-8 py-16 text-center sm:px-16 sm:py-20">
            {/* Animated grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Glow */}
            <motion.div
              className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${ACCENT}55, transparent 70%)` }}
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="pointer-events-none absolute -bottom-40 right-0 h-[320px] w-[420px] rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)' }}
            />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                Бесплатный старт
              </div>
              <h2 className="mx-auto mt-6 max-w-3xl text-[36px] font-semibold leading-[1.08] tracking-[-0.025em] text-white sm:text-[56px]">
                Запустите онлайн-запись для своего бизнеса{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)` }}
                >
                  уже сегодня
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/70">
                Создайте страницу записи за 5 минут — клиенты начнут записываться сами,
                а вы сэкономите часы рутины.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-[14px] font-semibold text-slate-900 shadow-[0_18px_44px_-12px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5"
                >
                  Начать с КликБук
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-[14px] font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
                >
                  Создать страницу записи
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-white/60">
                {['Без карты', 'Запуск за 5 минут', 'Поддержка 24/7'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/clickbook-logo-dark-transparent.png"
              alt="КликБук"
              width={120}
              height={28}
              className="h-7 w-auto"
            />
            <span className="text-[12px] text-slate-400">Онлайн-запись и управление клиентами</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] text-slate-500">
            <a href="#features" className="hover:text-slate-900">Возможности</a>
            <a href="#segments" className="hover:text-slate-900">Для кого</a>
            <a href="#how" className="hover:text-slate-900">Как работает</a>
            <Link href="/login" className="hover:text-slate-900">Войти</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-[12px] text-slate-400">
          © {new Date().getFullYear()} КликБук. Все права защищены.
        </div>
      </Container>
    </footer>
  );
}

// ───────────────────────── Page
export default function ClickbookLanding() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <Segments />
        <Features />
        <ShowcaseSplit />
        <HowItWorks />
        <Benefits />
        <Trust />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
