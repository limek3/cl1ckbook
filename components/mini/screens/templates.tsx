'use client';

import { Fragment, useEffect, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, Divider, Icon, NeutralBtn, ScreenHeader, BottomSheet, FieldLabel,
} from '../primitives/atoms';
import { type Template } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';
import { useMiniToast } from '../bridge';

export function TemplatesScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const { TEMPLATES, updateSection } = useMiniData();
  const { show } = useMiniToast();
  const [edit, setEdit] = useState<Template | null>(null);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (edit) { setName(edit.name); setBody(edit.body); }
  }, [edit?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function persist(list: Template[]) {
    const ok = await updateSection('templates', list);
    if (!ok) show('Не удалось сохранить', 'error');
    return ok;
  }

  async function save() {
    if (!edit) return;
    const exists = TEMPLATES.some((t) => t.id === edit.id);
    const next = { ...edit, name: name.trim() || edit.name, body };
    const list = exists ? TEMPLATES.map((t) => (t.id === edit.id ? next : t)) : [...TEMPLATES, next];
    if (await persist(list)) show('Шаблон сохранён', 'success');
    setEdit(null);
  }

  async function remove() {
    if (!edit) return;
    if (typeof window !== 'undefined' && !window.confirm(`Удалить шаблон «${edit.name}»?`)) return;
    const list = TEMPLATES.filter((t) => t.id !== edit.id);
    if (await persist(list)) show('Удалено', 'success');
    setEdit(null);
  }

  function createNew() {
    const id = `tpl-${Date.now()}`;
    setEdit({ id, name: 'Новый шаблон', body: '' });
  }

  return (
    <div>
      <ScreenHeader title="Шаблоны" subtitle="Заготовки сообщений и приветствий." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <NeutralBtn icon="plus" full onClick={createNew}>Создать шаблон</NeutralBtn>
        {TEMPLATES.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: T.text3, fontSize: 13, border: `1px dashed ${T.border}`, borderRadius: 12 }}>
            Шаблонов пока нет
          </div>
        ) : (
          <Card padded={false}>
            {TEMPLATES.map((t, i) => (
              <Fragment key={t.id}>
                <div onClick={() => setEdit(t)} style={{ padding: '16px 20px', cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, color: T.text, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{t.name}</span>
                    <Icon name="chevron-right" size={14} color={T.text3} />
                  </div>
                  <div style={{
                    fontSize: 12, color: T.text2, lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  } as React.CSSProperties}>{t.body}</div>
                </div>
                {i < TEMPLATES.length - 1 && <Divider />}
              </Fragment>
            ))}
          </Card>
        )}
      </div>
      <BottomSheet open={!!edit} onClose={() => setEdit(null)} title={edit?.name}>
        {edit && (
          <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <FieldLabel>Название</FieldLabel>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%', marginTop: 8, padding: 12, fontSize: 14,
                  background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12,
                  color: T.text, fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
            <div>
              <FieldLabel>Текст</FieldLabel>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                style={{
                  width: '100%', marginTop: 8,
                  background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: 14, color: T.text, fontSize: 13, fontFamily: 'inherit', lineHeight: 1.5,
                  resize: 'vertical', outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['{имя}', '{дата}', '{время}', '{услуга}', '{ссылка}'].map((v) => (
                <button
                  key={v}
                  onClick={() => setBody((b) => b + (b.endsWith(' ') || b === '' ? '' : ' ') + v)}
                  style={{
                    fontSize: 11, padding: '6px 10px', borderRadius: 999,
                    border: `1px solid ${T.border}`, color: T.text2, fontFamily: 'monospace',
                    background: 'transparent', cursor: 'pointer',
                  }}
                >{v}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <NeutralBtn icon="check" full onClick={save}>Сохранить</NeutralBtn>
              <NeutralBtn icon="trash-2" full onClick={remove}>Удалить</NeutralBtn>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
