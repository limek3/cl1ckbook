'use client';

import { type ComponentType, type CSSProperties, type InputHTMLAttributes, type ReactNode, Fragment } from 'react';
import * as L from 'lucide-react';
import { useTheme } from '../theme';
import { haptic, selectionHaptic } from '../bridge';

function toPascal(s: string): string {
  return s.split('-').map((w) => w[0]!.toUpperCase() + w.slice(1)).join('');
}

function tap(kind: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' = 'light') {
  if (kind === 'selection') selectionHaptic();
  else haptic(kind);
}

export function Icon({ name, size = 20, stroke = 1.5, color }: { name: string; size?: number; stroke?: number; color?: string }) {
  const Comp = (L as any)[toPascal(name)] as ComponentType<any> | undefined;
  if (!Comp) return null;
  return <Comp size={size} strokeWidth={stroke} color={color || 'currentColor'} />;
}

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  padded?: boolean;
  onClick?: () => void;
}

export function Card({ children, style, padded = true, onClick }: CardProps) {
  const { T } = useTheme();
  return (
    <div
      onClick={onClick ? () => { tap('light'); onClick(); } : undefined}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: padded ? 20 : 0,
        boxShadow: T.cardShadow,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.14s ease, border-color 0.14s ease, background 0.14s ease, opacity 0.14s ease',
        ...style,
      }}
    >{children}</div>
  );
}

export function FieldLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const { T } = useTheme();
  return (
    <div style={{
      fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: T.text3, ...style,
    }}>{children}</div>
  );
}

export function SectionTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const { T } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px', gap: 12 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: T.text, letterSpacing: '-0.01em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

export function StatusDot({ status }: { status: 'in-focus' | 'scheduled' | 'completed' | 'cancelled' | string }) {
  const { T } = useTheme();
  const color = status === 'in-focus' ? T.accent
    : status === 'completed' ? T.success
    : status === 'cancelled' ? T.danger
    : 'rgba(18,125,254,0.55)';
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;
}

export function Divider() {
  const { T } = useTheme();
  return <div style={{ height: 1, background: T.border, width: '100%' }} />;
}

export function Avatar({ name, src, size = 36, radius = 10 }: { name: string; src?: string; size?: number; radius?: number }) {
  const { T } = useTheme();
  const initials = (name || '').split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: T.cardElev,
      border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, color: T.text2, fontWeight: 500, flexShrink: 0,
      letterSpacing: '0.02em', overflow: 'hidden',
      boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
    }}>
      {src ? (
        <img
          src={src}
          alt={name || 'avatar'}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : initials}
    </div>
  );
}

export function Toggle({ on, onChange, size = 'md' }: { on: boolean; onChange: (next: boolean) => void; size?: 'sm' | 'md' }) {
  const { T } = useTheme();
  const w = size === 'sm' ? 36 : 42;
  const h = size === 'sm' ? 22 : 26;
  const knob = h - 6;
  return (
    <button onClick={() => { tap('selection'); onChange(!on); }} style={{
      width: w, height: h, borderRadius: 999,
      background: on ? T.accent : T.cardElev,
      border: `1px solid ${on ? T.accent : T.borderStrong}`,
      position: 'relative', cursor: 'pointer', padding: 0,
      transition: 'background 0.16s ease, border-color 0.16s ease, transform 0.12s ease',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? w - knob - 4 : 2,
        width: knob, height: knob, borderRadius: '50%',
        background: on ? '#fff' : T.text2,
        boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
        transition: 'left 0.16s ease, background 0.16s ease',
      }} />
    </button>
  );
}

export function Pill({ children, active, onClick, accent }: { children: ReactNode; active?: boolean; onClick?: () => void; accent?: boolean }) {
  const { T } = useTheme();
  return (
    <button onClick={() => { tap('selection'); onClick?.(); }} style={{
      padding: '8px 14px', borderRadius: 999,
      background: active ? (accent ? T.accent : T.cardElev) : 'transparent',
      border: `1px solid ${active ? (accent ? T.accent : T.borderStrong) : T.border}`,
      color: active ? (accent ? '#fff' : T.text) : T.text2,
      fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.12s ease',
    }}>{children}</button>
  );
}

export function NavBtn({ icon, onClick, label }: { icon: string; onClick?: () => void; label?: string }) {
  const { T } = useTheme();
  return (
    <button onClick={() => { tap('light'); onClick?.(); }} aria-label={label} style={{
      width: 40, height: 40, borderRadius: 12, background: T.card,
      border: `1px solid ${T.border}`, color: T.text2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
      transition: 'transform 0.12s ease, border-color 0.14s ease, background 0.14s ease',
    }}>
      <Icon name={icon} size={18} />
    </button>
  );
}

interface NeutralBtnProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: string;
  full?: boolean;
  style?: CSSProperties;
  disabled?: boolean;
  tone?: 'default' | 'primary' | 'danger' | 'success';
}

