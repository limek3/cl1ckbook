'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Calendar, CheckCircle2, ImageIcon, MessageSquare, Send, Shield, Sparkles, Users } from 'lucide-react';

import { TelegramLoginButton } from '@/components/auth/telegram-login-button';
import { VkLoginButton } from '@/components/auth/vk-login-button';
import { KbBrand } from '@/components/klikbook/shell';
import {
  KbButton,
  KbCard,
  KbDisplay,
  KbDivider,
  KbEyebrow,
  KbIconTile,
} from '@/components/klikbook/primitives';

const STEPS = [
  { num: 1, title: 'Название салона и логотип', icon: ImageIcon, tone: 'peach' as const },
  { num: 2, title: 'Добавьте первую услугу', icon: Sparkles, tone: 'lavender' as const },
  { num: 3, title: 'Настройте расписание', icon: Calendar, tone: 'sage' as const },
  { num: 4, title: 'Подключите Telegram', icon: Send, tone: 'sky' as const },
  { num: 5, title: 'Пригласите команду', icon: Users, tone: 'cream' as const },
];

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="klikbook-scope kb-shell flex min-h-screen flex-col">
      <header className="border-b border-[var(--kb-line)] bg-[var(--kb-bg-soft)]">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6">
          <KbBrand />
          <div className="flex items-center gap-3 text-[13px] text-[var(--kb-text-secondary)]">
            <Link href="/about" className="hover:text-[var(--kb-text)]">О платформе</Link>
            <Link href="/help" className="hover:text-[var(--kb-text)]">Помощь</Link>
            <Link href="/#contact" className="hover:text-[var(--kb-text)]">Контакты</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          {/* Left: auth */}
          <div className="flex flex-col">
            <KbEyebrow>Вход</KbEyebrow>
            <KbDisplay level={2} className="mt-3">
              Добро пожаловать
              <br />
              в <span className="italic">КликБук</span>
            </KbDisplay>
            <p className="mt-3 text-[14px] text-[var(--kb-text-secondary)]">
              Войдите в кабинет, чтобы управлять записями и развивать клиентскую базу.
            </p>

            <div className="mt-8 flex w-fit gap-1 rounded-[14px] border border-[var(--kb-border)] bg-white p-1">
              <button
                onClick={() => setTab('login')}
                className={`rounded-[10px] px-4 py-1.5 text-[13px] transition ${
                  tab === 'login' ? 'bg-[var(--kb-navy)] text-white' : 'text-[var(--kb-text-secondary)]'
                }`}
              >
                Вход
              </button>
              <button
                onClick={() => setTab('register')}
                className={`rounded-[10px] px-4 py-1.5 text-[13px] transition ${
                  tab === 'register' ? 'bg-[var(--kb-navy)] text-white' : 'text-[var(--kb-text-secondary)]'
                }`}
              >
                Регистрация
              </button>
            </div>

            <KbCard className="mt-6 p-6">
              <label className="block">
                <span className="kb-eyebrow mb-2 block">Email</span>
                <input className="kb-input kb-input-warm" placeholder="you@klikbook.ru" />
              </label>
              <label className="mt-4 block">
                <span className="kb-eyebrow mb-2 flex items-center justify-between">
                  <span>Пароль</span>
                  <Link href="/auth/reset" className="normal-case tracking-normal text-[var(--kb-coral)]">
                    Забыли пароль?
                  </Link>
                </span>
                <input className="kb-input kb-input-warm" type="password" placeholder="Минимум 8 символов" />
              </label>

              <label className="mt-4 flex items-center gap-2 text-[12px] text-[var(--kb-text-secondary)]">
                <input type="checkbox" className="rounded border-[var(--kb-border)]" />
                Запомнить меня
              </label>

              <KbButton variant="navy" className="mt-5 w-full">
                {tab === 'login' ? 'Войти' : 'Создать кабинет'}
              </KbButton>

              <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">
                <KbDivider className="flex-1" /> или <KbDivider className="flex-1" />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <TelegramLoginButton />
                <VkLoginButton />
                <button className="kb-btn kb-btn-outline w-full">
                  <span className="inline-block h-4 w-4 rounded-full bg-gradient-to-br from-[#EA4335] via-[#FBBC05] to-[#34A853]" />
                  Войти через Google
                </button>
              </div>

              <p className="mt-5 text-center text-[11px] leading-relaxed text-[var(--kb-text-muted)]">
                Продолжая, вы соглашаетесь с{' '}
                <Link href="/legal/terms" className="text-[var(--kb-text-secondary)] underline">
                  условиями использования
                </Link>{' '}
                и{' '}
                <Link href="/legal/privacy" className="text-[var(--kb-text-secondary)] underline">
                  политикой конфиденциальности
                </Link>
                .
              </p>
            </KbCard>
          </div>

          {/* Right: onboarding showcase */}
          <div className="flex flex-col gap-6">
            <KbCard className="overflow-hidden p-0">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,360px)]">
                <div className="p-8">
                  <KbEyebrow>Первый вход</KbEyebrow>
                  <KbDisplay level={2} className="mt-3">
                    Давайте настроим ваш салон<br />
                    <span className="italic">за несколько простых шагов</span>
                  </KbDisplay>
                  <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--kb-text-secondary)]">
                    Мы поможем вам запустить онлайн-запись, добавить услуги и команду — обычно это занимает 5 минут.
                  </p>

                  <div className="mt-8 flex items-center gap-4 rounded-[20px] bg-[var(--kb-warm-surface)] p-5">
                    <KbIconTile tone="coral">
                      <Sparkles size={20} />
                    </KbIconTile>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium">Создайте свой первый салон</div>
                      <p className="mt-1 text-[12px] text-[var(--kb-text-secondary)]">
                        Базовая информация заполнится за 2 минуты.
                      </p>
                    </div>
                    <KbButton variant="primary" size="sm">
                      Создать салон <ArrowRight size={14} />
                    </KbButton>
                  </div>
                </div>
                <div className="hidden bg-gradient-to-br from-[#FFE9DC] via-[#FFF6EF] to-[#FFFBF7] lg:block">
                  <div className="relative h-full min-h-[280px]">
                    <div className="absolute inset-6 rounded-[24px] bg-white/70 backdrop-blur" />
                    <div className="absolute right-10 top-12 h-24 w-24 rounded-full bg-gradient-to-br from-[#FFC09F] to-[#FF8B6B]" />
                    <div className="absolute bottom-12 left-10 h-16 w-16 rounded-full bg-gradient-to-br from-[#E0CCFF] to-[#A48EFF]" />
                  </div>
                </div>
              </div>

              <ul className="divide-y divide-[var(--kb-line)] border-t border-[var(--kb-line)]">
                {STEPS.map((step) => (
                  <li key={step.num} className="flex items-center gap-4 px-8 py-4">
                    <span className="kb-metric w-6 text-[14px] text-[var(--kb-text-muted)]">{step.num}</span>
                    <KbIconTile tone={step.tone} size={36}>
                      <step.icon size={16} />
                    </KbIconTile>
                    <div className="flex-1 text-[13px] font-medium">{step.title}</div>
                    <ArrowRight size={14} className="text-[var(--kb-text-muted)]" />
                  </li>
                ))}
              </ul>
            </KbCard>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FeatureMini icon={<Sparkles size={18} />} tone="cream" title="Быстрый старт" text="3 шага до первой записи" />
              <FeatureMini icon={<Shield size={18} />} tone="sage" title="Данные защищены" text="Шифрование и резерв" />
              <FeatureMini icon={<MessageSquare size={18} />} tone="lavender" title="Поддержка 24/7" text="Чат и Telegram" />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--kb-line)] bg-[var(--kb-bg-soft)]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-6 py-4 text-[12px] text-[var(--kb-text-muted)]">
          <span>© КликБук, 2025</span>
          <div className="flex items-center gap-4">
            <Link href="/legal/terms">Условия</Link>
            <Link href="/legal/privacy">Конфиденциальность</Link>
            <Link href="/#contact">Связаться</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureMini({
  icon,
  tone,
  title,
  text,
}: {
  icon: React.ReactNode;
  tone: 'cream' | 'sage' | 'lavender' | 'peach' | 'sky' | 'coral';
  title: string;
  text: string;
}) {
  return (
    <div className="kb-card p-4">
      <KbIconTile tone={tone} size={36}>{icon}</KbIconTile>
      <div className="mt-3 text-[13px] font-medium">{title}</div>
      <div className="mt-1 text-[11px] text-[var(--kb-text-muted)]">{text}</div>
    </div>
  );
}
