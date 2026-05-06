'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
} from 'lucide-react';

// ── Brand
const BRAND = '#127dfe';
const BRAND_DARK = '#0f6fe1';

// ── UI primitives
function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-6 lg:px-10 ${className}`}>{children}</div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-[#127dfe]/20 bg-[#127dfe]/5 px-3.5 py-1.5 text-[12px] font-medium text-[#0f6fe1] backdrop-blur"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#127dfe]" />
      {children}
    </span>
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
      className={`group relative inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_44px_-12px_rgba(18,125,254,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_56px_-12px_rgba(18,125,254,0.7)] active:translate-y-0 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
      }}
    >
      <span className="absolute inset-0 rounded-2xl bg-white/0 transition-colors group-hover:bg-white/5" />
      <span className="relative">{children}</span>
      <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function SecondaryButton({
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
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-6 py-3.5 text-[15px] font-semibold text-slate-800 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white ${className}`}
    >
      {children}
    </Link>
  );
}

// ── Header
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
        <Link href="/landing" className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-[0_8px_22px_-6px_rgba(18,125,254,0.55)]"
            style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
          >
            <CalendarDays className="h-5 w-5" />
          </div>
          <span className="text-[18px] font-semibold tracking-tight text-slate-900">КликБук</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            ['Возможности', '#features'],
            ['Для кого', '#segments'],
            ['Как работает', '#how'],
            ['Тарифы', '#pricing'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-900">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline"
          >
            Войти
          </Link>
          <PrimaryButton href="#cta" className="!px-5 !py-2.5 !text-[14px]">
            Попробовать
          </PrimaryButton>
        </div>
      </Container>
    </header>
  );
}

// ── Hero
function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(18,125,254,0.28), rgba(18,125,254,0) 70%)',
          }}
        />
        <div className="absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-[380px] w-[380px] rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      {/* grid texture */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
        }}
      />

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Pill>Новое поколение онлайн-записи</Pill>
          <h1 className="mt-6 text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-900 sm:text-[60px] lg:text-[72px]">
            Онлайн-запись и управление клиентами для{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
            >
              современного бизнеса
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-slate-600 sm:text-[19px]">
            КликБук помогает клиентам записываться в пару кликов, а бизнесу — управлять расписанием,
            сотрудниками, заявками и клиентской базой без хаоса.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryButton href="#cta">Попробовать КликБук</PrimaryButton>
            <SecondaryButton href="#features">Посмотреть возможности</SecondaryButton>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Бесплатный старт
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Без карты
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Запуск за 5 минут
            </span>
          </div>
        </div>

        {/* Mockup */}
        <HeroMockup />
      </Container>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-6xl">
      <div
        className="absolute -inset-x-10 -inset-y-10 -z-10 rounded-[40px] opacity-60 blur-2xl"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 40%, rgba(18,125,254,0.25), rgba(18,125,254,0) 70%)',
        }}
      />
      <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-3 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)] backdrop-blur-xl">
        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <DashboardMockup />
        </div>
      </div>
      {/* floating cards */}
      <FloatingCard
        className="left-[-6%] top-[18%] hidden lg:block"
        icon={<Bell className="h-5 w-5" />}
        title="Напоминание отправлено"
        subtitle="Анна Соколова · через 2 часа"
        accent="bg-amber-50 text-amber-600"
      />
      <FloatingCard
        className="right-[-4%] bottom-[20%] hidden lg:block"
        icon={<TrendingUp className="h-5 w-5" />}
        title="+38% записей за месяц"
        subtitle="Рост повторных визитов"
        accent="bg-emerald-50 text-emerald-600"
      />
    </div>
  );
}

function FloatingCard({
  className = '',
  icon,
  title,
  subtitle,
  accent,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <div
      className={`absolute z-10 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_18px_44px_-12px_rgba(15,23,42,0.18)] backdrop-blur ${className}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>{icon}</div>
      <div>
        <div className="text-[13px] font-semibold text-slate-900">{title}</div>
        <div className="text-[12px] text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}

// ── Dashboard mockup
function DashboardMockup() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const slots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  const bookings: { day: number; slot: number; span: number; name: string; service: string; color: string }[] = [
    { day: 0, slot: 1, span: 1, name: 'Анна С.', service: 'Стрижка', color: 'bg-[#127dfe]/10 text-[#0f6fe1] border-[#127dfe]/30' },
    { day: 1, slot: 2, span: 2, name: 'Михаил К.', service: 'Окрашивание', color: 'bg-violet-50 text-violet-700 border-violet-200' },
    { day: 2, slot: 0, span: 1, name: 'Ольга В.', service: 'Маникюр', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { day: 3, slot: 3, span: 1, name: 'Игорь Н.', service: 'Барбер', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { day: 4, slot: 4, span: 1, name: 'Елена Р.', service: 'Уход', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { day: 5, slot: 1, span: 2, name: 'Артём Б.', service: 'Косметология', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  ];

  return (
    <div className="grid grid-cols-12 gap-0">
      {/* sidebar */}
      <aside className="col-span-3 hidden border-r border-slate-200/70 bg-white p-5 lg:block">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
          >
            <CalendarDays className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold text-slate-900">КликБук</span>
        </div>
        <div className="mt-7 space-y-1">
          {[
            { icon: <CalendarDays className="h-4 w-4" />, label: 'Расписание', active: true },
            { icon: <Users className="h-4 w-4" />, label: 'Клиенты' },
            { icon: <Sparkles className="h-4 w-4" />, label: 'Услуги' },
            { icon: <Building2 className="h-4 w-4" />, label: 'Сотрудники' },
            { icon: <BarChart3 className="h-4 w-4" />, label: 'Аналитика' },
            { icon: <Settings className="h-4 w-4" />, label: 'Настройки' },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                item.active
                  ? 'bg-[#127dfe]/8 text-[#0f6fe1]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              style={item.active ? { backgroundColor: 'rgba(18,125,254,0.08)' } : {}}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Загрузка недели
          </div>
          <div className="mt-2 text-[24px] font-semibold text-slate-900">82%</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[82%] rounded-full" style={{ background: BRAND }} />
          </div>
        </div>
      </aside>

      {/* main */}
      <main className="col-span-12 p-5 lg:col-span-9 lg:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium text-slate-500">Май 2026</div>
            <div className="mt-0.5 text-[20px] font-semibold tracking-tight text-slate-900">
              Расписание этой недели
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-[12px] font-medium">
              <button className="rounded-md px-3 py-1.5 text-slate-500">День</button>
              <button
                className="rounded-md px-3 py-1.5 text-white shadow"
                style={{ background: BRAND }}
              >
                Неделя
              </button>
              <button className="rounded-md px-3 py-1.5 text-slate-500">Месяц</button>
            </div>
          </div>
        </div>

        {/* stats cards */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Записи" value="124" delta="+18%" icon={<CalendarDays className="h-4 w-4" />} />
          <StatCard label="Клиенты" value="86" delta="+12%" icon={<Users className="h-4 w-4" />} />
          <StatCard label="Выручка" value="₽284K" delta="+24%" icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Загрузка" value="82%" delta="+6%" icon={<BarChart3 className="h-4 w-4" />} />
        </div>

        {/* calendar */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/60">
            <div className="px-3 py-2.5 text-[11px] font-medium text-slate-500">Время</div>
            {days.map((d, i) => (
              <div key={d} className="px-3 py-2.5 text-[11px] font-medium text-slate-500">
                {d} <span className="ml-1 text-slate-400">{12 + i}</span>
              </div>
            ))}
          </div>
          {slots.map((time, sIdx) => (
            <div key={time} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0">
              <div className="px-3 py-3 text-[11px] text-slate-400">{time}</div>
              {days.map((_, dIdx) => {
                const b = bookings.find((x) => x.day === dIdx && x.slot === sIdx);
                if (!b) return <div key={dIdx} className="border-l border-slate-100" />;
                return (
                  <div key={dIdx} className="border-l border-slate-100 p-1.5">
                    <div className={`rounded-lg border px-2 py-1.5 ${b.color}`}>
                      <div className="text-[11px] font-semibold">{b.name}</div>
                      <div className="text-[10px] opacity-80">{b.service}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, delta, icon }: { label: string; value: string; delta: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          {icon}
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-[22px] font-semibold tracking-tight text-slate-900">{value}</div>
        <div className="text-[11px] font-medium text-emerald-600">{delta}</div>
      </div>
    </div>
  );
}

// ── Problem / Solution
function ProblemSolution() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="rounded-[28px] border border-rose-100 bg-gradient-to-br from-rose-50/60 to-orange-50/40 p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-rose-600 shadow-sm">
              Проблема
            </div>
            <h3 className="mt-5 text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
              Записи теряются. Расписание — в голове и таблицах.
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              Записи теряются в мессенджерах, клиенты забывают о визитах, расписание ведётся вручную,
              а администратор тратит часы на рутину.
            </p>
            <div className="mt-7 space-y-3">
              {[
                'Звонки и переписки в десяти каналах',
                'Двойные записи и пропущенные визиты',
                'Нет данных о клиентах и истории',
                'Часы ручной работы каждый день',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-[14px] text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-[28px] border border-[#127dfe]/15 p-10"
            style={{
              background:
                'linear-gradient(135deg, rgba(18,125,254,0.06) 0%, rgba(18,125,254,0.02) 60%, rgba(255,255,255,0.6) 100%)',
            }}
          >
            <div
              className="absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-40 blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(18,125,254,0.4), transparent 70%)' }}
            />
            <div className="relative">
              <div
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium shadow-sm"
                style={{ color: BRAND_DARK }}
              >
                Решение
              </div>
              <h3 className="mt-5 text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
                КликБук собирает всё в одной системе.
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                Все записи, клиенты, услуги, сотрудники и расписание — в одном понятном продукте.
                Без таблиц, без хаоса, без потерь.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                {[
                  { icon: <CalendarDays className="h-4 w-4" />, label: 'Единое расписание' },
                  { icon: <Users className="h-4 w-4" />, label: 'База клиентов' },
                  { icon: <Bell className="h-4 w-4" />, label: 'Авто-напоминания' },
                  { icon: <BarChart3 className="h-4 w-4" />, label: 'Аналитика' },
                ].map((it) => (
                  <div
                    key={it.label}
                    className="flex items-center gap-2.5 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5 text-[13px] font-medium text-slate-800 shadow-sm backdrop-blur"
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                      style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
                    >
                      {it.icon}
                    </div>
                    {it.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── Segments
function Segments() {
  const segments = [
    {
      icon: <Scissors className="h-5 w-5" />,
      title: 'Салоны и барбершопы',
      desc: 'Маникюр, косметология, парикмахерские, студии красоты.',
      tone: 'from-rose-50 to-pink-50 text-rose-600',
    },
    {
      icon: <Stethoscope className="h-5 w-5" />,
      title: 'Клиники и врачи',
      desc: 'Массажисты, wellness- и health-специалисты, частные приёмы.',
      tone: 'from-emerald-50 to-teal-50 text-emerald-600',
    },
    {
      icon: <Dumbbell className="h-5 w-5" />,
      title: 'Спорт и фитнес',
      desc: 'Тренеры, спорт-студии, йога-центры, фитнес-клубы.',
      tone: 'from-orange-50 to-amber-50 text-orange-600',
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: 'Школы и курсы',
      desc: 'Репетиторы, образовательные проекты, мастер-классы.',
      tone: 'from-violet-50 to-purple-50 text-violet-600',
    },
    {
      icon: <UserRound className="h-5 w-5" />,
      title: 'Частные специалисты',
      desc: 'Самозанятые мастера, эксперты, консультанты.',
      tone: 'from-cyan-50 to-sky-50 text-cyan-600',
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: 'Команды и сети',
      desc: 'Бизнесы с филиалами, сотрудниками и расписаниями.',
      tone: 'from-blue-50 to-indigo-50 text-blue-600',
    },
  ];

  return (
    <section id="segments" className="bg-slate-50/60 py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow="Для кого"
          title="КликБук подходит для бизнеса, где важно записывать клиентов"
          subtitle="От частного мастера до сети филиалов — платформа адаптируется под любой масштаб."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((s) => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_48px_-16px_rgba(15,23,42,0.18)]"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.tone}`}>
                {s.icon}
              </div>
              <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">{s.desc}</p>
              <div
                className="absolute right-5 top-5 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: BRAND }}
              >
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-[12px] font-semibold uppercase tracking-[0.18em]" style={{ color: BRAND }}>
        {eyebrow}
      </div>
      <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-[-0.025em] text-slate-900 sm:text-[44px]">
        {title}
      </h2>
      {subtitle && <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-slate-600">{subtitle}</p>}
    </div>
  );
}

// ── Features
function Features() {
  const items = [
    { icon: <Globe className="h-5 w-5" />, title: 'Онлайн-запись', desc: 'Клиент сам выбирает услугу, специалиста, дату и время — в пару кликов.' },
    { icon: <CalendarDays className="h-5 w-5" />, title: 'Календарь и расписание', desc: 'Удобный календарь по сотрудникам, услугам и филиалам.' },
    { icon: <Users className="h-5 w-5" />, title: 'Карточки клиентов', desc: 'История посещений, контакты и заметки по каждому клиенту.' },
    { icon: <Bell className="h-5 w-5" />, title: 'Уведомления', desc: 'Авто-напоминания клиентам и оповещения сотрудникам.' },
    { icon: <Building2 className="h-5 w-5" />, title: 'Сотрудники и филиалы', desc: 'Управляйте командой, ролями и несколькими локациями.' },
    { icon: <BarChart3 className="h-5 w-5" />, title: 'Аналитика', desc: 'Записи, загрузка, выручка и повторные визиты в реальном времени.' },
    { icon: <Sparkles className="h-5 w-5" />, title: 'Услуги и цены', desc: 'Гибкое управление длительностью, стоимостью и категориями услуг.' },
    { icon: <MessageSquare className="h-5 w-5" />, title: 'Интеграции', desc: 'Встройте запись на сайт, в соцсети или отправьте ссылкой.' },
  ];

  return (
    <section id="features" className="py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow="Возможности"
          title="Всё, что нужно для записи и управления клиентами"
          subtitle="Один продукт вместо десяти таблиц, чатов и CRM. Запускается за 5 минут."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="bg-white p-7 transition-colors hover:bg-slate-50/60">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[0_10px_28px_-10px_rgba(18,125,254,0.55)]"
                style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
              >
                {it.icon}
              </div>
              <h3 className="mt-5 text-[16px] font-semibold tracking-tight text-slate-900">{it.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">{it.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── How it works
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Создайте страницу записи', desc: 'Зарегистрируйтесь и оформите свой профиль за 2 минуты.' },
    { n: '02', title: 'Добавьте услуги и команду', desc: 'Услуги, цены, длительность, сотрудники и расписание.' },
    { n: '03', title: 'Клиенты записываются онлайн', desc: 'Делитесь ссылкой или встраивайте виджет в сайт и соцсети.' },
    { n: '04', title: 'Управляйте всем в одном месте', desc: 'Расписание, напоминания, клиенты, аналитика и выручка.' },
  ];

  return (
    <section id="how" className="relative overflow-hidden bg-slate-50/60 py-24 lg:py-32">
      <Container>
        <SectionHeader eyebrow="Как это работает" title="Запуск за 5 минут — без обучения" />
        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_48px_-16px_rgba(15,23,42,0.18)]"
            >
              <div
                className="text-[40px] font-semibold leading-none tracking-tight"
                style={{
                  background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {s.n}
              </div>
              <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight
                  className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── Benefits
function Benefits() {
  const items = [
    { icon: <Zap className="h-5 w-5" />, title: 'Меньше ручной работы', desc: 'Автоматизация рутины — больше времени на клиентов.' },
    { icon: <TrendingUp className="h-5 w-5" />, title: 'Больше записей', desc: 'Запись 24/7 без звонков и переписок.' },
    { icon: <Bell className="h-5 w-5" />, title: 'Меньше пропусков', desc: 'Напоминания снижают количество no-show.' },
    { icon: <Sparkles className="h-5 w-5" />, title: 'Удобство для клиентов', desc: 'Запись в пару кликов — с любого устройства.' },
    { icon: <Clock className="h-5 w-5" />, title: 'Контроль расписания', desc: 'Прозрачная загрузка по сотрудникам и филиалам.' },
    { icon: <Shield className="h-5 w-5" />, title: 'База в одном месте', desc: 'Вся клиентская база, история и контакты под рукой.' },
  ];

  return (
    <section className="py-24 lg:py-32">
      <Container>
        <SectionHeader eyebrow="Преимущества" title="Что вы получите с КликБук" />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="group rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-[#127dfe]/40">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[#0f6fe1]"
                  style={{ background: 'rgba(18,125,254,0.08)' }}
                >
                  {it.icon}
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">{it.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-600">{it.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── Trust / numbers / testimonials
function Trust() {
  return (
    <section className="bg-slate-50/60 py-24 lg:py-32">
      <Container>
        <SectionHeader eyebrow="Доверие" title="Бизнесы уже растут вместе с КликБук" />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { num: 'до 78%', label: 'меньше пропущенных записей' },
            { num: '2 500+', label: 'бизнесов используют КликБук' },
            { num: '5 минут', label: 'на запуск страницы записи' },
            { num: '24/7', label: 'клиенты записываются онлайн' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-7 text-center">
              <div
                className="text-[40px] font-semibold leading-none tracking-tight sm:text-[44px]"
                style={{
                  background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.num}
              </div>
              <div className="mt-2 text-[13px] leading-snug text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
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
          ].map((t) => (
            <div key={t.author} className="rounded-2xl border border-slate-200 bg-white p-7">
              <Quote className="h-6 w-6 text-[#127dfe]/30" />
              <p className="mt-4 text-[14.5px] leading-relaxed text-slate-700">{t.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
                >
                  {t.author
                    .split(' ')
                    .map((p) => p[0])
                    .join('')}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">{t.author}</div>
                  <div className="text-[12px] text-slate-500">{t.role}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── Final CTA
function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-24 lg:py-32">
      <Container>
        <div
          className="relative overflow-hidden rounded-[36px] px-8 py-16 text-center sm:px-16 sm:py-20"
          style={{
            background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
          }}
        >
          {/* decorative */}
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div
              className="absolute -left-20 -top-20 h-80 w-80 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)' }}
            />
            <div
              className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)' }}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative">
            <Pill>
              <span className="text-white/90">Бесплатный старт</span>
            </Pill>
            <h2 className="mx-auto mt-6 max-w-3xl text-[36px] font-semibold leading-[1.1] tracking-[-0.025em] text-white sm:text-[52px]">
              Запустите онлайн-запись для своего бизнеса уже сегодня
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/85">
              Создайте страницу записи за 5 минут — клиенты начнут записываться сами, а вы сэкономите часы рутины.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-[15px] font-semibold text-slate-900 shadow-[0_18px_44px_-12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5"
              >
                Начать с КликБук
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition-all hover:bg-white/15"
              >
                Создать страницу записи
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── Footer
function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
            >
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-slate-900">КликБук</div>
              <div className="text-[12px] text-slate-500">Онлайн-запись и управление клиентами</div>
            </div>
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

// ── Page
export default function ClickbookLanding() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <Segments />
        <Features />
        <HowItWorks />
        <Benefits />
        <Trust />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
