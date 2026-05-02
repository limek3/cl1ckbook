import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import type { MasterProfile, ReviewItem } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clampRating(value: number) {
  if (!Number.isFinite(value)) return 5;
  return Math.min(5, Math.max(1, value));
}

function calculateRating(reviews: ReviewItem[]) {
  if (reviews.length === 0) return 4.9;
  const total = reviews.reduce((sum, review) => sum + clampRating(Number(review.rating)), 0);
  return Number((total / reviews.length).toFixed(1));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      author?: string;
      rating?: number;
      text?: string;
      service?: string;
    };

    const slug = body.slug?.trim();
    const text = body.text?.trim();

    if (!slug || !text) {
      return NextResponse.json({ error: 'slug_and_text_required' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: workspace, error } = await admin
      .from('sloty_workspaces')
      .select('id,profile')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    if (!workspace) return NextResponse.json({ error: 'profile_not_found' }, { status: 404 });

    const profile = ((workspace.profile ?? {}) as MasterProfile) || ({} as MasterProfile);
    const currentReviews = Array.isArray(profile.reviews) ? profile.reviews : [];
    const review: ReviewItem = {
      id: `review-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      author: body.author?.trim() || 'Клиент',
      rating: clampRating(Number(body.rating ?? 5)),
      text,
      service: body.service?.trim() || undefined,
      dateLabel: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    };

    const nextReviews = [review, ...currentReviews].slice(0, 80);
    const nextProfile: MasterProfile = {
      ...profile,
      reviews: nextReviews,
      reviewCount: nextReviews.length,
      rating: calculateRating(nextReviews),
    };

    const { error: updateError } = await admin
      .from('sloty_workspaces')
      .update({ profile: nextProfile })
      .eq('id', workspace.id);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'unknown_error' },
      { status: 500 },
    );
  }
}