export function NeutralBtn({ children, onClick, icon, full, style, disabled, tone = 'default' }: NeutralBtnProps) {
  const { T } = useTheme();
  const isPrimary = tone === 'primary';
  const isDanger = tone === 'danger';
  const isSuccess = tone === 'success';
  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        tap(isDanger ? 'warning' : isSuccess ? 'success' : isPrimary ? 'medium' : 'light');
        onClick?.();
      }}
      style={{
        background: isPrimary ? T.accent : isSuccess ? 'rgba(34,197,94,0.12)' : 'transparent',
        border: `1px solid ${isPrimary ? T.accent : isDanger ? 'rgba(239,68,68,0.28)' : isSuccess ? 'rgba(34,197,94,0.22)' : T.borderStrong}`,
        borderRadius: 12,
        padding: '12px 16px',
        color: isPrimary ? '#fff' : isDanger ? T.danger : isSuccess ? T.success : T.text,
        fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: full ? '100%' : undefined,
        fontFamily: 'inherit',
        transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease, transform 0.12s ease, opacity 0.12s ease',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={14} stroke={1.75} />}
      {children}
    </button>
  );
}

export function ChannelTag({ channel }: { channel: string }) {
  const { T } = useTheme();
  return (
    <span style={{
      fontSize: 9, padding: '2px 6px', borderRadius: 999,
      border: `1px solid ${T.border}`, color: T.text3,
      letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500,
      background: T.cardElev,
    }}>{channel}</span>
  );
}

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
    <div onClick={onClick ? () => { tap(danger ? 'warning' : 'light'); onClick(); } : undefined} style={{
      padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background 0.14s ease, transform 0.12s ease',
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

export function ScreenHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: ReactNode }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
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

export function EmptyState({
  icon = 'inbox', title, text, action,
}: { icon?: string; title: string; text?: string; action?: ReactNode }) {
  const { T } = useTheme();
  return (
    <div style={{
      padding: '28px 20px', border: `1px dashed ${T.border}`, borderRadius: 16,
      textAlign: 'center', color: T.text3, fontSize: 13, lineHeight: 1.5,
      background: T.card,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 16, border: `1px solid ${T.border}`, background: T.cardElev, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: T.text3 }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{title}</div>
      {text && <div style={{ marginTop: 6 }}>{text}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

export function SearchBox({
  value, onChange, placeholder,
}: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const { T, mode } = useTheme();
  const dark = mode === 'dark';
  const shellBg = dark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.58)';
  const fieldBg = dark ? 'rgba(255,255,255,0.055)' : 'rgba(10,10,10,0.035)';
  const fieldBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,10,0.055)';

  return (
    <div style={{
      background: shellBg,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.075)' : 'rgba(10,10,10,0.06)'}`,
      borderRadius: 16,
      boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.035)' : '0 8px 24px rgba(15,23,42,0.04)',
      backdropFilter: 'blur(16px) saturate(1.22)',
      WebkitBackdropFilter: 'blur(16px) saturate(1.22)',
      padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      overflow: 'hidden',
      transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
    }}>
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 12px',
        minHeight: 44,
        borderRadius: 12,
        background: fieldBg,
        border: `1px solid ${fieldBorder}`,
        boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.025)' : 'inset 0 1px 1px rgba(15,23,42,0.035)',
        overflow: 'hidden',
      }}>
        <Icon name="search" size={16} color={T.text3} />
        <input
          type="text"
          inputMode="search"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="cb-mini-transparent cb-mini-input-reset"
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            backgroundColor: 'transparent',
            WebkitAppearance: 'none',
            appearance: 'none',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            WebkitBoxShadow: 'none',
            borderRadius: 0,
            padding: 0,
            color: T.text,
            WebkitTextFillColor: T.text,
            caretColor: T.accent,
            fontSize: 16,
            fontFamily: 'inherit',
            colorScheme: mode,
          }}
        />
        {value && (
          <button onClick={() => { tap('selection'); onChange(''); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: T.text3, display: 'flex', flexShrink: 0 }}>
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function FormField({
  label, value, onChange, placeholder, multiline, type = 'text', inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  const { T, mode } = useTheme();
  const common: CSSProperties = {
    width: '100%', marginTop: 8, padding: '8px 10px',
    background: mode === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(10,10,10,0.035)',
    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(10,10,10,0.035)',
    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.055)' : 'rgba(10,10,10,0.055)'}`,
    outline: 'none',
    boxShadow: 'none',
    WebkitBoxShadow: 'none',
    borderRadius: 10, color: T.text, WebkitTextFillColor: T.text, caretColor: T.accent, fontSize: 14, fontFamily: 'inherit', lineHeight: 1.5, WebkitAppearance: 'none', appearance: 'none', colorScheme: mode,
  };
  return (
    <div style={{ background: T.cardElev, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 14px' }}>
      <FieldLabel style={{ fontSize: 9 }}>{label}</FieldLabel>
      {multiline ? (
        <textarea className="cb-mini-input cb-mini-input-reset" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} style={{ ...common, resize: 'vertical' }} />
      ) : (
        <input className="cb-mini-input cb-mini-input-reset" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} inputMode={inputMode} style={common} />
      )}
    </div>
  );
}

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  footer?: ReactNode;
  maxHeight?: string;
}

export function BottomSheet({ open, onClose, children, title, subtitle, right, footer, maxHeight = '88%' }: BottomSheetProps) {
  const { T, mode } = useTheme();
  const sheetGlassBg = mode === 'dark' ? 'rgba(17,17,17,0.86)' : 'rgba(255,255,255,0.90)';
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', animation: 'mini-fade-in 0.16s ease both' }}>
      <style>{`
        @keyframes mini-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mini-sheet-up { from { transform: translateY(18px); opacity: .9; } to { transform: translateY(0); opacity: 1; } }
        @keyframes mini-scale-in { from { transform: scale(.98); opacity: .9; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <div
        onClick={() => { tap('light'); onClose(); }}
        style={{
          position: 'absolute', inset: 0, background: T.overlayBg,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          background: sheetGlassBg,
          backdropFilter: 'blur(24px) saturate(1.32)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.32)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: `1px solid ${T.border}`,
          boxShadow: mode === 'dark' ? '0 -18px 54px rgba(0,0,0,0.46)' : '0 -18px 42px rgba(15,23,42,0.14)',
          maxHeight,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'mini-sheet-up 0.2s cubic-bezier(.2,.8,.2,1) both',
        }}
      >
        <div style={{ padding: '10px 0 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.borderStrong }} />
        </div>
        {(title || subtitle || right) && (
          <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && <div style={{ fontSize: 18, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>{title}</div>}
              {subtitle && <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: title ? 4 : 0 }}>{subtitle}</div>}
            </div>
            {right ?? (
              <button
                onClick={() => { tap('light'); onClose(); }}
                aria-label="Закрыть"
                style={{
                  width: 32, height: 32, flexShrink: 0,
                  borderRadius: 10, border: `1px solid ${T.border}`,
                  background: T.cardElev, color: T.text2, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  transition: 'background 0.14s ease, border-color 0.14s ease',
                }}
              >
                <Icon name="x" size={16} />
              </button>
            )}
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: title || subtitle || right ? '0 0 18px' : '10px 0 20px' }}>
          {children}
        </div>
        {footer && (
          <div style={{ flexShrink: 0, padding: '14px 20px calc(14px + env(safe-area-inset-bottom, 0px))', borderTop: `1px solid ${T.border}`, background: sheetGlassBg, backdropFilter: 'blur(18px) saturate(1.25)', WebkitBackdropFilter: 'blur(18px) saturate(1.25)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface SheetAction {
  id: string;
  label: string;
  sub?: string;
  icon?: string;
  tone?: 'default' | 'primary' | 'danger' | 'success';
  disabled?: boolean;
  onClick: () => void;
}

export function ActionSheet({
  open, onClose, title, subtitle, actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  actions: SheetAction[];
}) {
  const { T } = useTheme();
  return (
    <BottomSheet open={open} onClose={onClose} title={title} subtitle={subtitle} maxHeight="72%">
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {actions.map((action) => {
          const danger = action.tone === 'danger';
          const primary = action.tone === 'primary';
          const success = action.tone === 'success';
          return (
            <button
              key={action.id}
              disabled={action.disabled}
              onClick={() => {
                if (action.disabled) return;
                tap(danger ? 'warning' : success ? 'success' : primary ? 'medium' : 'light');
                action.onClick();
              }}
              style={{
                width: '100%', minHeight: 52, padding: '12px 14px', borderRadius: 14,
                border: `1px solid ${primary ? T.accent : danger ? 'rgba(239,68,68,0.28)' : success ? 'rgba(34,197,94,0.22)' : T.border}`,
                background: primary ? T.accent : success ? 'rgba(34,197,94,0.12)' : T.cardElev,
                color: primary ? '#fff' : danger ? T.danger : success ? T.success : T.text,
                cursor: action.disabled ? 'not-allowed' : 'pointer', opacity: action.disabled ? 0.45 : 1,
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', fontFamily: 'inherit',
                transition: 'background 0.14s ease, border-color 0.14s ease, transform 0.12s ease',
              }}
            >
              {action.icon && <Icon name={action.icon} size={18} />}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>{action.label}</span>
                {action.sub && <span style={{ display: 'block', fontSize: 11, lineHeight: 1.4, marginTop: 2, color: primary ? 'rgba(255,255,255,0.72)' : danger ? 'rgba(239,68,68,0.72)' : T.text3 }}>{action.sub}</span>}
              </span>
            </button>
          );
        })}
        <NeutralBtn full onClick={onClose}>Отмена</NeutralBtn>
      </div>
    </BottomSheet>
  );
}

export { Fragment };
