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
  TrendingDown,
  Users,
  Workflow,
  Stethoscope,
  Dumbbell,
  GraduationCap,
  UserRound,
  Quote,
} from 'lucide-react';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

const ACCENT = '#127dfe';
const ACCENT_ALT = '#7c3aed';
const ACCENT_CYAN = '#0ea5e9';

const PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: ((i * 41 + 11) % 92) + 4,
  y: ((i * 29 + 7) % 88) + 6,
  r: 1.2 + (i % 4) * 0.8,
  dur: 8 + (i % 5) * 2,
  delay: (i * 0.7) % 7,
  op: 0.12 + (i % 6) * 0.05,
}));

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
    sliderHint: 'свайп',
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
    sliderHint: 'swipe',
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
const CARD_COLORS = [
  '#127dfe', '#7c3aed', '#0ea5e9', '#10b981',
  '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
];

// ─── Scroll progress (top bar) ────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#127dfe] via-[#7c3aed] to-[#0ea5e9] shadow-[0_0_18px_rgba(18,125,254,0.55)]"
    />
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '', pre = '' }: { target: number; suffix?: string; pre?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const ctrl = animate(0, target, {
      duration: 2.4,
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

// ─── Magnetic button ──────────────────────────────────────────────────────────
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
    x.set((e.clientX - (r.left + r.width / 2)) * 0.32);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.32);
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
      whileTap={{ scale: 0.96 }}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-7 py-4 text-[14px] font-semibold transition-all duration-200',
        variant === 'primary'
          ? 'bg-gradient-to-br from-[#127dfe] to-[#7c3aed] text-white shadow-[0_18px_50px_-12px_rgba(18,125,254,0.65)] hover:shadow-[0_28px_60px_-12px_rgba(124,58,237,0.7)]'
          : 'border border-current/20 bg-white/8 text-current backdrop-blur hover:bg-white/14',
        className,
      )}
    >
      {variant === 'primary' && (
        <span className="pointer-events-none absolute inset-y-0 -left-12 w-12 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-all duration-700 group-hover:left-[110%]" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.a>
  );
}

// ─── 3D tilt card ─────────────────────────────────────────────────────────────
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sry = useSpring(ry, { stiffness: 140, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-ny * 9);
    ry.set(nx * 9);
    ref.current.style.setProperty('--mx', `${(nx + 0.5) * 100}%`);
    ref.current.style.setProperty('--my', `${(ny + 0.5) * 100}%`);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Eyebrow pill ─────────────────────────────────────────────────────────────
function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]',
        light
          ? 'border border-white/20 bg-white/10 text-white/80 backdrop-blur'
          : 'border border-[#127dfe]/20 bg-[#127dfe]/8 text-[#127dfe] backdrop-blur dark:border-[#127dfe]/30 dark:bg-[#127dfe]/12',
      )}
    >
      <motion.span
        className="h-1.5 w-1.5 rounded-full bg-current"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {children}
    </motion.div>
  );
}

