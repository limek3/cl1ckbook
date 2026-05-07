'use client';

import type { BookingStatus } from '@/lib/types';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

const classes: Record<BookingStatus, string> = {
  new: 'status-chip-new',
  confirmed: 'status-chip-confirmed',
  completed: 'status-chip-completed',
  no_show: 'status-chip-noshow',
  cancelled: 'status-chip-cancelled',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { copy } = useLocale();

  return (
    <span
      className={cn(
        'cb-status-badge inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
        classes[status],
      )}
    >
      {copy.statuses[status]}
    </span>
  );
}

export function useBookingStatusOptions() {
  const { copy } = useLocale();

  return [
    { value: 'new', label: copy.statuses.new },
    { value: 'confirmed', label: copy.statuses.confirmed },
    { value: 'completed', label: copy.statuses.completed },
    { value: 'no_show', label: copy.statuses.no_show },
    { value: 'cancelled', label: copy.statuses.cancelled },
  ] as const;
}
