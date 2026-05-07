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
    background: dark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
  };

  const shellStyle: CSSProperties = {
    position: 'fixed',
    left: '50%',
    bottom: 'calc(86px + var(--miniapp-safe-bottom, 0px))',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 390,
    padding: '0 18px',
    zIndex: 260,
    pointerEvents: 'none',
  };

  const sheetStyle: CSSProperties = {
    position: 'relative',
    pointerEvents: 'auto',
    width: '100%',
    maxHeight,
    overflow: 'hidden',
    borderRadius: 26,
    border: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.065)'}`,
    background: dark ? 'rgba(22,22,24,0.76)' : 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(34px) saturate(2.15) brightness(1.02)',
    WebkitBackdropFilter: 'blur(34px) saturate(2.15) brightness(1.02)',
    boxShadow: dark
      ? '0 26px 72px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.08)'
      : '0 26px 72px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
    color: T.text,
  };

  const tailStyle: CSSProperties = {
    position: 'absolute',
    left: 34,
    bottom: -10,
    width: 24,
    height: 24,
    borderRadius: '0 0 7px 0',
    transform: 'rotate(45deg)',
    background: dark ? 'rgba(22,22,24,0.76)' : 'rgba(255,255,255,0.78)',
    borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
    borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
    backdropFilter: 'blur(34px) saturate(2.15) brightness(1.02)',
    WebkitBackdropFilter: 'blur(34px) saturate(2.15) brightness(1.02)',
    boxShadow: dark
      ? '10px 10px 24px rgba(0,0,0,0.24)'
      : '10px 10px 24px rgba(0,0,0,0.08)',
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
            initial={{ opacity: 0, y: 22, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.975 }}
            transition={{
              type: 'spring',
              stiffness: 460,
              damping: 36,
              mass: 0.72,
            }}
          >
            <motion.div
              style={sheetStyle}
              onClick={(event) => event.stopPropagation()}
              initial={{ filter: 'blur(8px)' }}
              animate={{ filter: 'blur(0px)' }}
              exit={{ filter: 'blur(6px)' }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>

            {tail && <div style={tailStyle} />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}