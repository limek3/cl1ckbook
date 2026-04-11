'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

const LOCATION_CHANGE_EVENT = 'klikbuk:location-change';

function ensureHistoryPatched() {
  if (typeof window === 'undefined') return;
  const marker = '__klikbukHistoryPatched__';

  if ((window as typeof window & { [key: string]: unknown })[marker]) {
    return;
  }

  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  const notify = () => {
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  };

  window.history.pushState = function pushStatePatched(...args) {
    const result = originalPushState.apply(this, args);
    notify();
    return result;
  };

  window.history.replaceState = function replaceStatePatched(...args) {
    const result = originalReplaceState.apply(this, args);
    notify();
    return result;
  };

  window.addEventListener('popstate', notify);

  (window as typeof window & { [key: string]: unknown })[marker] = true;
}

export function useBrowserSearchParams() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    ensureHistoryPatched();

    const update = () => {
      setSearch(window.location.search || '');
    };

    update();
    window.addEventListener(LOCATION_CHANGE_EVENT, update);
    window.addEventListener('popstate', update);

    return () => {
      window.removeEventListener(LOCATION_CHANGE_EVENT, update);
      window.removeEventListener('popstate', update);
    };
  }, [pathname]);

  return useMemo(() => new URLSearchParams(search), [search]);
}

export default useBrowserSearchParams;
