'use client';

import type { ComponentType, CSSProperties, ReactNode } from 'react';
import * as LucideIcons from 'lucide-react';
import { useTheme } from '../theme';
import { haptic } from '../bridge';
import { MiniBottomSheet } from './mini-bottom-sheet';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
  style?: CSSProperties;
};

function toPascalIconName(name: string) {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function Icon({ name, size = 18, color = 'currentColor', stroke = 1.8, style }: IconProps) {
  const iconName = toPascalIconName(name);
  const IconComp = (LucideIcons as unknown as Record<string, ComponentType<any>>)[iconName]
    ?? (LucideIcons as unknown as Record<string, ComponentType<any>>).Circle;
  return <IconComp size={size} color={color} strokeWidth={stroke} style={style} />;
}

export function Divider() {
  const { T } = useTheme();
  return <div style={{ height: 1, background: T.border, width: '100%' }} />;
}

export function Card({
  children,
  padded = true,
  style,
  onClick,
}: {
  children: ReactNode;
  padded?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const { T } = useTheme();
  return (
    <div
      onClick={onClick}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 18,
        boxShadow: T.cardShadow,
        padding: padded ? 18 : 0,
        overflow: 'hidden',
        color: T.text,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function FieldLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const { T } = useTheme();
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: T.text3,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  right,
  style,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  style?: CSSProperties;
}) {
  const { T } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, margin: '0 4px 10px', ...style }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: '-0.025em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: T.text3, marginTop: 4, lineHeight: 1.35 }}>{subtitle}</div>}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

export function Avatar({
  name,
  src,
  size = 40,
  radius = 14,
}: {
  name?: string;
  src?: string | null;
  size?: number;
  radius?: number;
}) {
  const { T, mode } = useTheme();
  const initials = (name || 'К')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'К';
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: radius,
      overflow: 'hidden',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,10,0.055)',
      border: `1px solid ${T.border}`,
      color: T.text,
      fontWeight: 800,
      fontSize: Math.max(11, Math.round(size * 0.32)),
      letterSpacing: '-0.04em',
    }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : initials}
    </div>
  );
}

export function NavBtn({
  icon,
  onClick,
  children,
  style,
}: {
  icon?: string;
  onClick?: () => void;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const { T, mode } = useTheme();
  return (
    <button
      type="button"
      onClick={() => { haptic('light'); onClick?.(); }}
      style={{
        width: children ? 'auto' : 40,
        height: 40,
        minWidth: 40,
        borderRadius: 13,
        border: `1px solid ${T.border}`,
        background: mode === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.72)',
        color: T.text2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: children ? '0 12px' : 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  );
}

export function NeutralBtn({
  icon,
  children,
  onClick,
  full,
  disabled,
  style,
}: {
  icon?: string;
  children: ReactNode;
  onClick?: () => void;
  full?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const { T } = useTheme();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { if (!disabled) { haptic('light'); onClick?.(); } }}
      style={{
        width: full ? '100%' : 'auto',
        border: `1px solid ${T.border}`,
        background: T.cardElev,
        color: disabled ? T.text3 : T.text,
        borderRadius: 14,
        padding: '11px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 650,
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '28px 18px', textAlign: 'center', color: T.text2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {icon && <div style={{ width: 42, height: 42, borderRadius: 16, background: T.cardElev, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text3 }}><Icon name={icon} size={18} /></div>}
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>{title}</div>
      {text && <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.45, maxWidth: 260 }}>{text}</div>}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { T, mode } = useTheme();
  return (
    <div style={{
      minHeight: 44,
      borderRadius: 15,
      background: mode === 'dark' ? 'rgba(255,255,255,0.055)' : 'rgba(10,10,10,0.035)',
      border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,10,0.06)'}`,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 13px',
      color: T.text3,
    }}>
      <Icon name="search" size={16} />
      <input
        className="cb-mini-transparent cb-mini-input-reset"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          minWidth: 0,
          border: 0,
          outline: 0,
          background: 'transparent',
          color: T.text,
          WebkitTextFillColor: T.text,
          fontSize: 14,
          fontFamily: 'inherit',
        }}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} style={{ border: 0, background: 'transparent', color: T.text3, display: 'flex', padding: 0, cursor: 'pointer' }}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}

