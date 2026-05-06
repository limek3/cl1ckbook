'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  useScroll,
  animate,
  AnimatePresence,
} from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowRight,
  ArrowLeft,
  Bell,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Layers,
  Globe,
  Scissors,
  Sparkles,
  Star,
  Users,
  Workflow,
  Stethoscope,
  Dumbbell,
  GraduationCap,
  UserRound,
  Quote,
  Minus,
  Plus,
} from 'lucide-react';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

const ACCENT = '#127dfe';

// ─── Copy ─────────────────────────────────────────────────────────────────────
const COPY = {
  ru: {
    nav: [
      ['#features', 'Возможности'],
      ['#who', 'Для кого'],
      ['#how', 'Как работает'],
      ['#proof', 'Отзывы'],
    ],
    login: 'Войти',
    ctaTop: 'Попробовать',
    prev: 'Назад',
    next: 'Далее',
    hero: {
      badge: 'Онлайн-запись нового поколения',
      title1: 'Запись клиентов',
      title2: 'без хаоса',
      title3: 'в мессенджерах',
      sub: 'КликБук объединяет расписание, клиентскую базу и аналитику в одном понятном кабинете.',
      cta1: 'Начать бесплатно',
      cta2: 'Смотреть демо',
      trust: ['Без карты', 'Бесплатный старт', '5 минут до запуска'],
      chips: [
        { label: 'Новая запись', sub: 'Дарья · Маникюр' },
        { label: '+38% записей', sub: 'за этот месяц' },
        { label: 'Напоминание', sub: 'Анна · 16:00' },
      ],
    },
    why: {
      eyebrow: 'Зачем',
      title: 'От хаоса — к спокойному рабочему дню',
      before: {
        tag: 'Раньше',
        items: [
          'Записи теряются в десяти чатах',
          'Двойные брони и пропущенные визиты',
          'Нет данных о клиентах и доходе',
          'Часы ручной рутины каждый день',
        ],
      },
      after: {
        tag: 'С КликБук',
        items: [
          'Всё расписание в одном экране',
          'Авто-напоминания убирают no-show',
          'База клиентов и история за секунду',
          'Аналитика и выручка в реальном времени',
        ],
      },
    },
    features: {
      eyebrow: 'Возможности',
      title: 'Всё нужное — в одном продукте',
      sub: 'Один продукт вместо десяти таблиц и чатов.',
      items: [
        { title: 'Онлайн-запись', desc: 'Клиент выбирает услугу и время — без звонков.' },
        { title: 'Расписание', desc: 'Удобный календарь по сотрудникам и локациям.' },
        { title: 'База клиентов', desc: 'Карточки, история и контакты каждого.' },
        { title: 'Напоминания', desc: 'Авто-уведомления убирают отмены.' },
        { title: 'Команда', desc: 'Роли, графики и несколько точек.' },
        { title: 'Аналитика', desc: 'Выручка и повторы в реальном времени.' },
        { title: 'Услуги', desc: 'Гибкое управление ценами и категориями.' },
        { title: 'Интеграции', desc: 'Виджет, Telegram и VK.' },
      ],
    },
    who: {
      eyebrow: 'Для кого',
      title: 'Для бизнеса любого масштаба',
      sub: 'От частного мастера до сети филиалов.',
      items: [
        { title: 'Красота', desc: 'Салоны, барбершопы, маникюр, косметология.' },
        { title: 'Здоровье', desc: 'Массажисты, wellness, частные приёмы.' },
        { title: 'Спорт', desc: 'Тренеры, студии, йога, фитнес.' },
        { title: 'Обучение', desc: 'Репетиторы, курсы, мастер-классы.' },
        { title: 'Специалисты', desc: 'Самозанятые эксперты и консультанты.' },
        { title: 'Сети', desc: 'Команды с филиалами и сложным расписанием.' },
      ],
    },
    how: {
      eyebrow: 'Как работает',
      title: 'Запуск за 5 минут — без обучения',
      steps: [
        { n: '01', title: 'Создайте страницу', desc: 'Зарегистрируйтесь и оформите профиль за 2 минуты.' },
        { n: '02', title: 'Добавьте услуги', desc: 'Услуги, цены, длительность и расписание.' },
        { n: '03', title: 'Клиенты записываются', desc: 'Делитесь ссылкой или встраивайте виджет.' },
        { n: '04', title: 'Управляйте всем', desc: 'Расписание, напоминания, аналитика, выручка.' },
      ],
    },
    proof: {
      eyebrow: 'Результаты',
      title: 'Бизнесы уже растут с КликБук',
      stats: [
        { val: 78, suffix: '%', pre: 'до', label: 'меньше пропущенных' },
        { val: 2500, suffix: '+', pre: '', label: 'активных бизнесов' },
        { val: 5, suffix: ' мин', pre: '', label: 'до запуска страницы' },
        { val: 24, suffix: '/7', pre: '', label: 'онлайн-запись' },
      ],
      reviews: [
        {
          text: 'Раньше расписание было в трёх таблицах и голове администратора. Теперь всё в одном месте — и клиенты записываются сами.',
          name: 'Анна Лебедева',
          role: 'Студия маникюра',
        },
        {
          text: 'Количество no-show упало почти в три раза. Напоминания делают своё дело, сотрудники видят расписание в телефоне.',
          name: 'Дмитрий Орлов',
          role: 'Барбершоп, 2 филиала',
        },
        {
          text: 'Запустили страницу записи за вечер. Через неделю поняли, что без аналитики уже не сможем.',
          name: 'Марина Соколова',
          role: 'Косметолог',
        },
      ],
    },
    cta: {
      badge: 'Бесплатный старт',
      title: 'Запустите онлайн-запись уже сегодня',
      sub: 'Создайте страницу записи за 5 минут — клиенты начнут записываться сами.',
      btn1: 'Начать с КликБук',
      btn2: 'Смотреть демо',
      trust: ['Без карты', '5 минут до запуска', 'Поддержка 24/7'],
    },
    footer: `© ${new Date().getFullYear()} КликБук. Все права защищены.`,
  },
  en: {
    nav: [
      ['#features', 'Features'],
      ['#who', 'For whom'],
      ['#how', 'How it works'],
      ['#proof', 'Reviews'],
    ],
    login: 'Sign in',
    ctaTop: 'Try free',
    prev: 'Prev',
    next: 'Next',
    hero: {
      badge: 'Next-generation booking platform',
      title1: 'Client booking',
      title2: 'without chaos',
      title3: 'in messengers',
      sub: 'ClickBook unifies schedule, client database, and analytics in one clear workspace.',
      cta1: 'Start for free',
      cta2: 'View demo',
      trust: ['No card required', 'Free start', '5 min to launch'],
      chips: [
        { label: 'New booking', sub: 'Daria · Nails' },
        { label: '+38% bookings', sub: 'this month' },
        { label: 'Reminder sent', sub: 'Anna · 16:00' },
      ],
    },
    why: {
      eyebrow: 'Why',
      title: 'From chaos to a calm workday',
      before: {
        tag: 'Before',
        items: [
          'Bookings lost in ten chats',
          'Double bookings and missed visits',
          'No client data or revenue insight',
          'Hours of manual work every day',
        ],
      },
      after: {
        tag: 'With ClickBook',
        items: [
          'Full schedule in one screen',
          'Auto-reminders eliminate no-shows',
          'Client base and history in seconds',
          'Real-time analytics and revenue',
        ],
      },
    },
    features: {
      eyebrow: 'Features',
      title: 'Everything you need — in one product',
      sub: 'One product instead of ten spreadsheets and chats.',
      items: [
        { title: 'Online booking', desc: 'Client picks a service and time — no calls.' },
        { title: 'Calendar', desc: 'Schedule view by staff and locations.' },
        { title: 'Client base', desc: 'Cards, history, and contacts for everyone.' },
        { title: 'Reminders', desc: 'Auto-notifications reduce cancellations.' },
        { title: 'Team', desc: 'Roles, schedules, multiple locations.' },
        { title: 'Analytics', desc: 'Revenue and repeats in real time.' },
        { title: 'Services', desc: 'Flexible price and category management.' },
        { title: 'Integrations', desc: 'Widget, Telegram, and VK.' },
      ],
    },
    who: {
      eyebrow: 'For whom',
      title: 'For businesses of any scale',
      sub: 'From solo specialist to a network of branches.',
      items: [
        { title: 'Beauty', desc: 'Salons, barbershops, nails, cosmetology.' },
        { title: 'Health', desc: 'Massage, wellness, private practice.' },
        { title: 'Fitness', desc: 'Trainers, studios, yoga, gyms.' },
        { title: 'Education', desc: 'Tutors, courses, workshops.' },
        { title: 'Specialists', desc: 'Freelancers, experts, consultants.' },
        { title: 'Networks', desc: 'Teams with branches and complex schedules.' },
      ],
    },
    how: {
      eyebrow: 'How it works',
      title: 'Launch in 5 minutes — no training',
      steps: [
        { n: '01', title: 'Create your page', desc: 'Sign up and set up your profile in 2 minutes.' },
        { n: '02', title: 'Add services', desc: 'Services, prices, duration, and schedule.' },
        { n: '03', title: 'Clients book', desc: 'Share a link or embed a widget.' },
        { n: '04', title: 'Manage everything', desc: 'Schedule, reminders, analytics, revenue.' },
      ],
    },
    proof: {
      eyebrow: 'Results',
      title: 'Businesses growing with ClickBook',
      stats: [
        { val: 78, suffix: '%', pre: 'up to', label: 'fewer missed bookings' },
        { val: 2500, suffix: '+', pre: '', label: 'active businesses' },
        { val: 5, suffix: ' min', pre: '', label: 'to launch a page' },
        { val: 24, suffix: '/7', pre: '', label: 'online booking' },
      ],
      reviews: [
        {
          text: "Before, the schedule was in three spreadsheets and the admin's head. Now everything is in one place and clients book themselves.",
          name: 'Anna Lebedeva',
          role: 'Nail studio',
        },
        {
          text: 'No-shows dropped by almost three times. Reminders do their job, staff see the schedule on their phones.',
          name: 'Dmitry Orlov',
          role: 'Barbershop, 2 locations',
        },
        {
          text: "We launched a booking page in an evening. A week later we realized we can't work without analytics.",
          name: 'Marina Sokolova',
          role: 'Cosmetologist',
        },
      ],
    },
    cta: {
      badge: 'Free start',
      title: 'Launch online booking today',
      sub: 'Create a booking page in 5 minutes — clients will book themselves.',
      btn1: 'Start with ClickBook',
      btn2: 'View demo',
      trust: ['No card required', '5 minutes to launch', 'Support 24/7'],
    },
    footer: `© ${new Date().getFullYear()} ClickBook. All rights reserved.`,
  },
} as const;

