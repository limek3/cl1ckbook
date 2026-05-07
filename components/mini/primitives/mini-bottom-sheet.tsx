'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../theme';

export function MiniBottomSheet({
  open,
  onClose,
  children,
  maxHeight = '72vh',
  tail = true,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
  tail?: boolean;
}) {
  const { T, mode } = useTheme();
  const dark = mode === 'dark';

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 240,
    background: dark ? 'rgba(0,0,0,0.20)' : 'rgba(10,10,10,0.10)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  };

  const shellStyle: CSSProperties = {
    position: 'fixed',
    left: '50%',
    bottom: 'calc(80px + var(--miniapp-safe-bottom, 0px))',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 390,
    padding: '0 12px',
    zIndex: 260,
    pointerEvents: 'none',
  };

  const sheetStyle: CSSProperties = {
    position: 'relative',
    pointerEvents: 'auto',
    width: '100%',
    maxHeight,
    overflow: 'hidden',
    borderRadius: 24,
    border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,10,0.06)'}`,
    background: dark ? 'rgba(20,20,22,0.84)' : 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(26px) saturate(1.25)',
    WebkitBackdropFilter: 'blur(26px) saturate(1.25)',
    boxShadow: dark
      ? '0 22px 54px rgba(0,0,0,0.56), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 18px 44px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.82)',
    color: T.text,
  };

  const accentLineStyle: CSSProperties = {
    height: 4,
    width: 38,
    borderRadius: 999,
    background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,10,0.12)',
    margin: '10px auto 0',
    opacity: tail ? 1 : 0.75,
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            style={overlayStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
          />

          <motion.div
            style={shellStyle}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.985 }}
            transition={{
              type: 'spring',
              stiffness: 430,
              damping: 34,
              mass: 0.74,
            }}
          >
            <motion.div
              style={sheetStyle}
              onClick={(event) => event.stopPropagation()}
              initial={{ filter: 'blur(6px)' }}
              animate={{ filter: 'blur(0px)' }}
              exit={{ filter: 'blur(4px)' }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ paddingBottom: 6 }}>
                <div style={accentLineStyle} />
              </div>
              <div style={{ maxHeight, overflowY: 'auto', paddingBottom: 4 }}>
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