export function ScreenHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: ReactNode }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      {onBack && <NavBtn icon="chevron-left" onClick={onBack} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: '-0.03em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: T.text3, marginTop: 3, lineHeight: 1.35 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

export function ChannelTag({ channel }: { channel?: string }) {
  const { T } = useTheme();
  const text = channel || '—';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 18,
      padding: '2px 7px',
      borderRadius: 999,
      background: T.cardElev,
      border: `1px solid ${T.border}`,
      color: T.text3,
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}

export function Pill({
  children,
  active,
  onClick,
  style,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  const { T } = useTheme();
  return (
    <button
      type="button"
      onClick={() => { haptic('light'); onClick?.(); }}
      style={{
        border: `1px solid ${active ? T.accent : T.border}`,
        background: active ? T.accent : T.cardElev,
        color: active ? '#fff' : T.text2,
        borderRadius: 999,
        padding: '7px 11px',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  const { T } = useTheme();
  return (
    <button
      type="button"
      onClick={() => { haptic('light'); onChange(!on); }}
      style={{
        width: 46,
        height: 28,
        borderRadius: 999,
        border: `1px solid ${on ? T.accent : T.border}`,
        background: on ? T.accent : T.cardElev,
        padding: 3,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: on ? 'flex-end' : 'flex-start',
        transition: 'background 0.18s ease, border-color 0.18s ease',
      }}
    >
      <span style={{ width: 20, height: 20, borderRadius: 999, background: '#fff', display: 'block', boxShadow: '0 2px 6px rgba(0,0,0,0.16)' }} />
    </button>
  );
}

export function StatusDot({ status }: { status?: string }) {
  const { T } = useTheme();
  const color = status === 'completed' || status === 'confirmed' ? T.success
    : status === 'cancelled' || status === 'no_show' ? T.danger
    : status === 'in-focus' ? T.accent
    : T.warn;
  return <span style={{ width: 10, height: 10, borderRadius: 999, background: color, display: 'inline-block', boxShadow: `0 0 0 4px ${color}22` }} />;
}

export function ListRow({
  icon,
  label,
  sub,
  danger,
  accent,
  onClick,
}: {
  icon?: string;
  label: string;
  sub?: string;
  danger?: boolean;
  accent?: boolean;
  onClick?: () => void;
}) {
  const { T } = useTheme();
  const color = danger ? T.danger : accent ? T.accent : T.text;
  return (
    <button
      type="button"
      onClick={() => { haptic(danger ? 'warning' : 'light'); onClick?.(); }}
      style={{
        width: '100%',
        border: 0,
        background: 'transparent',
        color,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'inherit',
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {icon && <div style={{ width: 34, height: 34, borderRadius: 12, background: accent ? T.accentSoft : T.cardElev, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}><Icon name={icon} size={16} /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      <Icon name="chevron-right" size={15} color={T.text3} />
    </button>
  );
}

export type ActionSheetAction = {
  id: string;
  label: string;
  sub?: string;
  icon?: string;
  tone?: 'primary' | 'danger' | 'success' | 'default' | string;
  onClick: () => void;
};

export function ActionSheet({
  open,
  onClose,
  title,
  subtitle,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: ReactNode;
  actions: ActionSheetAction[];
}) {
  const { T } = useTheme();
  return (
    <MiniBottomSheet open={open} onClose={onClose} maxHeight="min(70vh, 460px)" tail>
      <div style={{ padding: '18px 18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div style={{ minWidth: 0 }}>
            {title && <div style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: '-0.025em' }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 12, color: T.text3, marginTop: 5, lineHeight: 1.45 }}>{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 11, border: `1px solid ${T.border}`, background: T.cardElev, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
            <Icon name="x" size={15} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {actions.map((action) => {
            const danger = action.tone === 'danger';
            const primary = action.tone === 'primary';
            return (
              <button
                type="button"
                key={action.id}
                onClick={() => { haptic(danger ? 'warning' : 'light'); action.onClick(); }}
                style={{
                  width: '100%',
                  borderRadius: 15,
                  border: `1px solid ${danger ? 'rgba(239,68,68,0.28)' : primary ? T.accent : T.border}`,
                  background: danger ? 'rgba(239,68,68,0.12)' : primary ? T.accent : T.cardElev,
                  color: danger ? T.danger : primary ? '#fff' : T.text,
                  padding: '13px 14px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left',
                }}
              >
                {action.icon && <Icon name={action.icon} size={17} />}
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 750 }}>{action.label}</span>
                  {action.sub && <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: primary ? 'rgba(255,255,255,0.75)' : T.text3 }}>{action.sub}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </MiniBottomSheet>
  );
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  const { T } = useTheme();
  return (
    <MiniBottomSheet open={open} onClose={onClose} maxHeight="min(78vh, 680px)" tail>
      <div style={{ padding: '18px 0 20px' }}>
        {(title || subtitle) && (
          <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              {title && <div style={{ fontSize: 18, color: T.text, fontWeight: 800, letterSpacing: '-0.025em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>}
              {subtitle && <div style={{ fontSize: 12, color: T.text3, marginTop: 5, lineHeight: 1.45 }}>{subtitle}</div>}
            </div>
            <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 11, border: `1px solid ${T.border}`, background: T.cardElev, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
              <Icon name="x" size={15} />
            </button>
          </div>
        )}
        <div style={{ maxHeight: 'calc(min(78vh, 680px) - 72px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
      </div>
    </MiniBottomSheet>
  );
}
