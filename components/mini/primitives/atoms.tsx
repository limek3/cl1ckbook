'use client';

import { type CSSProperties, type ReactNode, Fragment } from 'react';
import * as L from 'lucide-react';
import { useTheme } from '../theme';

// ─── Icon: maps kebab-case (lucide CDN names) to lucide-react PascalCase ───
function toPascal(s: string): string {
  return s.split('-').map((w) => w[0]!.toUpperCase() + w.slice(1)).join('');
}

export function Icon({ name, size = 20, stroke = 1.5, color }: { name: string; size?: number; stroke?: number; color?: string }) {
  const Comp = (L as any)[toPascal(name)] as React.ComponentType<any> | undefined;
  if (!Comp) return null;
  return <Comp size={size} strokeWidth={stroke} color={color || 'currentColor'} />;
}

// ─── Card ───────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  padded?: boolean;
  onClick?: () => void;
}

export function Card({ children, style, padded = true, onClick }: CardProps) {
  const { T } = useTheme();
  return (
    <div onClick={onClick} style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: padded ? 20 : 0,
      boxShadow: T.cardShadow,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

// ─── FieldLabel ────────────────────────────────────────
export function FieldLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const { T } = useTheme();
  return (
    <div style={{
      fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: T.text3, ...style,
    }}>{children}</div>
  );
}

// ─── SectionTitle ──────────────────────────────────────
export function SectionTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const { T } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: T.text, letterSpacing: '-0.01em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ─── StatusDot ─────────────────────────────────────────
export function StatusDot({ status }: { status: 'in-focus' | 'scheduled' | 'completed' | 'cancelled' | string }) {
  const { T } = useTheme();
  const color = status === 'in-focus' ? T.accent
    : status === 'completed' ? T.text3
    : status === 'cancelled' ? T.danger
    : 'rgba(18,125,254,0.55)';
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;
}

// ─── Divider ───────────────────────────────────────────
export function Divider() {
  const { T } = useTheme();
  return <div style={{ height: 1, background: T.border, width: '100%' }} />;
}

// ─── Avatar ────────────────────────────────────────────
export function Avatar({ name, size = 36, radius = 10 }: { name: string; size?: number; radius?: number }) {
  const { T } = useTheme();
  const initials = (name || '').split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: T.cardElev,
      border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, color: T.text2, fontWeight: 500, flexShrink: 0,
      letterSpacing: '0.02em',
    }}>{initials}</div>
  );
}

// ─── Toggle ────────────────────────────────────────────
export function Toggle({ on, onChange, size = 'md' }: { on: boolean; onChange: (next: boolean) => void; size?: 'sm' | 'md' }) {
  const { T } = useTheme();
  const w = size === 'sm' ? 36 : 42;
  const h = size === 'sm' ? 22 : 26;
  const knob = h - 6;
  return (
    <button onClick={() => onChange(!on)} style={{
      width: w, height: h, borderRadius: 999,
      background: on ? T.accent : T.cardElev,
      border: `1px solid ${on ? T.accent : T.borderStrong}`,
      position: 'relative', cursor: 'pointer', padding: 0,
      transition: 'background 0.15s, border-color 0.15s',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? w - knob - 4 : 2,
        width: knob, height: knob, borderRadius: '50%',
        background: on ? '#fff' : T.text2,
        transition: 'left 0.15s',
      }} />
    </button>
  );
}

// ─── Pill ──────────────────────────────────────────────
export function Pill({ children, active, onClick, accent }: { children: ReactNode; active?: boolean; onClick?: () => void; accent?: boolean }) {
  const { T } = useTheme();
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 999,
      background: active ? (accent ? T.accent : T.cardElev) : 'transparent',
      border: `1px solid ${active ? (accent ? T.accent : T.borderStrong) : T.border}`,
      color: active ? (accent ? '#fff' : T.text) : T.text2,
      fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
      whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}

// ─── NavBtn ────────────────────────────────────────────
export function NavBtn({ icon, onClick, label }: { icon: string; onClick?: () => void; label?: string }) {
  const { T } = useTheme();
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: 40, height: 40, borderRadius: 12, background: T.card,
      border: `1px solid ${T.border}`, color: T.text2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
    }}>
      <Icon name={icon} size={18} />
    </button>
  );
}

// ─── NeutralBtn ───────────────────────────────────────
interface NeutralBtnProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: string;
  full?: boolean;
  style?: CSSProperties;
}

export function NeutralBtn({ children, onClick, icon, full, style }: NeutralBtnProps) {
  const { T } = useTheme();
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: `1px solid ${T.borderStrong}`, borderRadius: 12,
      padding: '12px 16px', color: T.text, fontSize: 13, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: full ? '100%' : undefined,
      fontFamily: 'inherit', ...style,
    }}>
      {icon && <Icon name={icon} size={14} stroke={1.75} />}
      {children}
    </button>
  );
}

// ─── ChannelTag ────────────────────────────────────────
export function ChannelTag({ channel }: { channel: string }) {
  const { T } = useTheme();
  return (
    <span style={{
      fontSize: 9, padding: '2px 6px', borderRadius: 4,
      border: `1px solid ${T.border}`, color: T.text3,
      letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500,
    }}>{channel}</span>
  );
}

// ─── ListRow ───────────────────────────────────────────
interface ListRowProps {
  icon?: string;
  label: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  accent?: boolean;
}

export function ListRow({ icon, label, sub, right, onClick, danger, accent }: ListRowProps) {
  const { T } = useTheme();
  return (
    <div onClick={onClick} style={{
      padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {icon && (
        <div style={{ color: danger ? T.danger : T.text2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20 }}>
          <Icon name={icon} size={18} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: danger ? T.danger : T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
          {label}
          {accent && <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.accent }} />}
        </div>
        {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{sub}</div>}
      </div>
      {right !== undefined ? right : (onClick && <Icon name="chevron-right" size={16} color={T.text3} />)}
    </div>
  );
}

// ─── ScreenHeader ──────────────────────────────────────
export function ScreenHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: ReactNode }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {onBack ? <NavBtn icon="chevron-left" onClick={onBack} /> : <span />}
        {right || <span />}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: T.text2, marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ─── BottomSheet ───────────────────────────────────────
export function BottomSheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  const { T } = useTheme();
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: T.overlayBg }} />
      <div style={{
        position: 'relative', width: '100%', background: T.sheetBg,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        borderTop: `1px solid ${T.border}`,
        maxHeight: '88%', overflow: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div onClick={onClose} style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.borderStrong }} />
        </div>
        {title && (
          <div style={{ padding: '4px 20px 8px', fontSize: 14, fontWeight: 500, color: T.text }}>{title}</div>
        )}
        <div style={{ padding: '4px 0 20px' }}>{children}</div>
      </div>
    </div>
  );
}

export { Fragment };
