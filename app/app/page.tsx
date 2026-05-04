import { MiniAppEntry } from '@/components/mini/mini-app-entry';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeRedirect(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string' || !raw) return '/dashboard';

  try {
    const decoded = decodeURIComponent(raw);
    return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : '/dashboard';
  } catch {
    return raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
  }
}

export default async function AppEntryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const redirectTo = normalizeRedirect(params.redirectTo ?? params.to);

  return <MiniAppEntry desktopRedirectTo={redirectTo} />;
}
