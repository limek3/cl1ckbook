'use client';

import { type KeyboardEvent, type ReactNode, Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../theme';
import {
  ActionSheet, Avatar, BottomSheet, Card, ChannelTag, Divider, EmptyState, Icon, NavBtn, NeutralBtn, ScreenHeader, SearchBox,
} from '../primitives/atoms';
import { haptic, selectionHaptic } from '../bridge';
import type { Message, Thread } from '@/lib/mini-demo';
import { useChats } from '@/hooks/use-chats';
import { useMiniData } from '@/hooks/use-mini-data';

function fillTemplate(body: string, thread: Thread): string {
  const firstName = thread.name.split(' ')[0] ?? thread.name;
  const visitDate = thread.nextVisit
    ? new Date(`${thread.nextVisit}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : 'ближайшую дату';
  return body
    .replaceAll('{{имя}}', firstName).replaceAll('{имя}', firstName)
    .replaceAll('{{дата}}', visitDate).replaceAll('{дата}', visitDate)
    .replaceAll('{{время}}', 'удобное время').replaceAll('{время}', 'удобное время')
    .replaceAll('{{услуга}}', 'визит').replaceAll('{услуга}', 'визит')
    .replaceAll('{{ссылка}}', '').replaceAll('{ссылка}', '');
}

const FALLBACK_TEMPLATES = [
  { id: 'confirm', name: 'Подтверждение', body: 'Здравствуйте, {{имя}}! Подтверждаю вашу запись на {{дата}}. До встречи!' },
  { id: 'remind', name: 'Напоминание', body: 'Напоминаю про визит {{дата}}. Если планы изменились — напишите, перенесём.' },
  { id: 'thanks', name: 'Благодарность', body: 'Спасибо за визит, {{имя}}! Буду рада вас снова.' },
  { id: 'reschedule', name: 'Перенос', body: 'Здравствуйте, {{имя}}. Нам нужно перенести встречу. Когда вам удобно?' },
];

export function ChatsScreen({ openThread, back }: { openThread: (t: Thread) => void; back: () => void }) {
  const { threads, loading } = useChats();
  const [q, setQ] = useState('');

  const filtered = useMemo(
    () => threads.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) || String(t.phone ?? '').includes(q)),
    [q, threads],
  );
  const unreadTotal = threads.reduce((a, t) => a + t.unread, 0);

  return (
    <div>
      <ScreenHeader
        title="Чаты"
        subtitle={loading ? 'Загрузка…' : `${threads.length} переписок · ${unreadTotal} непрочитанных`}
        onBack={back}
      />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SearchBox value={q} onChange={setQ} placeholder="Поиск по чатам" />

        {loading ? (
          <EmptyState icon="loader-circle" title="Загружаем чаты" text="Подтягиваем переписки из реальных каналов." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={q ? 'search-x' : 'messages-square'}
            title={q ? 'Чаты не найдены' : 'Переписок пока нет'}
            text={q ? 'Попробуй изменить запрос.' : 'Новые диалоги появятся после сообщений из Telegram, ВК или формы записи.'}
          />
        ) : (
          <Card padded={false}>
            {filtered.map((t, i) => (
              <Fragment key={t.id}>
                <ThreadRow thread={t} onClick={() => openThread(t)} />
                {i < filtered.length - 1 && <Divider />}
              </Fragment>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function ThreadRow({ thread, onClick }: { thread: Thread; onClick: () => void }) {
  const { T } = useTheme();
  return (
    <div onClick={() => { haptic('light'); onClick(); }} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'background 0.14s ease' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={thread.name} size={40} radius={20} />
        {thread.unread > 0 && (
          <span style={{ position: 'absolute', right: -2, top: -2, width: 10, height: 10, borderRadius: '50%', background: T.accent, border: `2px solid ${T.bg}` }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          {thread.isPriority && <Icon name="star" size={11} color={T.accent} />}
          <span style={{ fontSize: 14, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{thread.name}</span>
          <ChannelTag channel={thread.channel} />
          {thread.segment === 'new' && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 999, background: `${T.accent}22`, color: T.accent, fontWeight: 600, letterSpacing: '0.04em' }}>NEW</span>}
        </div>
        <div style={{ fontSize: 12, color: T.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{thread.last || 'Нет сообщений'}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums' }}>{thread.time}</span>
        {thread.unread > 0 ? (
          <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: T.accent, color: '#fff', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{thread.unread}</span>
        ) : <span style={{ width: 18 }} />}
      </div>
    </div>
  );
}

export function ChatThreadScreen({ thread: threadProp, back }: { thread: Thread; back: () => void }) {
  const { T } = useTheme();
  const { threads, markRead, sendMessage, deleteThread } = useChats();
  const { TEMPLATES: workspaceTemplates } = useMiniData();

  const thread = threads.find((t) => String(t.id) === String(threadProp.id)) ?? threadProp;
  const messages: Message[] = thread.messages ?? [];
  const templates = workspaceTemplates.length > 0 ? workspaceTemplates : FALLBACK_TEMPLATES;

  const [draft, setDraft] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (thread.unread > 0) markRead(thread.id);
  }, [thread.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function applyTemplate(body: string) {
    selectionHaptic();
    setDraft(fillTemplate(body, thread));
    setShowTemplates(false);
    setTimeout(() => inputRef.current?.focus(), 40);
  }

  async function send() {
    const text = draft.trim();
    if (!text) return;
    haptic('medium');
    setDraft('');
    setShowTemplates(false);
    await sendMessage(thread.id, text);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
  }

  async function handleDelete() {
    haptic('warning');
    await deleteThread(thread.id);
    back();
  }

  const nextVisitLabel = thread.nextVisit
    ? new Date(`${thread.nextVisit}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${T.border}`, background: T.bg, flexShrink: 0,
      }}>
        <NavBtn icon="chevron-left" onClick={back} />
        <Avatar name={thread.name} size={36} radius={18} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: T.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.name}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
            <ChannelTag channel={thread.channel} />
            {nextVisitLabel && <span>· {nextVisitLabel}</span>}
          </div>
        </div>
        {thread.phone ? (
          <a href={`tel:${thread.phone}`} style={{ display: 'flex', color: T.text2, textDecoration: 'none' }}><NavBtn icon="phone" /></a>
        ) : <NavBtn icon="phone" />}
        <MiniIconButton active={showInfo} icon="info" onClick={() => setShowInfo((v) => !v)} />
        <MiniIconButton icon="trash-2" danger onClick={() => setShowDeleteConfirm(true)} />
      </div>

      {showInfo && (
        <div style={{
          padding: '12px 20px', background: T.cardElev,
          borderBottom: `1px solid ${T.border}`, flexShrink: 0,
          display: 'flex', flexWrap: 'wrap', gap: 16,
          animation: 'mini-scale-in 0.16s ease both',
        }}>
          {thread.phone && <InfoCell icon="phone" label="Телефон"><a href={`tel:${thread.phone}`} style={{ color: T.accent, textDecoration: 'none', fontSize: 13 }}>{thread.phone}</a></InfoCell>}
          <InfoCell icon="message-circle" label="Канал"><span style={{ fontSize: 13, color: T.text }}>{thread.channel}</span></InfoCell>
          {nextVisitLabel && <InfoCell icon="calendar" label="Ближайший визит"><span style={{ fontSize: 13, color: T.text }}>{nextVisitLabel}</span></InfoCell>}
          {thread.botConnected && <InfoCell icon="bot" label="Бот"><span style={{ fontSize: 13, color: T.success }}>Подключён</span></InfoCell>}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState icon="message-circle" title="Сообщений пока нет" text="Напиши первым или используй быстрый шаблон." />
          </div>
        ) : (
          messages.map((m, i) => <Bubble key={`${m.t}-${i}`} m={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '8px 12px 16px', borderTop: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: T.bg,
      }}>
        <button
          onClick={() => { haptic('light'); setShowTemplates(true); }}
          title="Быстрые ответы"
          style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: showTemplates ? T.accent : 'transparent',
            border: `1px solid ${showTemplates ? T.accent : T.border}`,
            color: showTemplates ? '#fff' : T.text2,
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s ease, border-color 0.15s ease',
          }}
        >
          <Icon name="zap" size={15} />
        </button>

        <div style={{
          flex: 1, background: T.inputBg, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: '9px 12px',
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'border-color 0.15s ease',
        }}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Сообщение"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14, fontFamily: 'inherit' }}
          />
          {draft.length > 0 && (
            <button onClick={() => { selectionHaptic(); setDraft(''); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: T.text3, display: 'flex' }}>
              <Icon name="x" size={13} />
            </button>
          )}
        </div>

        <button
          onClick={() => void send()}
          disabled={!draft.trim()}
          style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: draft.trim() ? T.accent : T.border,
            border: 'none', color: '#fff',
            cursor: draft.trim() ? 'pointer' : 'default',
            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s ease, opacity 0.15s ease',
          }}
        >
          <Icon name="send" size={15} color="#fff" />
        </button>
      </div>

      <BottomSheet open={showTemplates} onClose={() => setShowTemplates(false)} title="Быстрые ответы" subtitle="Выбери шаблон — текст подставится в поле сообщения.">
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {templates.length > 0 ? templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl.body)}
              style={{
                padding: '12px 14px', borderRadius: 14, fontSize: 13, cursor: 'pointer',
                background: T.cardElev, border: `1px solid ${T.border}`, color: T.text,
                fontFamily: 'inherit', textAlign: 'left', lineHeight: 1.35,
              }}
            >
              <span style={{ display: 'block', fontWeight: 500 }}>{tpl.name}</span>
              <span style={{ display: 'block', fontSize: 11, color: T.text3, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl.body}</span>
            </button>
          )) : <EmptyState icon="file-text" title="Шаблонов нет" text="Добавь шаблоны сообщений в разделе «Ещё»." />}
          <NeutralBtn full onClick={() => setShowTemplates(false)}>Закрыть</NeutralBtn>
        </div>
      </BottomSheet>

      <ActionSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Удалить переписку?"
        subtitle={`Чат с ${thread.name} исчезнет из списка, но записи клиента останутся.`}
        actions={[
          {
            id: 'delete-thread',
            label: 'Удалить переписку',
            sub: 'Это действие нельзя отменить из miniapp',
            icon: 'trash-2',
            tone: 'danger',
            onClick: () => { setShowDeleteConfirm(false); void handleDelete(); },
          },
        ]}
      />
    </div>
  );
}

function MiniIconButton({ icon, active, danger, onClick }: { icon: string; active?: boolean; danger?: boolean; onClick: () => void }) {
  const { T } = useTheme();
  return (
    <button
      onClick={() => { haptic(danger ? 'warning' : 'light'); onClick(); }}
      style={{
        width: 32, height: 32, borderRadius: 10,
        background: active ? T.accent : 'transparent',
        border: `1px solid ${active ? T.accent : danger ? 'rgba(239,68,68,0.24)' : T.border}`,
        color: active ? '#fff' : danger ? T.danger : T.text2,
        cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
      }}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

function InfoCell({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  const { T } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name={icon} size={11} color={T.text3} />
        <span style={{ fontSize: 10, color: T.text3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function Bubble({ m }: { m: Message }) {
  const { T } = useTheme();
  const me = m.from === 'me';
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', animation: 'mini-scale-in 0.16s ease both' }}>
      <div style={{
        maxWidth: '78%', padding: '9px 13px', borderRadius: 14,
        borderTopRightRadius: me ? 4 : 14,
        borderTopLeftRadius: me ? 14 : 4,
        background: me ? T.accent : T.msgIn,
        color: me ? '#fff' : T.text,
        fontSize: 13, lineHeight: 1.45,
      }}>
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</div>
        <div style={{
          fontSize: 9, opacity: 0.65, marginTop: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span>{m.t}</span>
          {me && <Icon name="check-check" size={10} color="rgba(255,255,255,0.8)" />}
        </div>
      </div>
    </div>
  );
}
