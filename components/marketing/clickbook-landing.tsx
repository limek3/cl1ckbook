'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock3,
  GraduationCap,
  Menu,
  Scissors,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Store,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';

const navItems = [
  { label: 'Продукт', href: '#product' },
  { label: 'Возможности', href: '#features' },
  { label: 'Сценарии', href: '#audience' },
  { label: 'Тарифы', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const featureCards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: CalendarCheck,
    title: 'Запись без администраторского шума',
    text: 'Клиент сам выбирает услугу, специалиста и свободное окно. Вы видите готовую запись в расписании.',
  },
  {
    icon: Clock3,
    title: 'Расписание, которое не ломается',
    text: 'Графики, перерывы, длительность услуг и занятость команды собираются в один аккуратный календарь.',
  },
  {
    icon: Bell,
    title: 'Мягкие напоминания клиентам',
    text: 'Уведомления помогают снизить неявки и не превращают коммуникацию в ручную рутину.',
  },
  {
    icon: Users,
    title: 'Клиентская база под рукой',
    text: 'Контакты, история визитов и заметки остаются рядом с каждой записью.',
  },
  {
    icon: Settings2,
    title: 'Настройки без перегруза',
    text: 'Услуги, цены, специалисты и правила записи настраиваются простыми понятными шагами.',
  },
  {
    icon: BarChart3,
    title: 'Понятная картина дня',
    text: 'Смотрите загрузку, новые заявки, свободные окна и динамику записей без сложных отчетов.',
  },
];

const audienceCards: Array<{ icon: LucideIcon; title: string }> = [
  { icon: Scissors, title: 'Салоны красоты' },
  { icon: Store, title: 'Барбершопы' },
  { icon: Sparkles, title: 'Частные мастера' },
  { icon: Stethoscope, title: 'Клиники и кабинеты' },
  { icon: GraduationCap, title: 'Студии и школы' },
  { icon: Wrench, title: 'Сервисные компании' },
];

const timeline = [
  ['01', 'Настройте услуги', 'Добавьте услуги, длительность, цены и специалистов.'],
  ['02', 'Поделитесь ссылкой', 'Клиент открывает страницу записи и выбирает удобное время.'],
  ['03', 'Получайте записи', 'Заявки появляются в календаре автоматически и без дублей.'],
  ['04', 'Управляйте потоком', 'Меняйте статусы, смотрите клиентов и свободные окна.'],
];

const plans = [
  {
    name: 'Старт',
    price: '₽0',
    caption: 'для одного специалиста',
    description: 'Чтобы спокойно запустить первую страницу онлайн-записи.',
    items: ['1 специалист', 'Страница бронирования', 'До 50 записей', 'База клиентов'],
  },
  {
    name: 'Бизнес',
    price: '₽990',
    caption: 'для команды',
    description: 'Для бизнеса, где важно видеть расписание всей команды.',
    items: ['До 10 специалистов', 'Напоминания клиентам', 'Статистика дня', 'Приоритетная поддержка'],
    accent: true,
  },
  {
    name: 'Pro',
    price: '₽2490',
    caption: 'для роста',
    description: 'Для филиалов, сетей и команд с активным потоком заявок.',
    items: ['Безлимит специалистов', 'Роли и филиалы', 'Расширенная аналитика', 'Интеграции'],
  },
];

const testimonials = [
  {
    text: 'КликБук выглядит спокойно и профессионально. Клиенты записываются сами, а у нас стало меньше звонков и переспросов.',
    name: 'Анна Морозова',
    role: 'владелец салона красоты',
  },
  {
    text: 'Мне нравится, что все просто: ссылка, календарь, напоминания. Никаких таблиц и потерянных сообщений.',
    name: 'Мария Лебедева',
    role: 'частный мастер',
  },
  {
    text: 'Администратору стало легче распределять приемы, а руководителю — видеть загрузку специалистов за день.',
    name: 'Игорь Ковалев',
    role: 'администратор клиники',
  },
];

