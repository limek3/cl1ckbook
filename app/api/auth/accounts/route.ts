import { NextResponse } from 'next/server';

import { requireAuthUser } from '@/lib/server/require-auth-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuthUser();
    const providers = new Set<string>();

    user.identities?.forEach((identity) => {
      if (identity.provider) providers.add(identity.provider);
    });

    const appProviders = user.app_metadata?.providers;
    if (Array.isArray(appProviders)) {
      appProviders.forEach((provider) => providers.add(String(provider)));
    }

    const metaProviders = user.user_metadata?.providers;
    if (Array.isArray(metaProviders)) {
      metaProviders.forEach((provider) => providers.add(String(provider)));
    }

    if (user.user_metadata?.provider) {
      providers.add(String(user.user_metadata.provider));
    }

    if (user.user_metadata?.telegram_id) {
      providers.add('telegram');
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
        providers: Array.from(providers),
        user_metadata: user.user_metadata ?? {},
        app_metadata: user.app_metadata ?? {},
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'accounts_failed';
    const status = message === 'unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