const FEATURE_ICONS = [Globe, CalendarDays, Users, Bell, Building2, BarChart3, Sparkles, Workflow];
const WHO_ICONS = [Scissors, Stethoscope, Dumbbell, GraduationCap, UserRound, Layers];

// ─── Scroll progress (top thin bar) ───────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[60] h-px origin-left bg-[#127dfe]"
    />
  );
}

// ─── Reveal helper (fade up on view) ──────────────────────────────────────────
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
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter({ target, suffix = '', pre = '' }: { target: number; suffix?: string; pre?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const ctrl = animate(0, target, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent =
          (pre ? pre + ' ' : '') +
          (target >= 1000 ? Math.round(v).toLocaleString('ru') : Math.round(v)) +
          suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, target, suffix, pre]);

  return (
    <span ref={ref}>
      {pre ? pre + ' ' : ''}0{suffix}
    </span>
  );
}

// ─── Magnetic button (minimal) ────────────────────────────────────────────────
function MagBtn({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  }, [x, y]);

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-[14px] font-semibold transition-colors duration-200',
        variant === 'primary'
          ? 'bg-black text-white hover:bg-[#127dfe] dark:bg-white dark:text-black dark:hover:bg-[#127dfe] dark:hover:text-white'
          : 'border border-black/15 bg-transparent text-black hover:border-black/35 dark:border-white/15 dark:text-white dark:hover:border-white/35',
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-y-0 -left-12 w-12 rotate-12 bg-white/15 transition-all duration-700 group-hover:left-[110%]" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.a>
  );
}