const faqs = [
  {
    q: 'Можно ли пользоваться бесплатно?',
    a: 'Да. Можно начать с базового тарифа, проверить сценарий онлайн-записи и перейти на расширенный план позже.',
  },
  {
    q: 'Нужно ли устанавливать приложение?',
    a: 'Нет. КликБук работает в браузере: бизнес управляет записями в веб-интерфейсе, клиенты бронируют по ссылке.',
  },
  {
    q: 'Подходит ли сервис для команды?',
    a: 'Да. Вы можете добавить специалистов, настроить расписание каждого и видеть общую загрузку.',
  },
  {
    q: 'Можно ли настроить свои услуги?',
    a: 'Да. Для каждой услуги можно указать название, цену, длительность, описание и доступных специалистов.',
  },
  {
    q: 'Будут ли уведомления клиентам?',
    a: 'Да. Напоминания помогают клиентам не забывать о визите и снижают количество пропущенных записей.',
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const slow = { duration: 0.7, ease: 'easeOut' as const };

function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      variants={fadeIn}
      transition={{ ...slow, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Button({ children, href = '#pricing', muted = false }: { children: ReactNode; href?: string; muted?: boolean }) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${
        muted
          ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          : 'bg-slate-950 text-white shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/15'
      }`}
    >
      {children}
      {!muted ? <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /> : null}
    </a>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-3" aria-label="КликБук — главная">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-white">
        <CalendarCheck className="h-4 w-4" />
      </span>
      <span className="text-base font-semibold tracking-tight text-slate-950">КликБук</span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Logo />

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a href="#product" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950">
              Демо
            </a>
            <Button>Попробовать бесплатно</Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 lg:hidden"
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
          transition={{ duration: 0.22 }}
          className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3">
              <Button>Попробовать бесплатно</Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}

function MiniBooking() {
  const slots = ['10:00', '11:30', '14:00', '16:30'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...slow, delay: 0.16 }}
      className="mx-auto w-full max-w-xl"
    >
      <div className="relative rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/70">
        <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute -right-8 bottom-6 h-28 w-28 rounded-full bg-violet-100 blur-3xl" />

        <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-950 p-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">запись клиента</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Стрижка и уход</h3>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">30 мин</span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {slots.map((slot, index) => (
              <motion.button
                key={slot}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.32 + index * 0.06 }}
                className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  index === 2 ? 'bg-white text-slate-950' : 'bg-white/[0.08] text-slate-300 ring-1 ring-white/10 hover:bg-white/[0.12]'
                }`}
              >
                {slot}
              </motion.button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-white p-4 text-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Выбрано</p>
                <p className="mt-1 text-lg font-semibold">Сегодня, 14:00</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">готово</span>
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold">А</div>
              <div>
                <p className="text-sm font-semibold">Алексей, мастер</p>
                <p className="text-xs text-slate-500">свободен в выбранное время</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-[#fbfbfc] pt-28 sm:pt-32 lg:pt-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.14),transparent_48%)]" />
      <Container className="relative pb-20 sm:pb-24 lg:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...slow, delay: 0.04 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Онлайн-запись без лишнего шума
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...slow, delay: 0.1 }}
            className="mt-8 text-5xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl"
          >
            Запись клиентов, которая выглядит спокойно и работает быстро
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...slow, delay: 0.18 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600"
          >
            КликБук помогает бизнесу принимать бронирования онлайн, управлять расписанием и видеть клиентов в одном минималистичном интерфейсе.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...slow, delay: 0.26 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button>Начать бесплатно</Button>
            <Button href="#product" muted>
              Посмотреть интерфейс
            </Button>
          </motion.div>
        </div>

        <div className="mt-16">
          <MiniBooking />
        </div>

        <Reveal className="mx-auto mt-14 grid max-w-4xl grid-cols-1 divide-y divide-slate-200 rounded-[2rem] border border-slate-200 bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ['5 минут', 'на запуск первой страницы'],
            ['24/7', 'прием заявок без звонков'],
            ['1 окно', 'для расписания и клиентов'],
          ].map(([value, label]) => (
            <div key={value} className="p-6 text-center">
              <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">{kicker}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">{title}</h2>
      {text ? <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">{text}</p> : null}
    </Reveal>
  );
}

function Product() {
  return (
    <section id="product" className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">продукт</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Один экран, где видно главное
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Минимальный dashboard показывает день без визуального шума: кто записан, когда свободно, какой статус у заявки и что нужно сделать дальше.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Календарь записей', 'Статусы заявок', 'Карточки клиентов', 'Статистика дня'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <Check className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[2rem] border border-slate-200 bg-[#fbfbfc] p-4 shadow-xl shadow-slate-200/60">
              <div className="rounded-[1.5rem] bg-white p-5">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Сегодня</p>
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950">18 июня</h3>
                  </div>
                  <div className="flex gap-2">
                    {['День', 'Неделя'].map((item, index) => (
                      <span key={item} className={`rounded-full px-4 py-2 text-sm font-medium ${index === 0 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ['09:30', 'Консультация', 'Наталья', 'Подтверждена'],
                    ['12:00', 'Стрижка', 'Артем', 'Ожидает'],
                    ['15:30', 'Маникюр', 'Виктория', 'Новая'],
                  ].map(([time, service, client, status], index) => (
                    <motion.div
                      key={`${time}-${client}`}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center"
                    >
                      <span className="text-sm font-semibold text-slate-500">{time}</span>
                      <div>
                        <p className="font-semibold text-slate-950">{service}</p>
                        <p className="text-sm text-slate-500">{client}</p>
                      </div>
                      <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{status}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ['24', 'записи'],
                    ['7', 'новых'],
                    ['82%', 'загрузка'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-2xl font-semibold text-slate-950">{value}</p>
                      <p className="text-sm text-slate-500">{label}</p>
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

function Features() {
  return (
    <section id="features" className="bg-[#fbfbfc] py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionTitle
          kicker="возможности"
          title="Все нужное — без лишнего интерфейса"
          text="Новый лендинг сделан в более минималистичной логике: меньше декоративности, больше воздуха, аккуратные акценты и плавные появления."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 0.035}>
                <div className="group h-full rounded-[1.75rem] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70">
                  <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-950 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-950">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function Audience() {
  return (
    <section id="audience" className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionTitle
          kicker="сценарии"
          title="Для бизнеса, который живет по расписанию"
          text="КликБук подходит тем, кто продает услуги по времени и хочет сделать запись понятной для клиента."
        />

        <Reveal className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audienceCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-slate-700">{item.title}</span>
              </div>
            );
          })}
        </Reveal>
      </Container>
    </section>
  );
}

function Workflow() {
  return (
    <section className="bg-slate-950 py-20 text-white sm:py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">как работает</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Плавный путь от настройки до записи</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Сервис не требует сложного внедрения. Вы задаете правила, а клиент получает понятный путь бронирования.
            </p>
          </Reveal>

          <div className="space-y-3">
            {timeline.map(([number, title, text], index) => (
              <Reveal key={number} delay={index * 0.06}>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.07]">
                  <div className="flex gap-5">
                    <span className="font-mono text-sm text-blue-300">{number}</span>
                    <div>
                      <h3 className="font-semibold text-white">{title}</h3>
                      <p className="mt-1 leading-7 text-slate-400">{text}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-[#fbfbfc] py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionTitle
          kicker="тарифы"
          title="Простые планы без сложной математики"
          text="Цены можно заменить на реальные перед запуском. Сейчас блок выглядит как аккуратная SaaS-сетка тарифов."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 0.06}>
              <div
                className={`relative h-full rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1 ${
                  plan.accent
                    ? 'border-slate-950 bg-slate-950 text-white shadow-2xl shadow-slate-900/20'
                    : 'border-slate-200 bg-white text-slate-950 shadow-sm shadow-slate-100'
                }`}
              >
                {plan.accent ? <span className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">популярный</span> : null}
                <p className={`text-sm font-medium ${plan.accent ? 'text-slate-300' : 'text-slate-500'}`}>{plan.caption}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">{plan.name}</h3>
                <div className="mt-8 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.05em]">{plan.price}</span>
                  <span className={`pb-2 text-sm ${plan.accent ? 'text-slate-400' : 'text-slate-500'}`}>/ месяц</span>
                </div>
                <p className={`mt-5 min-h-[56px] leading-7 ${plan.accent ? 'text-slate-300' : 'text-slate-600'}`}>{plan.description}</p>
                <div className="mt-7 space-y-3">
                  {plan.items.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${plan.accent ? 'bg-white text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className={`text-sm font-medium ${plan.accent ? 'text-slate-100' : 'text-slate-700'}`}>{item}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="#top"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    plan.accent ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-800'
                  }`}
                >
                  Выбрать тариф
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionTitle kicker="отзывы" title="Спокойнее для команды, проще для клиента" />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.06}>
              <figure className="h-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="flex gap-1 text-slate-950">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-6 leading-8 text-slate-700">“{item.text}”</blockquote>
                <figcaption className="mt-8 border-t border-slate-100 pt-5">
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FAQ() {
  const [active, setActive] = useState(0);

  return (
    <section id="faq" className="bg-[#fbfbfc] py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">faq</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Ответы на частые вопросы</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">Коротко о запуске, настройках, команде и уведомлениях.</p>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((item, index) => {
              const opened = active === index;
              return (
                <Reveal key={item.q} delay={index * 0.035}>
                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setActive(opened ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    >
                      <span className="font-semibold text-slate-950">{item.q}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${opened ? 'rotate-180' : ''}`} />
                    </button>
                    {opened ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="px-5 pb-5"
                      >
                        <p className="leading-7 text-slate-600">{item.a}</p>
                      </motion.div>
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#fbfbfc] px-6 py-14 text-center sm:px-10 lg:px-16 lg:py-20">
            <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-100 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Запустите онлайн-запись уже сегодня</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Создайте удобный способ бронирования для клиентов и освободите себя от лишних звонков.
              </p>
              <div className="mt-8">
                <Button>Начать бесплатно</Button>
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
    <footer className="border-t border-slate-200 bg-white py-10">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <Logo />
            <p className="mt-4 leading-7 text-slate-600">КликБук — минималистичный сервис онлайн-записи для бизнеса, команды и клиентов.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              ['Продукт', '#product'],
              ['Возможности', '#features'],
              ['Тарифы', '#pricing'],
              ['FAQ', '#faq'],
              ['Контакты', 'mailto:hello@clickbook.example'],
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950">
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-500">© 2026 КликБук. Все права защищены.</div>
      </Container>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen scroll-smooth bg-white font-sans text-slate-950 antialiased">
      <Header />
      <Hero />
      <Product />
      <Features />
      <Audience />
      <Workflow />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCta />
      <Footer />
    </main>
  );
}
