'use client';

import { useEffect, useMemo, useState } from 'react';

function getSearchString() {
  if (typeof window === 'undefined') return '';
  return window.location.search || '';
}

function patchHistoryMethod(method: 'pushState' | 'replaceState') {
  if (typeof window === 'undefined') return () => {};

  const historyRef = window.history as History & {
    __klikbukPatchedPushState?: boolean;
    __klikbukPatchedReplaceState?: boolean;
  };
  const flag = method === 'pushState' ? '__klikbukPatchedPushState' : '__klikbukPatchedReplaceState';

  if (historyRef[flag]) {
    return () => {};
  }

  historyRef[flag] = true;
  const original = window.history[method];

  window.history[method] = function patchedHistoryMethod(this: History, ...args: Parameters<History[typeof method]>) {
    const result = original.apply(this, args);
    window.dispatchEvent(new Event('klikbuk:searchchange'));
    return result;
  };

  return () => {
    window.history[method] = original;
    historyRef[flag] = false;
  };
}

export function useBrowserSearchParams() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSearch(getSearchString());

    const sync = () => setSearch(getSearchString());
    const unpatchPush = patchHistoryMethod('pushState');
    const unpatchReplace = patchHistoryMethod('replaceState');

    window.addEventListener('popstate', sync);
    window.addEventListener('klikbuk:searchchange', sync);

    return () => {
      unpatchPush();
      unpatchReplace();
      window.removeEventListener('popstate', sync);
      window.removeEventListener('klikbuk:searchchange', sync);
    };
  }, []);

  return useMemo(() => new URLSearchParams(search), [search]);
}

export default useBrowserSearchParams;