// ─── Slider shell (embla) ─────────────────────────────────────────────────────
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

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label={prevLabel || 'Prev'}
          onClick={() => emblaApi?.scrollPrev()}
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/60 backdrop-blur transition-all hover:scale-110 hover:border-[#127dfe]/40 hover:bg-[#127dfe] hover:text-white hover:shadow-[0_12px_28px_-10px_rgba(18,125,254,0.55)] dark:border-white/12 dark:bg-white/8 dark:text-white/70"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </button>

        <div className="flex items-center gap-2">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                selected === i
                  ? 'w-8 bg-gradient-to-r from-[#127dfe] to-[#7c3aed] shadow-[0_0_12px_rgba(18,125,254,0.6)]'
                  : 'w-2 bg-black/20 hover:bg-black/40 dark:bg-white/20 dark:hover:bg-white/40',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label={nextLabel || 'Next'}
          onClick={() => emblaApi?.scrollNext()}
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/60 backdrop-blur transition-all hover:scale-110 hover:border-[#127dfe]/40 hover:bg-[#127dfe] hover:text-white hover:shadow-[0_12px_28px_-10px_rgba(18,125,254,0.55)] dark:border-white/12 dark:bg-white/8 dark:text-white/70"
        >
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Slide nav dots ───────────────────────────────────────────────────────────
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
    <nav className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 lg:flex">
      <div className="flex flex-col items-end gap-3">
        {SLIDE_IDS.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            className="group flex items-center gap-2"
            title={labels[i]}
          >
            <span
              className={cn(
                'text-[10px] font-semibold tracking-wide transition-all duration-300',
                active === i
                  ? 'text-[#127dfe] opacity-100'
                  : 'text-black/30 opacity-0 group-hover:opacity-100 dark:text-white/30',
              )}
            >
              {labels[i]}
            </span>
            <span
              className={cn(
                'block rounded-full transition-all duration-300',
                active === i
                  ? 'h-7 w-2 bg-gradient-to-b from-[#127dfe] to-[#7c3aed] shadow-[0_0_12px_rgba(18,125,254,0.7)]'
                  : 'h-2 w-2 bg-black/20 group-hover:bg-black/40 dark:bg-white/20 dark:group-hover:bg-white/40',
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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-black/8 bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/8 dark:bg-black/70'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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

        <nav className="hidden items-center gap-6 md:flex">
          {t.nav.map(([href, label]) => (
            <a
              key={href}
              href={href as string}
              className="relative text-[13px] font-medium text-black/60 transition-colors hover:text-black dark:text-white/56 dark:hover:text-white"
            >
              <span className="after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gradient-to-r after:from-[#127dfe] after:to-[#7c3aed] after:transition-all after:duration-300 hover:after:w-full">
                {label}
              </span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle compact minimal />
          <ThemeToggle compact minimal />
          <Link
            href="/login"
            className="hidden text-[13px] font-medium text-black/60 transition hover:text-black dark:text-white/56 dark:hover:text-white sm:inline"
          >
            {t.login}
          </Link>
          <motion.a
            href="#cta"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#127dfe] to-[#7c3aed] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(18,125,254,0.5)] transition-all hover:shadow-[0_14px_36px_-6px_rgba(124,58,237,0.65)]"
          >
            <span className="pointer-events-none absolute inset-y-0 -left-10 w-10 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-all duration-700 group-hover:left-[110%]" />
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

// ─── SLIDE 1 · HERO ───────────────────────────────────────────────────────────
function HeroSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  // Scroll-driven parallax for hero contents
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const ySub = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yChips = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const words = [t.hero.title1, t.hero.title2, t.hero.title3];

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white pt-16 dark:bg-[#06080f]"
    >
      {/* Animated gradient blobs (parallax + drift) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y: blob1Y }}
          animate={{ x: [0, 60, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-30 blur-[100px] dark:opacity-20"
          aria-hidden
        >
          <div className="h-full w-full" style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }} />
        </motion.div>
        <motion.div
          style={{ y: blob2Y }}
          animate={{ x: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full opacity-25 blur-[100px] dark:opacity-18"
          aria-hidden
        >
          <div className="h-full w-full" style={{ background: `radial-gradient(circle, ${ACCENT_ALT}, transparent 70%)` }} />
        </motion.div>
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-15 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${ACCENT_CYAN}, transparent 70%)` }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle, #0a0a14 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 72%)',
        }}
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.r * 2,
              height: p.r * 2,
              background: ACCENT,
              opacity: p.op,
            }}
            animate={{ y: [0, -28, 0], opacity: [p.op, p.op * 2.2, p.op] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Eyebrow>{t.hero.badge}</Eyebrow>
          </motion.div>

          {/* Headline */}
          <motion.div style={{ y: yTitle }} className="mt-7 overflow-hidden">
            {words.map((word, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.85, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'block text-[48px] font-bold leading-[0.97] tracking-[-0.045em] sm:text-[66px] lg:text-[86px]',
                  i === 1
                    ? 'bg-gradient-to-r from-[#127dfe] via-[#7c3aed] to-[#0ea5e9] bg-clip-text text-transparent [background-size:200%_auto]'
                    : 'text-black dark:text-white',
                )}
                style={i === 1 ? { animation: 'gradient-pan 6s linear infinite' } : undefined}
              >
                {word}
              </motion.div>
            ))}
          </motion.div>

          {/* Subtitle */}
          <motion.p
            style={{ y: ySub }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-7 max-w-xl text-[16px] leading-7 text-black/58 dark:text-white/52 sm:text-[17px]"
          >
            {t.hero.sub}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <MagBtn href="/login" variant="primary">
              {t.hero.cta1}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </MagBtn>
            <MagBtn href="#features" variant="ghost">
              {t.hero.cta2}
            </MagBtn>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.76 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-black/48 dark:text-white/40"
          >
            {t.hero.trust.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Hero chip slider (mobile-first horizontal carousel) */}
        <motion.div style={{ y: yChips }} className="relative mx-auto mt-14 max-w-[760px]">
          <HeroChipSlider chips={t.hero.chips} inView={inView} />
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.a
        href="#why"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1.5 text-black/32 dark:text-white/28"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.a>

      {/* Local keyframes for gradient pan */}
      <style jsx>{`
        @keyframes gradient-pan {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </section>
  );
}

function HeroChipSlider({
  chips,
  inView,
}: {
  chips: ReadonlyArray<{ readonly label: string; readonly sub: string }>;
  inView: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', skipSnaps: false });

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, 3500);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex -ml-3 sm:-ml-4">
        {chips.map((chip, i) => (
          <div
            key={i}
            className="flex-[0_0_70%] pl-3 sm:flex-[0_0_38%] sm:pl-4 md:flex-[0_0_33.333%]"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.8 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard className="rounded-2xl border border-black/8 bg-white/90 p-4 shadow-[0_20px_50px_-20px_rgba(18,125,254,0.25)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                >
                  <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${CARD_COLORS[i]}18` }}>
                    <span className="h-3 w-3 rounded-full" style={{ background: CARD_COLORS[i], boxShadow: `0 0 12px ${CARD_COLORS[i]}` }} />
                  </div>
                  <div className="text-[13px] font-semibold text-black/82 dark:text-white/82">{chip.label}</div>
                  <div className="mt-0.5 text-[11px] text-black/46 dark:text-white/40">{chip.sub}</div>
                </motion.div>
              </TiltCard>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SLIDE 2 · WHY ────────────────────────────────────────────────────────────
function WhySlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yLeft = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yRight = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section
      id="why"
      ref={ref}
      className="relative min-h-screen bg-[#f7f8fc] py-20 dark:bg-[#0a0d17] lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full opacity-10 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <Eyebrow>{t.why.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[48px] lg:text-[58px]">
            {t.why.title}
          </h2>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Before */}
          <motion.div
            style={{ y: yLeft }}
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="relative h-full overflow-hidden rounded-3xl border border-rose-200/60 bg-gradient-to-br from-rose-50 via-white to-orange-50/60 p-8 shadow-[0_24px_60px_-24px_rgba(244,63,94,0.25)] transition-shadow duration-500 hover:shadow-[0_30px_70px_-20px_rgba(244,63,94,0.4)] dark:border-rose-900/40 dark:from-rose-950/50 dark:via-[#0f1018] dark:to-orange-950/30 lg:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {t.why.before.tag}
              </div>
              <div className="space-y-3">
                {t.why.before.items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 rounded-2xl border border-rose-100/80 bg-white/70 px-4 py-3.5 transition-all hover:border-rose-200 hover:shadow-[0_8px_20px_-12px_rgba(244,63,94,0.35)] dark:border-rose-900/30 dark:bg-rose-950/30"
                  >
                    <TrendingDown className="h-4 w-4 flex-shrink-0 text-rose-500" />
                    <span className="text-[14px] text-black/72 dark:text-white/66">{item}</span>
                  </motion.div>
                ))}
              </div>
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-rose-200/30 blur-3xl dark:bg-rose-800/20" />
            </TiltCard>
          </motion.div>

          {/* After */}
          <motion.div
            style={{ y: yRight }}
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="relative h-full overflow-hidden rounded-3xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-violet-50/60 p-8 shadow-[0_24px_60px_-24px_rgba(18,125,254,0.3)] transition-shadow duration-500 hover:shadow-[0_30px_70px_-20px_rgba(18,125,254,0.5)] dark:border-blue-900/40 dark:from-blue-950/50 dark:via-[#0f1018] dark:to-violet-950/30 lg:p-10">
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ background: `${ACCENT}18`, color: ACCENT }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                {t.why.after.tag}
              </div>
              <div className="space-y-3">
                {t.why.after.items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                    whileHover={{ x: -4 }}
                    className="flex items-center gap-3 rounded-2xl border border-blue-100/80 bg-white/70 px-4 py-3.5 transition-all hover:border-blue-200 hover:shadow-[0_8px_20px_-12px_rgba(18,125,254,0.35)] dark:border-blue-900/30 dark:bg-blue-950/25"
                  >
                    <div
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: ACCENT, boxShadow: `0 0 12px ${ACCENT}80` }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[14px] text-black/72 dark:text-white/66">{item}</span>
                  </motion.div>
                ))}
              </div>
              <div
                className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full opacity-30 blur-3xl"
                style={{ background: `radial-gradient(circle, ${ACCENT}, transparent)` }}
              />
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SLIDE 3 · FEATURES (slider) ──────────────────────────────────────────────
function FeaturesSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      id="features"
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-white py-20 dark:bg-[#06080f] lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-0 top-1/4 h-[460px] w-[460px] rounded-full opacity-10 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${ACCENT_ALT}, transparent 70%)` }}
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 max-w-2xl"
        >
          <Eyebrow>{t.features.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[48px]">
            {t.features.title}
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-black/54 dark:text-white/46">{t.features.sub}</p>
        </motion.div>

        <Slider autoplay={5000} prevLabel={t.prev} nextLabel={t.next}>
          {t.features.items.map((item, i) => {
            const Icon = FEATURE_ICONS[i];
            const color = CARD_COLORS[i];
            return (
              <div
                key={i}
                className="flex-[0_0_85%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <TiltCard className="group relative h-full overflow-hidden rounded-3xl border border-black/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_28px_60px_-22px_rgba(18,125,254,0.4)] dark:border-white/8 dark:bg-white/[0.03]">
                    {/* Hover glow follows cursor */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `radial-gradient(280px circle at var(--mx,50%) var(--my,50%), ${color}1f, transparent 70%)` }}
                    />
                    <motion.div
                      whileHover={{ scale: 1.12, rotate: 6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: `${color}16` }}
                    >
                      <Icon className="h-5 w-5" style={{ color }} />
                      <motion.div
                        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ boxShadow: `0 0 24px ${color}80` }}
                      />
                    </motion.div>
                    <h3 className="relative z-10 mt-5 text-[16px] font-semibold tracking-tight text-black dark:text-white">
                      {item.title}
                    </h3>
                    <p className="relative z-10 mt-1.5 text-[13px] leading-relaxed text-black/52 dark:text-white/44">
                      {item.desc}
                    </p>
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: '70%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.3 + i * 0.04 }}
                    />
                  </TiltCard>
                </motion.div>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}

// ─── SLIDE 4 · WHO (slider) ───────────────────────────────────────────────────
function WhoSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      id="who"
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-[#f7f8fc] py-20 dark:bg-[#0a0d17] lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-0 top-1/3 h-[420px] w-[420px] rounded-full opacity-10 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${ACCENT_CYAN}, transparent 70%)` }}
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <Eyebrow>{t.who.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[48px]">
            {t.who.title}
          </h2>
          <p className="mt-4 text-[15px] text-black/52 dark:text-white/44">{t.who.sub}</p>
        </motion.div>

        <Slider autoplay={5500} prevLabel={t.prev} nextLabel={t.next}>
          {t.who.items.map((item, i) => {
            const Icon = WHO_ICONS[i];
            const color = CARD_COLORS[i];
            return (
              <div
                key={i}
                className="flex-[0_0_85%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 32, scale: 0.96 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <TiltCard className="group relative h-full cursor-default overflow-hidden rounded-3xl border border-black/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_30px_70px_-22px_rgba(18,125,254,0.32)] dark:border-white/8 dark:bg-white/[0.03] dark:hover:shadow-[0_30px_70px_-22px_rgba(124,58,237,0.32)]">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `radial-gradient(320px circle at var(--mx,50%) var(--my,50%), ${color}1a, transparent 65%)` }}
                    />
                    <div
                      className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `${color}16` }}
                    >
                      <Icon className="h-6 w-6" style={{ color }} />
                      <motion.div
                        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ boxShadow: `0 0 28px ${color}55` }}
                      />
                    </div>
                    <h3 className="relative z-10 text-[18px] font-bold tracking-tight text-black dark:text-white">
                      {item.title}
                    </h3>
                    <p className="relative z-10 mt-2 text-[13.5px] leading-relaxed text-black/52 dark:text-white/44">
                      {item.desc}
                    </p>
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: '60%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                    />
                  </TiltCard>
                </motion.div>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}

// ─── SLIDE 5 · HOW (timeline + slider) ────────────────────────────────────────
function HowSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.5], ['0%', '100%']);

  return (
    <section
      id="how"
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-white py-20 dark:bg-[#06080f] lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 opacity-20"
          style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <Eyebrow>{t.how.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[48px]">
            {t.how.title}
          </h2>
        </motion.div>

        {/* Scroll-driven progress timeline */}
        <div className="relative mx-auto mb-10 hidden h-px max-w-3xl overflow-hidden rounded-full bg-black/10 dark:bg-white/10 sm:block">
          <motion.div
            style={{ width: lineWidth }}
            className="h-full bg-gradient-to-r from-[#127dfe] via-[#7c3aed] to-[#0ea5e9] shadow-[0_0_18px_rgba(18,125,254,0.6)]"
          />
        </div>

        <Slider autoplay={5000} prevLabel={t.prev} nextLabel={t.next}>
          {t.how.steps.map((step, i) => (
            <div
              key={i}
              className="flex-[0_0_88%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative h-full"
              >
                <TiltCard className="relative h-full overflow-hidden rounded-3xl border border-black/8 bg-white p-7 transition-all duration-300 hover:-translate-y-2 hover:border-transparent hover:shadow-[0_32px_60px_-22px_rgba(18,125,254,0.38)] dark:border-white/8 dark:bg-white/[0.03]">
                  <div className="relative mb-6">
                    <motion.div
                      className="relative flex h-[58px] w-[58px] items-center justify-center rounded-2xl text-[16px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_ALT})`, boxShadow: `0 16px 36px -12px ${ACCENT}88` }}
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                    >
                      {step.n}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        animate={{ boxShadow: [`0 0 0 0px ${ACCENT}80`, `0 0 0 14px ${ACCENT}00`] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      />
                    </motion.div>
                  </div>

                  <h3 className="text-[17px] font-bold tracking-tight text-black dark:text-white">{step.title}</h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-black/52 dark:text-white/44">{step.desc}</p>

                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}10, ${ACCENT_ALT}06)` }}
                  />
                </TiltCard>
              </motion.div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

// ─── SLIDE 6 · PROOF (stats + reviews slider) ─────────────────────────────────
function ProofSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      id="proof"
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-[#f7f8fc] py-20 dark:bg-[#0a0d17] lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full opacity-10 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
        />
        <div
          className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full opacity-10 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${ACCENT_ALT}, transparent 70%)` }}
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <Eyebrow>{t.proof.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-black dark:text-white sm:text-[48px]">
            {t.proof.title}
          </h2>
        </motion.div>

        {/* Stats */}
        <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.proof.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <TiltCard className="group h-full overflow-hidden rounded-3xl border border-black/8 bg-white p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_24px_60px_-20px_rgba(18,125,254,0.35)] dark:border-white/8 dark:bg-white/[0.03]">
                {stat.pre && (
                  <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-black/38 dark:text-white/32">
                    {stat.pre}
                  </div>
                )}
                <div className="text-[48px] font-black leading-none tracking-[-0.05em] sm:text-[54px]">
                  <span className="bg-gradient-to-br from-[#127dfe] via-[#7c3aed] to-[#0ea5e9] bg-clip-text text-transparent [background-size:200%_auto] group-hover:[animation:gradient-pan_3s_linear_infinite]">
                    {inView && <Counter target={stat.val} suffix={stat.suffix} pre="" />}
                  </span>
                </div>
                <div className="mt-3 text-[12.5px] leading-snug text-black/48 dark:text-white/40">{stat.label}</div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Reviews slider */}
        <Slider autoplay={6500} prevLabel={t.prev} nextLabel={t.next}>
          {t.proof.reviews.map((review, i) => (
            <div
              key={i}
              className="flex-[0_0_88%] pl-4 sm:flex-[0_0_60%] lg:flex-[0_0_40%]"
            >
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.3 + i * 0.1 }}
                className="h-full"
              >
                <TiltCard className="group relative h-full overflow-hidden rounded-3xl border border-black/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_30px_70px_-22px_rgba(18,125,254,0.3)] dark:border-white/8 dark:bg-white/[0.03] lg:p-9">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `radial-gradient(320px circle at var(--mx,50%) var(--my,50%), ${ACCENT}14, transparent 65%)` }}
                  />
                  <div className="relative z-10 mb-5">
                    <motion.div
                      whileHover={{ scale: 1.12, rotate: -8 }}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: `${ACCENT}14`, boxShadow: `0 0 24px ${ACCENT}30` }}
                    >
                      <Quote className="h-5 w-5" style={{ color: ACCENT }} />
                    </motion.div>
                  </div>

                  <p className="relative z-10 text-[14.5px] leading-7 text-black/72 dark:text-white/64">
                    {review.text}
                  </p>

                  <div className="relative z-10 mt-6 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_ALT})`, boxShadow: `0 8px 20px -8px ${ACCENT}88` }}
                    >
                      {review.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-black dark:text-white">{review.name}</div>
                      <div className="text-[11.5px] text-black/46 dark:text-white/40">{review.role}</div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <motion.span
                        key={si}
                        initial={{ opacity: 0, scale: 0.4 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + si * 0.06, type: 'spring', stiffness: 280 }}
                      >
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      </motion.span>
                    ))}
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          ))}
        </Slider>
      </div>

      <style jsx>{`
        @keyframes gradient-pan {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </section>
  );
}

// ─── SLIDE 7 · CTA ────────────────────────────────────────────────────────────
function CtaSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const glowY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.05, 0.95]);

  return (
    <section
      id="cta"
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-[#060914] py-20 lg:py-28"
    >
      {/* Stars/particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.r, height: p.r, opacity: p.op * 0.7 }}
          animate={{ opacity: [p.op * 0.4, p.op * 1.4, p.op * 0.4] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity }}
        />
      ))}

      {/* Big glow with parallax */}
      <motion.div
        style={{ y: glowY, scale: glowScale }}
        className="pointer-events-none absolute inset-x-0 top-1/4 flex justify-center"
      >
        <motion.div
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="h-[520px] w-[820px] rounded-full blur-[100px]"
          style={{ background: `radial-gradient(ellipse at center, ${ACCENT}60, ${ACCENT_ALT}30, transparent 70%)` }}
        />
      </motion.div>

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '52px 52px',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1280px] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Eyebrow light>{t.cta.badge}</Eyebrow>

          <h2 className="mx-auto mt-7 max-w-3xl text-[42px] font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-[60px] lg:text-[76px]">
            {t.cta.title.split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                className="mr-[0.18em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mx-auto mt-6 max-w-lg text-[16px] leading-7 text-white/58"
          >
            {t.cta.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <motion.a
              href="/login"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl bg-white px-8 py-4 text-[15px] font-bold text-black shadow-[0_24px_60px_-12px_rgba(255,255,255,0.35)] transition-all duration-300 hover:shadow-[0_32px_72px_-12px_rgba(255,255,255,0.55)]"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-10 w-10 rotate-12 bg-gradient-to-r from-transparent via-black/8 to-transparent transition-all duration-700 group-hover:left-[110%]" />
              <span className="relative z-10 flex items-center gap-2.5">
                {t.cta.btn1}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </motion.a>

            <motion.a
              href="/demo/klikbuk-demo"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-8 py-4 text-[15px] font-semibold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/14"
            >
              {t.cta.btn2}
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.85 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-white/48"
          >
            {t.cta.trust.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/8 px-4 py-6 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 sm:flex-row">
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
          <div className="text-[11.5px] text-white/32">{t.footer}</div>
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
