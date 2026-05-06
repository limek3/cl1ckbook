'use client';

import { Fragment, useEffect, useRef, useMemo, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, Divider, Avatar, ChannelTag, Icon, NavBtn, ScreenHeader,
} from '../primitives/atoms';
import type { Thread, Message } from '@/lib/mini-demo';
import { useChats } from '@/hooks/use-chats';
import { useMiniData } from '@/hooks/use-mini-data';

// ─── Helpers ────────────────────────────────────────────────
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
  { id: 'confirm',  name: 'Подтверждение', body: 'Здравствуйте, {{имя}}! Подтверждаю вашу запись на {{дата}}. До встречи!' },
  { id: 'remind',   name: 'Напоминание',   body: 'Напоминаю про визит {{дата}}. Если планы изменились — напишите, перенесём.' },
  { id: 'thanks',   name: 'Благодарность', body: 'Спасибо за визит, {{имя}}! Буду рада вас снова.' },
  { id: 'reschedule', name: 'Перенос',     body: 'Здравствуйте, {{имя}}. Нам нужно перенести встречу. Когда вам удобно?' },
];

// ─── Chats list ─────────────────────────────────────────────
export function ChatsScreen({ openThread, back }: { openThread: (t: Thread) => void; back: () => void }) {
  const { T } = useTheme();
  const { threads, loading } = useChats();
  const [q, setQ] = useState('');

  const filtered = useMemo(
    () => threads.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())),
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
        <SearchInput value={q} onChange={setQ} placeholder="Поиск по чатам" />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: T.text3, fontSize: 13 }}>
            Загрузка чатов…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: T.text3, fontSize: 13 }}>
            {q ? 'Ничего не найдено' : 'Нет переписок'}
          </div>
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

function SearchInput({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
      boxShadow: T.cardShadow, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <Icon name="search" size={16} color={T.text3} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14, fontFamily: 'inherit' }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: T.text3, display: 'flex' }}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}