// ─── Section label ("01 — Возможности") ───────────────────────────────────────
function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
      <span className="tabular-nums text-black/30 dark:text-white/30">{n}</span>
      <span className="h-px w-8 bg-black/20 dark:bg-white/20" />
      <span>{children}</span>
    </div>
  );
}

// ─── Animated heading underline ───────────────────────────────────────────────
function HeadingAccent() {
  return (
    <motion.span
      initial={{ scaleX: 0, originX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mt-5 block h-px w-16 bg-[#127dfe]"
    />
  );
}

// ─── Slider shell (embla, minimal) ────────────────────────────────────────────
type SliderProps = {
  children: React.ReactNode;
  autoplay?: number;
  loop?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
};
function Slider({ children, autoplay, loop = true, prevLabel, nextLabel, className = '' }: SliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    align: 'start',
    skipSnaps: false,
    containScroll: 'trimSnaps',
    dragFree: false,
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    const onReInit = () => setSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onReInit);
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onReInit);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !autoplay || paused) return;
    const id = setInterval(() => {
      if (!emblaApi) return;
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, autoplay);
    return () => clearInterval(id);
  }, [emblaApi, autoplay, paused]);

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 touch-pan-y">{children}</div>
      </div>

      <div className="mt-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-1.5">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                selected === i ? 'w-10 bg-black dark:bg-white' : 'w-4 bg-black/15 hover:bg-black/30 dark:bg-white/15 dark:hover:bg-white/30',
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={prevLabel || 'Prev'}
            onClick={() => emblaApi?.scrollPrev()}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-black/70 transition-all hover:border-black/40 hover:bg-black hover:text-white dark:border-white/15 dark:text-white/70 dark:hover:border-white/40 dark:hover:bg-white dark:hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button
            type="button"
            aria-label={nextLabel || 'Next'}
            onClick={() => emblaApi?.scrollNext()}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-black/70 transition-all hover:border-black/40 hover:bg-black hover:text-white dark:border-white/15 dark:text-white/70 dark:hover:border-white/40 dark:hover:bg-white dark:hover:text-black"
          >
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Side nav dots ────────────────────────────────────────────────────────────
const SLIDE_IDS = ['hero', 'why', 'features', 'who', 'how', 'proof', 'cta'] as const;
const SLIDE_LABELS_RU = ['Старт', 'Зачем', 'Возможности', 'Для кого', 'Как', 'Отзывы', 'Запуск'];
const SLIDE_LABELS_EN = ['Start', 'Why', 'Features', 'For whom', 'How', 'Reviews', 'Launch'];

