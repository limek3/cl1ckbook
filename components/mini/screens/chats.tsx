'use client';

import { Fragment, useEffect, useRef, useMemo, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, Divider, Avatar, ChannelTag, Icon, NavBtn, ScreenHeader,
} from '../primitives/atoms';
import type { Thread, Message } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';

// ─── Chats list ──────────────────────────────
export function ChatsScreen({ openThread, back }: { openThread: (t: Thread) => void; back: () => void }) {
  const { T } = useTheme();
  const { THREADS, isLoading } = useMiniData();
  const [q, setQ] = useState('');
  const filtered = useMemo(
    () => THREADS.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())),
    [q, THREADS],
  );
  const unreadTotal = THREADS.reduce((a, t) => a + t.unread, 0);

  return (
    <div>
      <ScreenHeader title="Чаты" subtitle={isLoading ? 'Загрузка...' : `${THREADS.length} переписок · ${unreadTotal} непрочитанных`} onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SearchInput value={q} onChange={setQ} placeholder="Поиск по чатам" />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#999', fontSize: 13 }}>Загрузка чатов…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#999', fontSize: 13 }}>
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

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
      boxShadow: T.cardShadow, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <Icon name="search" size={16} color={T.text3} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14, fontFamily: 'inherit' }} />
    </div>
  );
}

function ThreadRow({ thread, onClick }: { thread: Thread; onClick: () => void }) {
  const { T } = useTheme();
  return (
    <div onClick={onClick} style={{
      padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
    }}>
      <div style={{ position: 'relative' }}>
        <Avatar name={thread.name} size={40} radius={20} />
        {thread.online && (
          <span style={{
            position: 'absolute', right: -1, bottom: -1, width: 10, height: 10, borderRadius: '50%',
            background: T.success, border: `2px solid ${T.card}`,
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 14, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{thread.name}</span>
          <ChannelTag channel={thread.channel} />
        </div>
        <div style={{ fontSize: 12, color: T.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{thread.last}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums' }}>{thread.time}</span>
        {thread.unread > 0 ? (
          <span style={{
            minWidth: 18, height: 18, padding: '0 6px', borderRadius: 9,
            background: T.accent, color: '#fff',
            fontSize: 10, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{thread.unread}</span>
        ) : <span style={{ width: 18, height: 18 }} />}
      </div>
    </div>
  );
}

// ─── Chat thread ─────────────────────────────
export function ChatThreadScreen({ thread, back }: { thread: Thread; back: () => void }) {
  const { T } = useTheme();
  const { TEMPLATES } = useMiniData();
  const [draft, setDraft] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>(thread.messages ?? []);
  const [showTemplates, setShowTemplates] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Sync if thread messages updated from outside
  useEffect(() => {
    setLocalMessages(thread.messages ?? []);
  }, [thread.id]);

  function sendDraft() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    setLocalMessages((prev) => [...prev, { from: 'me', text, t: now }]);
    setDraft('');
    setShowTemplates(false);
    // POST to API (fire-and-forget)
    fetch('/api/chats', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'message', threadId: thread.id, body: text, author: 'master' }),
    }).catch(() => {});
  }

  function applyTemplate(body: string) {
    // Replace basic placeholders
    const filled = body.replace(/\{имя\}/g, thread.name.split(' ')[0] ?? thread.name);
    setDraft(filled);
    setShowTemplates(false);
    inputRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendDraft();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: `1px solid ${T.border}`, background: T.bg, flexShrink: 0,
      }}>
        <NavBtn icon="chevron-left" onClick={back} />
        <Avatar name={thread.name} size={36} radius={18} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{thread.name}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>через {thread.channel} · был(а) недавно</div>
        </div>
        {/* Phone + info buttons */}
        <NavBtn icon="phone" />
        <NavBtn icon="info" />
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'center', fontSize: 10, color: T.text3, padding: '4px 10px', background: T.card, borderRadius: 999, marginBottom: 8 }}>
          Сегодня
        </div>
        {localMessages.length === 0 ? (
          <div style={{ alignSelf: 'center', fontSize: 12, color: T.text3, marginTop: 40 }}>Нет сообщений</div>
        ) : (
          localMessages.map((m, i) => <Bubble key={i} m={m} />)
        )}
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick templates panel ── */}
      {showTemplates && TEMPLATES.length > 0 && (
        <div style={{
          borderTop: `1px solid ${T.border}`, background: T.card,
          padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 8,
          maxHeight: 160, overflowY: 'auto', flexShrink: 0,
        }}>
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl.body)}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: T.bg, border: `1px solid ${T.border}`, color: T.text2,
                fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              {tpl.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Fallback quick replies when no custom templates ── */}
      {showTemplates && TEMPLATES.length === 0 && (
        <div style={{
          borderTop: `1px solid ${T.border}`, background: T.card,
          padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 8,
          flexShrink: 0,
        }}>
          {[
            { label: 'Подтверждение', body: `Здравствуйте, ${thread.name.split(' ')[0]}! Подтверждаю вашу запись. До встречи!` },
            { label: 'Напоминание', body: `Напоминаю про визит завтра. Если планы изменились — напишите, перенесём.` },
            { label: 'Благодарность', body: `Спасибо, что были у меня! Буду рада видеть вас снова 🙏` },
            { label: 'Перенос', body: `К сожалению, мне нужно перенести нашу встречу. Когда вам удобно?` },
          ].map((q) => (
            <button
              key={q.label}
              onClick={() => { setDraft(q.body); setShowTemplates(false); inputRef.current?.focus(); }}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: T.bg, border: `1px solid ${T.border}`, color: T.text2,
                fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={{
        padding: '10px 12px 14px', borderTop: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: T.bg,
      }}>
        {/* Templates toggle */}
        <button
          onClick={() => setShowTemplates((v) => !v)}
          style={{
            width: 38, height: 38, borderRadius: 12,
            background: showTemplates ? T.accent : 'transparent',
            border: `1px solid ${showTemplates ? T.accent : T.border}`,
            color: showTemplates ? '#fff' : T.text2,
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="zap" size={16} />
        </button>

        {/* Text input */}
        <div style={{
          flex: 1, background: T.inputBg, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center',
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
            <button
              onClick={() => setDraft('')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: T.text3, display: 'flex', marginLeft: 6 }}
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>

        {/* Send */}
        <button
          onClick={sendDraft}
          disabled={!draft.trim()}
          style={{
            width: 38, height: 38, borderRadius: 12,
            background: draft.trim() ? T.accent : T.border,
            border: 'none', color: '#fff', cursor: draft.trim() ? 'pointer' : 'default',
            padding: 0, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          <Icon name="send" size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: Message }) {
  const { T } = useTheme();
  const me = m.from === 'me';
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '78%', padding: '10px 14px', borderRadius: 14,
        borderTopRightRadius: me ? 4 : 14,
        borderTopLeftRadius: me ? 14 : 4,
        background: me ? T.accent : T.msgIn,
        color: me ? '#fff' : T.text,
        fontSize: 13, lineHeight: 1.4,
      }}>
        <div>{m.text}</div>
        <div style={{
          fontSize: 9, opacity: 0.65, marginTop: 4,
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