function ThreadRow({ thread, onClick }: { thread: Thread; onClick: () => void }) {
  const { T } = useTheme();
  return (
    <div onClick={onClick} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={thread.name} size={40} radius={20} />
        {thread.unread > 0 && (
          <span style={{
            position: 'absolute', right: -2, top: -2, width: 10, height: 10, borderRadius: '50%',
            background: T.accent, border: `2px solid ${T.bg}`,
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          {thread.isPriority && <Icon name="star" size={11} color={T.accent} />}
          <span style={{ fontSize: 14, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
            {thread.name}
          </span>
          <ChannelTag channel={thread.channel} />
          {thread.segment === 'new' && (
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: `${T.accent}22`, color: T.accent, fontWeight: 600, letterSpacing: '0.04em' }}>
              NEW
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: T.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {thread.last || 'Нет сообщений'}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums' }}>{thread.time}</span>
        {thread.unread > 0 ? (
          <span style={{
            minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9,
            background: T.accent, color: '#fff',
            fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{thread.unread}</span>
        ) : <span style={{ width: 18 }} />}
      </div>
    </div>
  );
}

// ─── Chat thread ────────────────────────────────────────────
export function ChatThreadScreen({ thread: threadProp, back }: { thread: Thread; back: () => void }) {
  const { T } = useTheme();
  const { threads, markRead, sendMessage, deleteThread } = useChats();
  const { TEMPLATES: workspaceTemplates } = useMiniData();

  // Use live thread from hook, fallback to prop while loading
  const thread = threads.find((t) => String(t.id) === String(threadProp.id)) ?? threadProp;
  const messages: Message[] = thread.messages ?? [];

  const [draft, setDraft] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mark as read on mount
  useEffect(() => {
    if (thread.unread > 0) markRead(thread.id);
  }, [thread.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const templates = workspaceTemplates.length > 0 ? workspaceTemplates : FALLBACK_TEMPLATES;

  function applyTemplate(body: string) {
    setDraft(fillTemplate(body, thread));
    setShowTemplates(false);
    inputRef.current?.focus();
  }

  async function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setShowTemplates(false);
    await sendMessage(thread.id, text);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  async function handleDelete() {
    await deleteThread(thread.id);
    back();
  }

  // Next visit label
  const nextVisitLabel = thread.nextVisit
    ? new Date(`${thread.nextVisit}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${T.border}`, background: T.bg, flexShrink: 0,
      }}>
        <NavBtn icon="chevron-left" onClick={back} />
        <Avatar name={thread.name} size={36} radius={18} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: T.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {thread.name}
          </div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
            <ChannelTag channel={thread.channel} />
            {nextVisitLabel && <span>· {nextVisitLabel}</span>}
          </div>
        </div>
        {/* Phone button */}
        {thread.phone ? (
          <a href={`tel:${thread.phone}`} style={{ display: 'flex', color: T.text2, textDecoration: 'none' }}>
            <NavBtn icon="phone" />
          </a>
        ) : (
          <NavBtn icon="phone" />
        )}
        {/* Info toggle */}
        <button
          onClick={() => setShowInfo((v) => !v)}
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: showInfo ? T.accent : 'transparent',
            border: `1px solid ${showInfo ? T.accent : T.border}`,
            color: showInfo ? '#fff' : T.text2,
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="info" size={15} />
        </button>
        {/* Delete */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'transparent', border: `1px solid ${T.border}`,
            color: T.text3, cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="trash-2" size={14} />
        </button>
      </div>

      {/* ── Info panel ── */}
      {showInfo && (
        <div style={{
          padding: '10px 20px', background: T.cardElev ?? T.card,
          borderBottom: `1px solid ${T.border}`, flexShrink: 0,
          display: 'flex', flexWrap: 'wrap', gap: 16,
        }}>
          {thread.phone && (
            <InfoCell icon="phone" label="Телефон">
              <a href={`tel:${thread.phone}`} style={{ color: T.accent, textDecoration: 'none', fontSize: 13 }}>
                {thread.phone}
              </a>
            </InfoCell>
          )}
          <InfoCell icon="message-circle" label="Канал">
            <span style={{ fontSize: 13, color: T.text }}>{thread.channel}</span>
          </InfoCell>
          {nextVisitLabel && (
            <InfoCell icon="calendar" label="Ближайший визит">
              <span style={{ fontSize: 13, color: T.text }}>{nextVisitLabel}</span>
            </InfoCell>
          )}
          {thread.botConnected && (
            <InfoCell icon="bot" label="Бот">
              <span style={{ fontSize: 13, color: T.success ?? T.accent }}>Подключён</span>
            </InfoCell>
          )}
        </div>
      )}

      {/* ── Delete confirm ── */}
      {showDeleteConfirm && (
        <div style={{
          padding: '12px 20px', background: '#ff3b301a',
          borderBottom: `1px solid #ff3b3033`, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ flex: 1, fontSize: 13, color: T.text }}>Удалить переписку с {thread.name}?</span>
          <button
            onClick={handleDelete}
            style={{ padding: '6px 14px', borderRadius: 8, background: '#ff3b30', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Удалить
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            style={{ padding: '6px 14px', borderRadius: 8, background: T.card, border: `1px solid ${T.border}`, color: T.text2, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Отмена
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
            <Icon name="message-circle" size={32} color={T.text3} />
            <span style={{ fontSize: 13, color: T.text3 }}>Нет сообщений</span>
          </div>
        ) : (
          messages.map((m, i) => <Bubble key={i} m={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Templates panel ── */}
      {showTemplates && (
        <div style={{
          borderTop: `1px solid ${T.border}`, background: T.card,
          padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 8,
          maxHeight: 130, overflowY: 'auto', flexShrink: 0,
        }}>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl.body)}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: T.bg, border: `1px solid ${T.border}`, color: T.text2,
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'border-color 0.1s, color 0.1s',
              }}
            >
              {tpl.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={{
        padding: '8px 12px 16px', borderTop: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: T.bg,
      }}>
        {/* Templates toggle */}
        <button
          onClick={() => setShowTemplates((v) => !v)}
          title="Быстрые ответы"
          style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: showTemplates ? T.accent : 'transparent',
            border: `1px solid ${showTemplates ? T.accent : T.border}`,
            color: showTemplates ? '#fff' : T.text2,
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="zap" size={15} />
        </button>

        {/* Input */}
        <div style={{
          flex: 1, background: T.inputBg, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: '9px 12px',
          display: 'flex', alignItems: 'center', gap: 6,
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
            <button onClick={() => setDraft('')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: T.text3, display: 'flex' }}>
              <Icon name="x" size={13} />
            </button>
          )}
        </div>

        {/* Send */}
        <button
          onClick={send}
          disabled={!draft.trim()}
          style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: draft.trim() ? T.accent : T.border,
            border: 'none', color: '#fff',
            cursor: draft.trim() ? 'pointer' : 'default',
            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          <Icon name="send" size={15} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ─── Info cell ───────────────────────────────────────────────
function InfoCell({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
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

// ─── Bubble ──────────────────────────────────────────────────
function Bubble({ m }: { m: Message }) {
  const { T } = useTheme();
  const me = m.from === 'me';
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start' }}>
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
          {me && <Icon name="check-check" size={10} color={me ? 'rgba(255,255,255,0.8)' : T.text3} />}
        </div>
      </div>
    </div>
  );
}