function SideNav({ locale }: { locale: string }) {
  const [active, setActive] = useState(0);
  const labels = locale === 'en' ? SLIDE_LABELS_EN : SLIDE_LABELS_RU;

  useEffect(() => {
    const els = SLIDE_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = SLIDE_IDS.indexOf(e.target.id as typeof SLIDE_IDS[number]);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { threshold: 0.5 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 lg:flex">
      <div className="flex flex-col items-end gap-2.5">
        {SLIDE_IDS.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            className="group flex items-center gap-3"
            title={labels[i]}
          >
            <span
              className={cn(
                'text-[10px] font-medium tracking-wide transition-all duration-300',
                active === i
                  ? 'text-black opacity-100 dark:text-white'
                  : 'text-black/40 opacity-0 group-hover:opacity-100 dark:text-white/40',
              )}
            >
              {labels[i]}
            </span>
            <span
              className={cn(
                'block h-px transition-all duration-300',
                active === i
                  ? 'w-8 bg-black dark:bg-white'
                  : 'w-4 bg-black/25 group-hover:w-6 group-hover:bg-black/50 dark:bg-white/25 dark:group-hover:bg-white/50',
              )}
            />
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function LandingHeader({ t }: { t: typeof COPY.ru }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const cb = () => setScrolled(window.scrollY > 12);
    cb();
    window.addEventListener('scroll', cb, { passive: true });
    return () => window.removeEventListener('scroll', cb);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-black/6 bg-white/85 backdrop-blur-xl dark:border-white/8 dark:bg-[#06080f]/85'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/landing" className="flex items-center">
          <Image
            src="/brand/clickbook-logo-dark-transparent.png"
            alt="КликБук"
            width={140}
            height={32}
            className="h-7 w-auto dark:hidden"
            priority
          />
          <Image
            src="/brand/clickbook-logo-light-transparent.png"
            alt="КликБук"
            width={140}
            height={32}
            className="hidden h-7 w-auto dark:block"
            priority
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {t.nav.map(([href, label]) => (
            <a
              key={href}
              href={href as string}
              className="group relative text-[13px] font-medium text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle compact minimal />
          <ThemeToggle compact minimal />
          <Link
            href="/login"
            className="hidden text-[13px] font-medium text-black/60 transition hover:text-black dark:text-white/60 dark:hover:text-white sm:inline"
          >
            {t.login}
          </Link>
          <motion.a
            href="#cta"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-black px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#127dfe] dark:bg-white dark:text-black dark:hover:bg-[#127dfe] dark:hover:text-white"
          >
            <span className="pointer-events-none absolute inset-y-0 -left-10 w-10 rotate-12 bg-white/20 transition-all duration-700 group-hover:left-[110%]" />
            <span className="relative z-10 flex items-center gap-1.5">
              {t.ctaTop}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}

// ─── Live mockup (minimal: no rainbow, single accent) ─────────────────────────
type ChipsTuple = ReadonlyArray<{ readonly label: string; readonly sub: string }>;

function DashboardMockup({ chips, inView }: { chips: ChipsTuple; inView: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 100, damping: 18 });
  const sry = useSpring(ry, { stiffness: 100, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-ny * 6);
    ry.set(nx * 6);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  const [notiIdx, setNotiIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNotiIdx((i) => (i + 1) % chips.length), 3400);
    return () => clearInterval(id);
  }, [chips.length]);

  const slots = [
    { name: chips[0].sub.split(' · ')[0] || 'Дарья', service: chips[0].sub.split(' · ')[1] || 'Маникюр', time: '12:30' },
    { name: chips[2].sub.split(' · ')[0] || 'Анна', service: 'Стрижка', time: chips[2].sub.split(' · ')[1] || '16:00' },
    { name: 'Михаил', service: 'Массаж', time: '18:00' },
  ];

  const chartPoints = [22, 38, 31, 52, 44, 70, 62, 88];
  const chartW = 240;
  const chartH = 56;
  const stepX = chartW / (chartPoints.length - 1);
  const maxY = Math.max(...chartPoints);
  const pathD = chartPoints
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${chartH - (v / maxY) * chartH * 0.92}`)
    .join(' ');
  const areaD = `${pathD} L ${chartW} ${chartH} L 0 ${chartH} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[460px] lg:max-w-none"
    >
      {/* Subtle ambient halo */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -inset-8 rounded-[40px] blur-[60px]"
        style={{ background: `radial-gradient(ellipse at center, ${ACCENT}22, transparent 70%)` }}
      />

      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 1100 }}
        className="relative overflow-hidden rounded-3xl border border-black/8 bg-white p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-[#0b0e1a]"
      >
        {/* Header bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-black/15 dark:bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-black/15 dark:bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-black/15 dark:bg-white/20" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-black/45 dark:text-white/45">
            <CalendarDays className="h-3 w-3" />
            clickbook
          </div>
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <Bell className="h-3.5 w-3.5 text-black/55 dark:text-white/55" />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#127dfe]" />
          </motion.div>
        </div>

        {/* Cycling notification */}
        <div className="relative mb-4 h-[58px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={notiIdx}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center gap-3 rounded-2xl border border-black/8 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#127dfe]/10 text-[#127dfe]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold text-black/85 dark:text-white/85">{chips[notiIdx].label}</div>
                <div className="truncate text-[11px] text-black/50 dark:text-white/45">{chips[notiIdx].sub}</div>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.2, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-px bg-[#127dfe]"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Booking slots */}
        <div className="mb-5 space-y-2">
          {slots.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
              className="group flex items-center gap-3 rounded-xl border border-black/6 bg-black/[0.012] px-3 py-2.5 transition-all hover:border-[#127dfe]/30 hover:bg-[#127dfe]/[0.04] dark:border-white/8 dark:bg-white/[0.02] dark:hover:bg-[#127dfe]/[0.08]"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-[12px] font-semibold text-black/70 dark:bg-white/[0.06] dark:text-white/70">
                {s.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold text-black/85 dark:text-white/85">{s.name}</div>
                <div className="truncate text-[10.5px] text-black/45 dark:text-white/40">{s.service}</div>
              </div>
              <div className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-black/70 dark:bg-white/[0.06] dark:text-white/70">{s.time}</div>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                className="h-1.5 w-1.5 rounded-full bg-[#127dfe]"
              />
            </motion.div>
          ))}
        </div>

        {/* Mini chart */}
        <div className="mb-4 rounded-2xl border border-black/6 p-3 dark:border-white/8">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-black/45 dark:text-white/40">Записи · 7 дней</div>
            <div className="text-[10.5px] font-bold tabular-nums text-[#127dfe]">+24%</div>
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-12 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={areaD}
              fill="url(#chartFill)"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 1.1 }}
            />
            <motion.path
              d={pathD}
              fill="none"
              stroke={ACCENT}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
            {chartPoints.map((v, i) => (
              <motion.circle
                key={i}
                cx={i * stepX}
                cy={chartH - (v / maxY) * chartH * 0.92}
                r={1.8}
                fill={ACCENT}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 1.5 + i * 0.04 }}
              />
            ))}
          </svg>
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="flex items-center justify-between rounded-2xl bg-black p-3 text-white dark:bg-white dark:text-black"
        >
          <div>
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] opacity-70">{chips[1].sub}</div>
            <div className="text-[22px] font-bold leading-none tracking-[-0.02em]">{chips[1].label}</div>
          </div>
          <BarChart3 className="h-6 w-6 opacity-90" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function MarqueeStrip({ items }: { items: string[] }) {
  const list = [...items, ...items, ...items];
  return (
    <div className="relative w-full overflow-hidden py-3" style={{ maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)' }}>
      <motion.div
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        className="flex w-max items-center gap-12 whitespace-nowrap text-[11.5px] font-medium uppercase tracking-[0.2em] text-black/40 dark:text-white/35"
      >
        {list.map((item, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="h-1 w-1 rounded-full bg-current" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yLeft = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Cursor parallax for accent
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const sx = useSpring(cx, { stiffness: 50, damping: 20 });
  const sy = useSpring(cy, { stiffness: 50, damping: 20 });
  const blobX = useTransform(sx, (v) => v * 26);
  const blobY = useTransform(sy, (v) => v * 26);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      cx.set((e.clientX - w / 2) / w);
      cy.set((e.clientY - h / 2) / h);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [cx, cy]);

  const words = [t.hero.title1, t.hero.title2, t.hero.title3];
  const marqueeItems = [...t.hero.trust, 'Telegram · VK · Web', '−78% no-show', '2 500+', '24/7', ...t.hero.trust];

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-screen flex-col overflow-hidden bg-white pt-16 dark:bg-[#06080f]"
    >
      {/* Subtle ambient blob (single, follows cursor) */}
      <motion.div
        style={{ x: blobX, y: blobY }}
        className="pointer-events-none absolute right-[-10%] top-[5%] h-[520px] w-[520px] rounded-full opacity-25 blur-[120px] dark:opacity-18"
      >
        <div className="h-full w-full" style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }} />
      </motion.div>

      {/* Soft dot grid (very subtle) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          color: 'currentColor',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 78%)',
        }}
      />

      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center px-4 pt-8 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8 lg:pt-0"
      >
        {/* LEFT */}
        <motion.div style={{ y: yLeft }} className="w-full text-center lg:w-[56%] lg:text-left">
          <Reveal>
            <SectionLabel n="00">{t.hero.badge}</SectionLabel>
          </Reveal>

          <h1 className="mt-7">
            {words.map((word, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  initial={{ y: 90 }}
                  animate={inView ? { y: 0 } : {}}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'block text-[44px] font-bold leading-[0.98] tracking-[-0.045em] text-black dark:text-white sm:text-[60px] lg:text-[78px]',
                    i === 1 && 'text-[#127dfe]',
                  )}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <Reveal delay={0.55}>
            <p className="mx-auto mt-7 max-w-xl text-[16px] leading-7 text-black/55 dark:text-white/50 sm:text-[17px] lg:mx-0">
              {t.hero.sub}
            </p>
          </Reveal>

          <Reveal delay={0.7}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <MagBtn href="/login" variant="primary">
                {t.hero.cta1}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </MagBtn>
              <MagBtn href="#features" variant="ghost">
                {t.hero.cta2}
              </MagBtn>
            </div>
          </Reveal>

          <Reveal delay={0.85}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-black/45 dark:text-white/40 lg:justify-start">
              {t.hero.trust.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#127dfe]" />
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        </motion.div>

        {/* RIGHT */}
        <motion.div style={{ y: yRight }} className="mt-14 w-full lg:mt-0 lg:w-[44%]">
          <DashboardMockup chips={t.hero.chips} inView={inView} />
        </motion.div>
      </motion.div>

      {/* Marquee strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 1.2 }}
        className="relative z-10 mt-12 border-y border-black/6 bg-white/40 backdrop-blur-sm dark:border-white/8 dark:bg-white/[0.02]"
      >
        <MarqueeStrip items={marqueeItems} />
      </motion.div>

      {/* Scroll hint */}
      <motion.a
        href="#why"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 1.6 }}
        className="relative z-10 mx-auto -mt-3 mb-6 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1.5 text-black/30 dark:text-white/25"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.a>
    </section>
  );
}

// ─── WHY (minimal split) ──────────────────────────────────────────────────────
function WhySlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yL = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yR = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section id="why" ref={ref} className="relative overflow-hidden border-t border-black/6 bg-white py-24 dark:border-white/8 dark:bg-[#06080f] lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <Reveal>
            <SectionLabel n="01">{t.why.eyebrow}</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[44px] lg:text-[52px]">
              {t.why.title}
            </h2>
          </Reveal>
          <HeadingAccent />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Before */}
          <motion.div
            style={{ y: yL }}
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-full rounded-3xl border border-black/8 bg-black/[0.02] p-8 transition-colors duration-500 hover:border-black/15 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 lg:p-10">
              <div className="mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
                <span className="h-px w-6 bg-black/30 dark:bg-white/30" />
                {t.why.before.tag}
              </div>
              <ul className="space-y-3">
                {t.why.before.items.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                    className="group flex items-start gap-3 text-[15px] leading-7 text-black/65 dark:text-white/55"
                  >
                    <Minus className="mt-1.5 h-3.5 w-3.5 flex-shrink-0 text-black/30 dark:text-white/30" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            style={{ y: yR }}
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-full overflow-hidden rounded-3xl border border-[#127dfe]/20 bg-[#127dfe]/[0.04] p-8 transition-colors duration-500 hover:border-[#127dfe]/40 dark:border-[#127dfe]/25 dark:bg-[#127dfe]/[0.06] lg:p-10">
              <div className="mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#127dfe]">
                <span className="h-px w-6 bg-[#127dfe]" />
                {t.why.after.tag}
              </div>
              <ul className="space-y-3">
                {t.why.after.items.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="group flex items-start gap-3 text-[15px] leading-7 text-black/80 dark:text-white/80"
                  >
                    <Plus className="mt-1.5 h-3.5 w-3.5 flex-shrink-0 text-[#127dfe]" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full blur-[80px]"
                style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES (slider, minimal cards) ─────────────────────────────────────────
function FeaturesSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);

  return (
    <section id="features" ref={ref} className="relative overflow-hidden border-t border-black/6 bg-[#fafafa] py-24 dark:border-white/8 dark:bg-[#08090f] lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <Reveal>
            <SectionLabel n="02">{t.features.eyebrow}</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[44px] lg:text-[52px]">
              {t.features.title}
            </h2>
          </Reveal>
          <HeadingAccent />
          <Reveal delay={0.3}>
            <p className="mt-5 text-[15px] leading-7 text-black/55 dark:text-white/45">{t.features.sub}</p>
          </Reveal>
        </div>

        <Slider autoplay={5500} prevLabel={t.prev} nextLabel={t.next}>
          {t.features.items.map((item, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={i} className="flex-[0_0_85%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]">
                <Reveal delay={i * 0.04}>
                  <FeatureCard Icon={Icon} title={item.title} desc={item.desc} index={i} />
                </Reveal>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}

function FeatureCard({ Icon, title, desc, index }: { Icon: typeof Globe; title: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="group relative h-full overflow-hidden rounded-3xl border border-black/8 bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(280px circle at var(--mx,50%) var(--my,50%), ${ACCENT}10, transparent 65%)` }}
      />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[0.04] text-black/70 transition-all duration-300 group-hover:bg-[#127dfe] group-hover:text-white dark:bg-white/[0.06] dark:text-white/70">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] tabular-nums text-black/30 dark:text-white/30">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="relative z-10 mt-7 text-[18px] font-semibold tracking-tight text-black dark:text-white">{title}</h3>
      <p className="relative z-10 mt-2 text-[13.5px] leading-relaxed text-black/55 dark:text-white/45">{desc}</p>
      <ArrowRight className="relative z-10 mt-6 h-4 w-4 text-black/25 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#127dfe] dark:text-white/25" />
    </div>
  );
}

// ─── WHO (slider, minimal) ────────────────────────────────────────────────────
function WhoSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <section id="who" ref={ref} className="relative overflow-hidden border-t border-black/6 bg-white py-24 dark:border-white/8 dark:bg-[#06080f] lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <Reveal>
            <SectionLabel n="03">{t.who.eyebrow}</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[44px] lg:text-[52px]">
              {t.who.title}
            </h2>
          </Reveal>
          <HeadingAccent />
          <Reveal delay={0.3}>
            <p className="mt-5 text-[15px] leading-7 text-black/55 dark:text-white/45">{t.who.sub}</p>
          </Reveal>
        </div>

        <Slider autoplay={6000} prevLabel={t.prev} nextLabel={t.next}>
          {t.who.items.map((item, i) => {
            const Icon = WHO_ICONS[i];
            return (
              <div key={i} className="flex-[0_0_85%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                <Reveal delay={i * 0.05}>
                  <WhoCard Icon={Icon} title={item.title} desc={item.desc} index={i} />
                </Reveal>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}

function WhoCard({ Icon, title, desc, index }: { Icon: typeof Scissors; title: string; desc: string; index: number }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-3xl border border-black/8 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.22)] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25">
      {/* Subtle accent corner */}
      <motion.div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${ACCENT}40, transparent 70%)` }}
      />
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/[0.04] text-black/70 transition-all duration-300 group-hover:bg-[#127dfe] group-hover:text-white dark:bg-white/[0.06] dark:text-white/70">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] tabular-nums text-black/30 dark:text-white/30">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="relative z-10 mt-7 text-[20px] font-bold tracking-tight text-black dark:text-white">{title}</h3>
      <p className="relative z-10 mt-2.5 text-[14px] leading-relaxed text-black/55 dark:text-white/45">{desc}</p>
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-[#127dfe]"
        initial={{ width: 0 }}
        whileInView={{ width: '40%' }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2 + index * 0.05 }}
      />
    </div>
  );
}

// ─── HOW (slider with progress + numbered timeline) ───────────────────────────
function HowSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const lineWidth = useTransform(scrollYProgress, [0.15, 0.55], ['0%', '100%']);

  return (
    <section id="how" ref={ref} className="relative overflow-hidden border-t border-black/6 bg-[#fafafa] py-24 dark:border-white/8 dark:bg-[#08090f] lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <Reveal>
            <SectionLabel n="04">{t.how.eyebrow}</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[44px] lg:text-[52px]">
              {t.how.title}
            </h2>
          </Reveal>
          <HeadingAccent />
        </div>

        {/* Scroll-driven progress timeline */}
        <div className="relative mb-12 hidden h-px overflow-hidden rounded-full bg-black/10 dark:bg-white/10 sm:block">
          <motion.div style={{ width: lineWidth }} className="h-full bg-[#127dfe]" />
        </div>

        <Slider autoplay={5500} prevLabel={t.prev} nextLabel={t.next}>
          {t.how.steps.map((step, i) => (
            <div key={i} className="flex-[0_0_88%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]">
              <Reveal delay={i * 0.06}>
                <StepCard n={step.n} title={step.title} desc={step.desc} />
              </Reveal>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-3xl border border-black/8 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:border-black/20 hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25">
      <div className="flex items-start justify-between">
        <div className="text-[40px] font-bold leading-none tracking-[-0.04em] text-black/12 transition-colors duration-300 group-hover:text-[#127dfe] dark:text-white/12">
          {n}
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="h-2 w-2 rounded-full bg-[#127dfe]"
        />
      </div>
      <h3 className="mt-8 text-[18px] font-semibold tracking-tight text-black dark:text-white">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-black/55 dark:text-white/45">{desc}</p>
      <div className="mt-6 flex items-center gap-2 text-[12px] font-medium text-black/40 transition-colors duration-300 group-hover:text-[#127dfe] dark:text-white/40">
        <span className="h-px w-6 bg-current transition-all duration-300 group-hover:w-10" />
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

// ─── PROOF (stats + reviews slider) ───────────────────────────────────────────
function ProofSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="proof" ref={ref} className="relative overflow-hidden border-t border-black/6 bg-white py-24 dark:border-white/8 dark:bg-[#06080f] lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <Reveal>
            <SectionLabel n="05">{t.proof.eyebrow}</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[44px] lg:text-[52px]">
              {t.proof.title}
            </h2>
          </Reveal>
          <HeadingAccent />
        </div>

        {/* Stats grid */}
        <div className="mb-20 grid divide-y divide-black/8 border-y border-black/8 dark:divide-white/10 dark:border-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {t.proof.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative px-6 py-10 transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.025]"
            >
              {stat.pre && (
                <div className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.16em] text-black/40 dark:text-white/35">
                  {stat.pre}
                </div>
              )}
              <div className="text-[44px] font-bold leading-none tracking-[-0.045em] text-black tabular-nums dark:text-white sm:text-[52px]">
                {inView && <Counter target={stat.val} suffix={stat.suffix} pre="" />}
              </div>
              <div className="mt-3 text-[12.5px] leading-snug text-black/50 dark:text-white/40">{stat.label}</div>
              <motion.div
                className="absolute bottom-0 left-0 h-px bg-[#127dfe]"
                initial={{ width: 0 }}
                whileInView={{ width: '40%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Reviews slider */}
        <Slider autoplay={7000} prevLabel={t.prev} nextLabel={t.next}>
          {t.proof.reviews.map((review, i) => (
            <div key={i} className="flex-[0_0_88%] pl-4 sm:flex-[0_0_60%] lg:flex-[0_0_45%]">
              <Reveal delay={i * 0.07}>
                <ReviewCard text={review.text} name={review.name} role={review.role} />
              </Reveal>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

function ReviewCard({ text, name, role }: { text: string; name: string; role: string }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-3xl border border-black/8 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_28px_70px_-30px_rgba(0,0,0,0.22)] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/25 lg:p-10">
      <Quote className="h-6 w-6 text-black/15 transition-colors duration-300 group-hover:text-[#127dfe] dark:text-white/15" />
      <p className="mt-6 text-[16px] leading-7 text-black/75 dark:text-white/65 lg:text-[17px]">{text}</p>
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-[14px] font-semibold text-black/75 dark:border-white/12 dark:bg-white/[0.04] dark:text-white/75">
            {name.slice(0, 1)}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-black dark:text-white">{name}</div>
            <div className="text-[12px] text-black/45 dark:text-white/40">{role}</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, si) => (
            <motion.span
              key={si}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + si * 0.05, type: 'spring', stiffness: 280 }}
            >
              <Star className="h-3.5 w-3.5 fill-[#127dfe] text-[#127dfe]" />
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CTA (minimal, single accent, big space) ──────────────────────────────────
function CtaSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const glowY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const glowOp = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.8, 0.5]);

  return (
    <section id="cta" ref={ref} className="relative overflow-hidden bg-[#06080f] py-32 lg:py-40">
      {/* Single subtle accent glow */}
      <motion.div
        style={{ y: glowY, opacity: glowOp }}
        className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center"
      >
        <div className="h-[420px] w-[700px] rounded-full blur-[120px]" style={{ background: `radial-gradient(ellipse at center, ${ACCENT}88, transparent 70%)` }} />
      </motion.div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <div className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            <span className="tabular-nums text-white/30">06</span>
            <span className="h-px w-8 bg-white/20" />
            <span>{t.cta.badge}</span>
          </div>
        </Reveal>

        <h2 className="mx-auto mt-7 max-w-3xl">
          {t.cta.title.split(' ').map((word, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span
                initial={{ y: 100 }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.85, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="mr-[0.18em] inline-block text-[44px] font-bold leading-[0.98] tracking-[-0.04em] text-white sm:text-[60px] lg:text-[78px]"
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h2>

        <Reveal delay={0.5}>
          <p className="mx-auto mt-7 max-w-lg text-[16px] leading-7 text-white/55">{t.cta.sub}</p>
        </Reveal>

        <Reveal delay={0.65}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.a
              href="/login"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-white px-8 py-4 text-[15px] font-bold text-black transition-shadow duration-300 hover:shadow-[0_20px_50px_-12px_rgba(255,255,255,0.4)]"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-10 w-10 rotate-12 bg-black/8 transition-all duration-700 group-hover:left-[110%]" />
              <span className="relative z-10 flex items-center gap-2.5">
                {t.cta.btn1}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </motion.a>

            <motion.a
              href="/demo/klikbuk-demo"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:border-white/40"
            >
              {t.cta.btn2}
            </motion.a>
          </div>
        </Reveal>

        <Reveal delay={0.85}>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-white/45">
            {t.cta.trust.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#127dfe]" />
                {item}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-24 border-t border-white/8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
          <Image
            src="/brand/clickbook-logo-light-transparent.png"
            alt="КликБук"
            width={120}
            height={28}
            className="h-6 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="text-[11.5px] text-white/30">{t.footer}</div>
        </div>
      </div>
    </section>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function ClickbookLanding() {
  const { locale } = useLocale();
  const t = locale === 'en' ? COPY.en : COPY.ru;

  return (
    <div className="min-h-screen bg-white antialiased dark:bg-[#06080f]">
      <ScrollProgress />
      <LandingHeader t={t} />
      <SideNav locale={locale} />

      <main>
        <HeroSlide t={t} />
        <WhySlide t={t} />
        <FeaturesSlide t={t} />
        <WhoSlide t={t} />
        <HowSlide t={t} />
        <ProofSlide t={t} />
        <CtaSlide t={t} />
      </main>
    </div>
  );
}
