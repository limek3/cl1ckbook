// lib/menu-styles.ts
import { cn } from '@/lib/utils';

export function menuTriggerBaseClass() {
  return cn(
    'h-9 rounded-[10px] border px-3 text-[11px] font-semibold shadow-none outline-none',
    'transition-[background,border-color,box-shadow,transform] duration-150',
    'focus:ring-0 focus:ring-offset-0 active:scale-[0.985]',
    'backdrop-blur-[18px]',
  );
}

export function menuContentBaseClass() {
  return cn(
    'z-[160] overflow-hidden rounded-[12px] border p-1 shadow-none outline-none',
    'backdrop-blur-[24px]',
  );
}

export function menuItemBaseClass() {
  return cn(
    'relative my-0.5 flex min-h-11 w-full cursor-pointer select-none items-center justify-between gap-3',
    'rounded-[9px] px-2.5 py-2 text-left text-[12px] font-semibold outline-none',
    'transition-colors duration-150 active:scale-[0.99]',
  );
}

export function menuSeparatorBaseClass() {
  return 'my-1 h-px';
}

export function menuTriggerClass(light: boolean) {
  return cn(
    menuTriggerBaseClass(),
    light
      ? [
          'border-black/[0.08]',
          'bg-white/70 text-black',
          'shadow-[0_10px_34px_rgba(15,15,15,0.035)]',
          'hover:border-black/[0.13] hover:bg-white/85',
          'data-[state=open]:border-black/[0.16] data-[state=open]:bg-white/90',
          'data-[state=open]:shadow-[0_14px_44px_rgba(15,15,15,0.07)]',
        ]
      : [
          'border-white/[0.09]',
          'bg-white/[0.055] text-white',
          'shadow-[0_12px_38px_rgba(0,0,0,0.26)]',
          'hover:border-white/[0.15] hover:bg-white/[0.075]',
          'data-[state=open]:border-white/[0.18] data-[state=open]:bg-white/[0.09]',
          'data-[state=open]:shadow-[0_18px_56px_rgba(0,0,0,0.42)]',
        ],
  );
}

export function menuContentClass(light: boolean) {
  return cn(
    menuContentBaseClass(),
    light
      ? [
          'border-black/[0.09]',
          'bg-[#fbfbfa]/82 text-black',
          'shadow-[0_24px_80px_rgba(15,15,15,0.12)]',
        ]
      : [
          'border-white/[0.10]',
          'bg-[#101010]/82 text-white',
          'shadow-[0_28px_90px_rgba(0,0,0,0.58)]',
        ],
  );
}

export function menuItemClass(light: boolean, active = false, danger = false) {
  return cn(
    menuItemBaseClass(),
    danger
      ? active
        ? light
          ? 'bg-red-500/[0.07] text-red-700'
          : 'bg-red-300/[0.09] text-red-200'
        : light
          ? [
              'text-red-600',
              'hover:bg-red-500/[0.055] hover:text-red-700',
              'focus:bg-red-500/[0.055] focus:text-red-700',
              'data-[highlighted]:bg-red-500/[0.055] data-[highlighted]:text-red-700',
            ]
          : [
              'text-red-300',
              'hover:bg-red-300/[0.075] hover:text-red-200',
              'focus:bg-red-300/[0.075] focus:text-red-200',
              'data-[highlighted]:bg-red-300/[0.075] data-[highlighted]:text-red-200',
            ]
      : active
        ? light
          ? 'bg-black/[0.045] text-black'
          : 'bg-white/[0.065] text-white'
        : light
          ? [
              'text-black/68',
              'hover:bg-black/[0.045] hover:text-black',
              'focus:bg-black/[0.045] focus:text-black',
              'data-[highlighted]:bg-black/[0.045] data-[highlighted]:text-black',
            ]
          : [
              'text-white/68',
              'hover:bg-white/[0.075] hover:text-white',
              'focus:bg-white/[0.075] focus:text-white',
              'data-[highlighted]:bg-white/[0.075] data-[highlighted]:text-white',
            ],
  );
}

export function menuItemInnerClass() {
  return 'flex min-w-[220px] w-full items-center justify-between gap-3 py-0.5';
}

export function menuItemLeftClass() {
  return 'flex min-w-0 items-center gap-3';
}

export function menuItemLabelClass() {
  return 'truncate text-[12px] font-semibold';
}

export function menuItemCheckSlotClass() {
  return 'grid size-4 shrink-0 place-items-center';
}

export function menuItemIconClass(light: boolean, danger = false) {
  return cn(
    'grid size-4 shrink-0 place-items-center',
    danger
      ? light
        ? 'text-red-600'
        : 'text-red-300'
      : light
        ? 'text-black/46'
        : 'text-white/48',
  );
}

export function menuSeparatorClass(light: boolean) {
  return cn(
    menuSeparatorBaseClass(),
    light ? 'bg-black/[0.07]' : 'bg-white/[0.08]',
  );
}