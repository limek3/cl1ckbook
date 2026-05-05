'use client';

import { Fragment, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, Divider, Icon, NeutralBtn, ScreenHeader, BottomSheet,
} from '../primitives/atoms';
import { type Template } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';

export function TemplatesScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const { TEMPLATES } = useMiniData();
  const [edit, setEdit] = useState<Template | null>(null);

  return (
    <div>
      <ScreenHeader title="Шаблоны" subtitle="Заготовки сообщений и приветствий." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <NeutralBtn icon="plus" full>Создать шаблон</NeutralBtn>
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
      </div>
      <BottomSheet open={!!edit} onClose={() => setEdit(null)} title={edit?.name}>
        {edit && (
          <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              defaultValue={edit.body}
              rows={6}
              style={{
                background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12,
                padding: 14, color: T.text, fontSize: 13, fontFamily: 'inherit', lineHeight: 1.5,
                resize: 'vertical', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['{имя}', '{дата}', '{время}', '{услуга}', '{ссылка}'].map((v) => (
                <span key={v} style={{
                  fontSize: 11, padding: '6px 10px', borderRadius: 999,
                  border: `1px solid ${T.border}`, color: T.text2, fontFamily: 'monospace',
                }}>{v}</span>
              ))}
            </div>
            <NeutralBtn icon="check" full>Сохранить</NeutralBtn>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
