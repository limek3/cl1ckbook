import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL('/login', request.url);
  return NextResponse.redirect(url);
}
