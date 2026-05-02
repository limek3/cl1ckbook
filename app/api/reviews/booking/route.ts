import { NextResponse } from 'next/server';
import { submitBookingReview } from '@/lib/server/booking-reviews';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      author?: string;
      rating?: number;
      text?: string;
    };

    if (!body.token || !body.text) {
      return NextResponse.json({ error: 'token_and_text_required' }, { status: 400 });
    }

    const result = await submitBookingReview({
      token: body.token,
      author: body.author,
      rating: Number(body.rating ?? 5),
      text: body.text,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ ok: true, review: result.review });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'unknown_error' },
      { status: 500 },
    );
  }
}
