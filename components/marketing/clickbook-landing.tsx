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

// ─── Copy ────────────────────────────────────────────────────────────────────
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

// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  return (
    <motion.div
      style={{ scaleX, background: `linear-gradient(90deg, ${ACCENT}, #38bdf8)` }}
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left"
    />
  );
}

// ─── Reveal ───────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 28, className = '' }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
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
      duration: 2.4, ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = (pre ? pre + ' ' : '') +
          (target >= 1000 ? Math.round(v).toLocaleString('ru') : Math.round(v)) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, target, suffix, pre]);
  return <span ref={ref}>{pre ? pre + ' ' : ''}0{suffix}</span>;
}

// ─── Section eyebrow label ────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="h-px w-5 bg-[#127dfe]" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#127dfe]">{children}</span>
    </div>
  );
}

// ─── Slider (mobile carousel) ─────────────────────────────────────────────────
type SliderProps = { children: React.ReactNode; autoplay?: number; loop?: boolean; prevLabel?: string; nextLabel?: string; className?: string };
function Slider({ children, autoplay, loop = true, prevLabel, nextLabel, className = '' }: SliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop, align: 'start', containScroll: 'trimSnaps' });
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
    return () => { emblaApi.off('select', onSelect); emblaApi.off('reInit', onReInit); };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !autoplay || paused) return;
    const id = setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext(); else emblaApi.scrollTo(0);
    }, autoplay);
    return () => clearInterval(id);
  }, [emblaApi, autoplay, paused]);

  return (
    <div className={cn('relative', className)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 touch-pan-y">{children}</div>
      </div>
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {snaps.map((_, i) => (
            <button key={i} type="button" onClick={() => emblaApi?.scrollTo(i)}
              className={cn('h-1 rounded-full transition-all duration-300', selected === i ? 'w-8 bg-[#127dfe]' : 'w-3 bg-black/15 dark:bg-white/15')} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => emblaApi?.scrollPrev()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/12 text-black/60 transition-all hover:border-black/30 hover:bg-black hover:text-white dark:border-white/12 dark:text-white/60 dark:hover:bg-white dark:hover:text-black">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => emblaApi?.scrollNext()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/12 text-black/60 transition-all hover:border-black/30 hover:bg-black hover:text-white dark:border-white/12 dark:text-white/60 dark:hover:bg-white dark:hover:text-black">
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Side nav dots ─────────────────────────────────────────────────────────────
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
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { const idx = SLIDE_IDS.indexOf(e.target.id as typeof SLIDE_IDS[number]); if (idx !== -1) setActive(idx); } }); },
      { threshold: 0.4 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <nav className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 lg:flex">
      <div className="flex flex-col items-end gap-3">
        {SLIDE_IDS.map((id, i) => (
          <a key={id} href={`#${id}`} className="group flex items-center gap-2.5" title={labels[i]}>
            <span className={cn('text-[10px] font-medium tracking-wide transition-all duration-300',
              active === i ? 'opacity-100 text-black dark:text-white' : 'opacity-0 text-black/40 group-hover:opacity-100 dark:text-white/40')}>{labels[i]}</span>
            <span className={cn('block h-px transition-all duration-300 rounded-full',
              active === i ? 'w-6 bg-[#127dfe]' : 'w-3 bg-black/20 group-hover:w-5 dark:bg-white/20')} />
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─── Marquee strip ────────────────────────────────────────────────────────────
function MarqueeStrip({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const list = [...items, ...items, ...items];
  return (
    <div className="relative w-full overflow-hidden py-3.5"
      style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
      <motion.div
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
        className={cn('flex w-max items-center gap-10 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.22em]',
          dark ? 'text-white/30' : 'text-black/35 dark:text-white/30')}>
        {list.map((item, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="h-1 w-1 rounded-full bg-current opacity-60" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Dashboard mockup ─────────────────────────────────────────────────────────
type ChipsTuple = ReadonlyArray<{ readonly label: string; readonly sub: string }>;

function DashboardMockup({ chips, inView }: { chips: ChipsTuple; inView: boolean }) {
  const [notiIdx, setNotiIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNotiIdx((i) => (i + 1) % chips.length), 3200);
    return () => clearInterval(id);
  }, [chips.length]);

  const slots = [
    { name: chips[0].sub.split(' · ')[0] || 'Дарья', service: chips[0].sub.split(' · ')[1] || 'Маникюр', time: '12:30' },
    { name: chips[2].sub.split(' · ')[0] || 'Анна', service: 'Стрижка', time: chips[2].sub.split(' · ')[1] || '16:00' },
    { name: 'Михаил', service: 'Массаж', time: '18:00' },
  ];
  const chartPoints = [22, 38, 31, 52, 44, 70, 62, 88];
  const chartW = 240; const chartH = 56;
  const stepX = chartW / (chartPoints.length - 1);
  const maxY = Math.max(...chartPoints);
  const pathD = chartPoints.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${chartH - (v / maxY) * chartH * 0.92}`).join(' ');
  const areaD = `${pathD} L ${chartW} ${chartH} L 0 ${chartH} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[520px]"
    >
      {/* Glow */}
      <motion.div
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -inset-6 rounded-[44px] blur-[60px] opacity-60"
        style={{ background: `radial-gradient(ellipse at 50% 60%, ${ACCENT}55, transparent 68%)` }}
      />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[#0d0f1a] p-5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
      >
        {/* Mac-style header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c840]" />
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1">
            <CalendarDays className="h-3 w-3 text-white/40" />
            <span className="text-[10px] font-medium tracking-[0.1em] text-white/40">clickbook.app</span>
          </div>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Bell className="h-3.5 w-3.5 text-white/40" />
          </motion.div>
        </div>

        {/* Notification */}
        <div className="relative mb-4 h-[60px]">
          <AnimatePresence mode="wait">
            <motion.div key={notiIdx}
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3 overflow-hidden"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#127dfe]/20 text-[#127dfe]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold text-white/90">{chips[notiIdx].label}</div>
                <div className="truncate text-[11px] text-white/40">{chips[notiIdx].sub}</div>
              </div>
              <motion.div initial={{ width: 0 }} animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-[#127dfe] to-[#38bdf8]" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Booking slots */}
        <div className="mb-4 space-y-1.5">
          {slots.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.7 + i * 0.1 }}
              className="group flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2.5 transition-all hover:border-[#127dfe]/30 hover:bg-[#127dfe]/[0.06]"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/8 text-[11px] font-bold text-white/70">{s.name.charAt(0)}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-white/85">{s.name}</div>
                <div className="text-[10.5px] text-white/40">{s.service}</div>
              </div>
              <div className="rounded-lg bg-white/8 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white/70">{s.time}</div>
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#127dfe]" />
            </motion.div>
          ))}
        </div>

        {/* Mini chart */}
        <div className="mb-3 rounded-2xl border border-white/6 bg-white/[0.02] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">Записи · 7 дней</div>
            <div className="text-[11px] font-bold tabular-nums text-[#38bdf8]">+24%</div>
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-12 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path d={areaD} fill="url(#cFill)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.9, delay: 1.2 }} />
            <motion.path d={pathD} fill="none" stroke={ACCENT} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.6, delay: 1, ease: [0.22, 1, 0.36, 1] }} />
          </svg>
        </div>

        {/* Bottom stat */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 1.5 }}
          className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#127dfe] to-[#0a5fd4] p-3.5"
        >
          <div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/70">{chips[1].sub}</div>
            <div className="text-[24px] font-bold leading-none tracking-[-0.03em] text-white">{chips[1].label}</div>
          </div>
          <BarChart3 className="h-6 w-6 text-white/80" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function LandingHeader({ t }: { t: typeof COPY.ru }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const cb = () => setScrolled(window.scrollY > 20);
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
          ? 'border-b border-black/6 bg-white/88 backdrop-blur-2xl dark:border-white/7 dark:bg-[#030407]/88'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/landing" className="flex items-center">
          <Image src="/brand/clickbook-logo-dark-transparent.png" alt="КликБук" width={128} height={30}
            className="h-7 w-auto dark:hidden" priority />
          <Image src="/brand/clickbook-logo-light-transparent.png" alt="КликБук" width={128} height={30}
            className="hidden h-7 w-auto dark:block" priority
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {t.nav.map(([href, label]) => (
            <a key={href} href={href as string}
              className="relative text-[13px] font-medium text-black/55 transition-colors hover:text-black dark:text-white/55 dark:hover:text-white after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[#127dfe] after:transition-all after:duration-300 hover:after:w-full">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle compact minimal />
          <ThemeToggle compact minimal />
          <Link href="/login"
            className="hidden text-[13px] font-medium text-black/55 transition hover:text-black dark:text-white/55 dark:hover:text-white sm:inline">
            {t.login}
          </Link>
          <motion.a href="#cta" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#127dfe] px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[#0a5fd4]"
            style={{ boxShadow: '0 0 20px rgba(18,125,254,0.35)' }}>
            {t.ctaTop}
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const yContent = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const cx = useMotionValue(0); const cy = useMotionValue(0);
  const sx = useSpring(cx, { stiffness: 40, damping: 22 });
  const sy = useSpring(cy, { stiffness: 40, damping: 22 });
  const blobX = useTransform(sx, (v) => v * 30);
  const blobY = useTransform(sy, (v) => v * 30);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cx.set((e.clientX - window.innerWidth / 2) / window.innerWidth);
      cy.set((e.clientY - window.innerHeight / 2) / window.innerHeight);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [cx, cy]);

  const marqueeItems = [...t.hero.trust, 'Telegram · VK · Web', '−78% no-show', '2 500+', '24/7'];

  return (
    <section id="hero" ref={ref} className="relative min-h-screen overflow-hidden bg-[#030407] flex flex-col">
      {/* Grid mesh */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

      {/* Orbs */}
      <motion.div style={{ x: blobX, y: blobY }}
        className="pointer-events-none absolute right-[-8%] top-[-5%] h-[640px] w-[640px] rounded-full blur-[120px] opacity-40">
        <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full w-full rounded-full"
          style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 68%)` }} />
      </motion.div>
      <motion.div className="pointer-events-none absolute bottom-[5%] left-[-12%] h-[480px] w-[480px] rounded-full blur-[100px] opacity-25">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="h-full w-full rounded-full"
          style={{ background: `radial-gradient(circle, #38bdf8, transparent 68%)` }} />
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity, y: yContent }}
        className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center px-4 pt-24 pb-8 text-center sm:px-6 lg:px-8">

        {/* Badge */}
        <Reveal>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-[#127dfe]" />
            <span className="text-[12px] font-medium tracking-[0.06em] text-white/60">{t.hero.badge}</span>
          </div>
        </Reveal>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl">
          {[t.hero.title1, t.hero.title2, t.hero.title3].map((word, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                initial={{ y: 110 }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 1, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'block text-[48px] font-bold leading-[0.95] tracking-[-0.05em] text-white sm:text-[70px] lg:text-[92px] xl:text-[108px]',
                  i === 1 && 'bg-gradient-to-r from-[#127dfe] via-[#38bdf8] to-[#127dfe] bg-clip-text text-transparent bg-[length:200%] animate-[shimmer_4s_ease-in-out_infinite]'
                )}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Sub */}
        <Reveal delay={0.52}>
          <p className="mx-auto mt-8 max-w-lg text-[16px] leading-7 text-white/45 sm:text-[18px] lg:max-w-xl">
            {t.hero.sub}
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={0.66}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <motion.a href="/login" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-8 py-3.5 text-[15px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #127dfe 0%, #0a5fd4 100%)', boxShadow: '0 0 48px rgba(18,125,254,0.5), 0 1px 0 rgba(255,255,255,0.18) inset' }}>
              <span className="pointer-events-none absolute inset-y-0 -left-10 w-12 rotate-12 bg-white/20 transition-all duration-700 group-hover:left-[120%]" />
              <span className="relative z-10 flex items-center gap-2">
                {t.hero.cta1}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </motion.a>
            <motion.a href="#features" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/5 px-8 py-3.5 text-[15px] font-semibold text-white/70 backdrop-blur-sm transition-all hover:border-white/28 hover:bg-white/10 hover:text-white">
              {t.hero.cta2}
            </motion.a>
          </div>
        </Reveal>

        {/* Trust */}
        <Reveal delay={0.8}>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-white/35">
            {t.hero.trust.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#127dfe]" />
                {item}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Mockup */}
        <div className="mt-20 w-full">
          <DashboardMockup chips={t.hero.chips} inView={inView} />
        </div>
      </motion.div>

      {/* Marquee */}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.4 }}
        className="relative z-10 border-t border-white/6 bg-white/[0.02] backdrop-blur-sm">
        <MarqueeStrip dark items={marqueeItems} />
      </motion.div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030407] to-transparent" />
    </section>
  );
}

// ─── WHY ──────────────────────────────────────────────────────────────────────
function WhySlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="why" ref={ref} className="relative overflow-hidden bg-white py-28 dark:bg-[#06080f] lg:py-36">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <Reveal><Eyebrow>{t.why.eyebrow}</Eyebrow></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 max-w-2xl text-[36px] font-bold leading-[1.04] tracking-[-0.045em] text-black dark:text-white sm:text-[46px] lg:text-[54px]">
              {t.why.title}
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -28 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl border border-black/8 bg-black/[0.018] p-8 dark:border-white/8 dark:bg-white/[0.025] lg:p-10"
          >
            <div className="mb-7 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/35">
              <span className="h-px w-5 bg-black/25 dark:bg-white/25" />
              {t.why.before.tag}
            </div>
            <ul className="space-y-4">
              {t.why.before.items.map((item, i) => (
                <motion.li key={i}
                  initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 text-[15px] leading-6 text-black/55 dark:text-white/45">
                  <Minus className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/25 dark:text-white/25" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 28 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-[#127dfe]/22 bg-[#127dfe]/[0.04] p-8 dark:border-[#127dfe]/28 dark:bg-[#127dfe]/[0.07] lg:p-10"
          >
            <motion.div animate={{ opacity: [0.3, 0.55, 0.3] }} transition={{ duration: 6, repeat: Infinity }}
              className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-[80px]"
              style={{ background: `radial-gradient(circle, ${ACCENT}55, transparent 68%)` }} />
            <div className="mb-7 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#127dfe]">
              <span className="h-px w-5 bg-[#127dfe]" />
              {t.why.after.tag}
            </div>
            <ul className="space-y-4">
              {t.why.after.items.map((item, i) => (
                <motion.li key={i}
                  initial={{ opacity: 0, x: 12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.45, delay: 0.4 + i * 0.08 }}
                  className="flex items-start gap-3 text-[15px] leading-6 font-medium text-black/80 dark:text-white/80">
                  <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#127dfe]/20">
                    <Check className="h-2.5 w-2.5 text-[#127dfe]" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
function FeatureCard({ Icon, title, desc, index }: { Icon: typeof Globe; title: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <motion.div ref={ref} onMouseMove={onMove}
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full overflow-hidden rounded-2xl border border-black/7 bg-white p-6 transition-all duration-400 hover:-translate-y-1 hover:border-black/16 hover:shadow-[0_20px_56px_-20px_rgba(0,0,0,0.18)] dark:border-white/8 dark:bg-white/[0.02] dark:hover:border-white/18"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{ background: `radial-gradient(260px circle at var(--mx,50%) var(--my,50%), ${ACCENT}0d, transparent 60%)` }} />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04] text-black/65 transition-all duration-300 group-hover:bg-[#127dfe] group-hover:text-white dark:bg-white/[0.06] dark:text-white/65">
          <Icon className="h-[17px] w-[17px]" />
        </div>
        <span className="tabular-nums text-[10px] font-semibold tracking-[0.14em] text-black/22 dark:text-white/22">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="relative z-10 mt-6 text-[16px] font-semibold tracking-tight text-black dark:text-white">{title}</h3>
      <p className="relative z-10 mt-1.5 text-[13px] leading-relaxed text-black/50 dark:text-white/42">{desc}</p>
      <div className="relative z-10 mt-5 h-px w-0 bg-[#127dfe] transition-all duration-500 group-hover:w-8" />
    </motion.div>
  );
}

function FeaturesSlide({ t }: { t: typeof COPY.ru }) {
  return (
    <section id="features" className="relative overflow-hidden bg-[#f7f8fb] py-28 dark:bg-[#08090e] lg:py-36">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal><Eyebrow>{t.features.eyebrow}</Eyebrow></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.045em] text-black dark:text-white sm:text-[46px] lg:text-[54px]">
                {t.features.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-xs text-[15px] leading-6 text-black/50 dark:text-white/42 lg:text-right">{t.features.sub}</p>
          </Reveal>
        </div>

        {/* Grid on desktop, slider on mobile */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {t.features.items.map((item, i) => (
            <FeatureCard key={i} Icon={FEATURE_ICONS[i]} title={item.title} desc={item.desc} index={i} />
          ))}
        </div>
        <div className="sm:hidden">
          <Slider autoplay={5000} prevLabel={t.prev} nextLabel={t.next}>
            {t.features.items.map((item, i) => (
              <div key={i} className="flex-[0_0_84%] pl-4">
                <FeatureCard Icon={FEATURE_ICONS[i]} title={item.title} desc={item.desc} index={i} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

// ─── WHO ──────────────────────────────────────────────────────────────────────
function WhoCard({ Icon, title, desc, index }: { Icon: typeof Scissors; title: string; desc: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full overflow-hidden rounded-2xl border border-black/7 bg-white p-7 transition-all duration-400 hover:-translate-y-1 hover:border-black/16 hover:shadow-[0_20px_56px_-20px_rgba(0,0,0,0.16)] dark:border-white/8 dark:bg-white/[0.02] dark:hover:border-white/18"
    >
      <motion.div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${ACCENT}50, transparent 68%)` }} />
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[0.04] text-black/65 transition-all duration-300 group-hover:bg-[#127dfe] group-hover:text-white dark:bg-white/[0.06] dark:text-white/65">
          <Icon className="h-5 w-5" />
        </div>
        <span className="tabular-nums text-[10px] font-semibold tracking-[0.14em] text-black/22 dark:text-white/22">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="relative z-10 mt-7 text-[19px] font-bold tracking-tight text-black dark:text-white">{title}</h3>
      <p className="relative z-10 mt-2 text-[13.5px] leading-relaxed text-black/52 dark:text-white/42">{desc}</p>
      <motion.div className="absolute bottom-0 left-0 h-[2px] rounded-full bg-gradient-to-r from-[#127dfe] to-[#38bdf8]"
        initial={{ width: 0 }} whileInView={{ width: '35%' }}
        viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + index * 0.06 }} />
    </motion.div>
  );
}

function WhoSlide({ t }: { t: typeof COPY.ru }) {
  return (
    <section id="who" className="relative overflow-hidden bg-white py-28 dark:bg-[#06080f] lg:py-36">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <Reveal><Eyebrow>{t.who.eyebrow}</Eyebrow></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.045em] text-black dark:text-white sm:text-[46px] lg:text-[54px]">
              {t.who.title}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-[15px] leading-6 text-black/50 dark:text-white/42">{t.who.sub}</p>
          </Reveal>
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {t.who.items.map((item, i) => (
            <WhoCard key={i} Icon={WHO_ICONS[i]} title={item.title} desc={item.desc} index={i} />
          ))}
        </div>
        <div className="sm:hidden">
          <Slider autoplay={6000} prevLabel={t.prev} nextLabel={t.next}>
            {t.who.items.map((item, i) => (
              <div key={i} className="flex-[0_0_84%] pl-4">
                <WhoCard Icon={WHO_ICONS[i]} title={item.title} desc={item.desc} index={i} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

// ─── HOW ──────────────────────────────────────────────────────────────────────
function StepCard({ n, title, desc, index }: { n: string; title: string; desc: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full overflow-hidden rounded-2xl border border-black/7 bg-white p-7 transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.2)] dark:border-white/8 dark:bg-white/[0.025] dark:hover:border-white/16"
    >
      <div className="mb-8 flex items-start justify-between">
        <div className="text-[52px] font-bold leading-none tracking-[-0.04em] text-black/8 transition-colors duration-300 group-hover:text-[#127dfe]/20 dark:text-white/8 dark:group-hover:text-[#127dfe]/20">
          {n}
        </div>
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
          className="h-2 w-2 rounded-full bg-[#127dfe]" />
      </div>
      <h3 className="text-[17px] font-semibold tracking-tight text-black dark:text-white">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-black/50 dark:text-white/42">{desc}</p>
      <div className="mt-6 flex items-center gap-2 text-[11.5px] font-medium text-black/30 transition-all duration-300 group-hover:text-[#127dfe] dark:text-white/30">
        <span className="h-px w-5 bg-current transition-all duration-300 group-hover:w-8" />
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </motion.div>
  );
}

function HowSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const lineWidth = useTransform(scrollYProgress, [0.15, 0.6], ['0%', '100%']);

  return (
    <section id="how" ref={ref} className="relative overflow-hidden bg-[#f7f8fb] py-28 dark:bg-[#08090e] lg:py-36">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <Reveal><Eyebrow>{t.how.eyebrow}</Eyebrow></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.045em] text-black dark:text-white sm:text-[46px] lg:text-[54px]">
              {t.how.title}
            </h2>
          </Reveal>
        </div>
        <div className="relative mb-10 hidden h-px overflow-hidden rounded-full bg-black/8 dark:bg-white/8 sm:block">
          <motion.div style={{ width: lineWidth }} className="h-full bg-gradient-to-r from-[#127dfe] to-[#38bdf8]" />
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {t.how.steps.map((step, i) => (
            <StepCard key={i} n={step.n} title={step.title} desc={step.desc} index={i} />
          ))}
        </div>
        <div className="sm:hidden">
          <Slider autoplay={5500} prevLabel={t.prev} nextLabel={t.next}>
            {t.how.steps.map((step, i) => (
              <div key={i} className="flex-[0_0_84%] pl-4">
                <StepCard n={step.n} title={step.title} desc={step.desc} index={i} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

// ─── PROOF ────────────────────────────────────────────────────────────────────
function ReviewCard({ text, name, role }: { text: string; name: string; role: string }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-black/7 bg-white p-7 transition-all duration-400 hover:-translate-y-1 hover:border-black/14 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.16)] dark:border-white/8 dark:bg-white/[0.025] dark:hover:border-white/16 lg:p-8">
      <div className="pointer-events-none absolute -right-4 -top-4 text-[96px] font-bold leading-none text-black/[0.03] dark:text-white/[0.03]">"</div>
      <Quote className="h-5 w-5 text-[#127dfe]/50 transition-colors duration-300 group-hover:text-[#127dfe]" />
      <p className="mt-5 text-[15px] leading-7 text-black/68 dark:text-white/60">{text}</p>
      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#127dfe] to-[#0a5fd4] text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(18,125,254,0.4)]">
            {name.slice(0, 1)}
          </div>
          <div>
            <div className="text-[13.5px] font-semibold text-black dark:text-white">{name}</div>
            <div className="text-[11.5px] text-black/42 dark:text-white/38">{role}</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, si) => (
            <motion.span key={si} initial={{ opacity: 0, scale: 0.3 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.3 + si * 0.06, type: 'spring', stiffness: 320 }}>
              <Star className="h-3.5 w-3.5 fill-[#127dfe] text-[#127dfe]" />
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProofSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="proof" ref={ref} className="relative overflow-hidden bg-white py-28 dark:bg-[#06080f] lg:py-36">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <Reveal><Eyebrow>{t.proof.eyebrow}</Eyebrow></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.04] tracking-[-0.045em] text-black dark:text-white sm:text-[46px] lg:text-[54px]">
              {t.proof.title}
            </h2>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="mb-20 grid grid-cols-2 gap-px border border-black/7 overflow-hidden rounded-3xl dark:border-white/8 lg:grid-cols-4">
          {t.proof.stats.map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="relative bg-white px-6 py-9 transition-colors hover:bg-[#127dfe]/[0.025] dark:bg-[#06080f] dark:hover:bg-[#127dfe]/[0.05]"
            >
              {stat.pre && (
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/38 dark:text-white/32">{stat.pre}</div>
              )}
              <div className="text-[52px] font-bold leading-none tracking-[-0.05em] text-black tabular-nums dark:text-white sm:text-[60px]">
                {inView && <Counter target={stat.val} suffix={stat.suffix} pre="" />}
              </div>
              <div className="mt-3 text-[12.5px] text-black/48 dark:text-white/38">{stat.label}</div>
              <motion.div className="absolute bottom-0 left-6 h-[2px] rounded-full bg-gradient-to-r from-[#127dfe] to-[#38bdf8]"
                initial={{ width: 0 }} whileInView={{ width: 32 }} viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }} />
            </motion.div>
          ))}
        </div>

        {/* Reviews grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {t.proof.reviews.map((review, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <ReviewCard text={review.text} name={review.name} role={review.role} />
            </Reveal>
          ))}
        </div>
        <div className="sm:hidden">
          <Slider autoplay={7000} prevLabel={t.prev} nextLabel={t.next}>
            {t.proof.reviews.map((review, i) => (
              <div key={i} className="flex-[0_0_90%] pl-4">
                <ReviewCard text={review.text} name={review.name} role={review.role} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CtaSlide({ t }: { t: typeof COPY.ru }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const glowY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section id="cta" ref={ref} className="relative overflow-hidden bg-[#030407] py-36 lg:py-48">
      {/* Animated gradient blob */}
      <motion.div style={{ y: glowY }}
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="h-[500px] w-[800px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(18,125,254,0.55) 0%, rgba(56,189,248,0.2) 50%, transparent 70%)' }} />
      </motion.div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 72%)' }} />

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
            <Check className="h-3.5 w-3.5 text-[#127dfe]" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55">{t.cta.badge}</span>
          </div>
        </Reveal>

        <h2 className="mx-auto max-w-3xl">
          {t.cta.title.split(' ').map((word, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span
                initial={{ y: 100 }} animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="mr-[0.2em] inline-block text-[44px] font-bold leading-[0.96] tracking-[-0.045em] text-white sm:text-[62px] lg:text-[80px]">
                {word}
              </motion.span>
            </span>
          ))}
        </h2>

        <Reveal delay={0.5}>
          <p className="mx-auto mt-8 max-w-lg text-[16px] leading-7 text-white/45">{t.cta.sub}</p>
        </Reveal>

        <Reveal delay={0.65}>
          <div className="mt-11 flex flex-col items-center gap-3 sm:flex-row">
            <motion.a href="/login" whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-white px-9 py-4 text-[15px] font-bold text-black transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)]">
              <span className="pointer-events-none absolute inset-y-0 -left-12 w-12 rotate-12 bg-black/8 transition-all duration-700 group-hover:left-[120%]" />
              <span className="relative z-10 flex items-center gap-2">
                {t.cta.btn1}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </motion.a>
            <motion.a href="/demo/klikbuk-demo" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/18 px-9 py-4 text-[15px] font-semibold text-white/68 transition-all hover:border-white/35 hover:text-white">
              {t.cta.btn2}
            </motion.a>
          </div>
        </Reveal>

        <Reveal delay={0.82}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-white/35">
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
      <div className="relative z-10 mt-28 border-t border-white/7 px-4 pt-7 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
          <Image src="/brand/clickbook-logo-light-transparent.png" alt="КликБук" width={110} height={26}
            className="h-6 w-auto opacity-60"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="text-[11.5px] text-white/25">{t.footer}</div>
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
    <div className="min-h-screen antialiased">
      <style>{`
        @keyframes shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}</style>
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
