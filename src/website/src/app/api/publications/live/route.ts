import { NextRequest, NextResponse } from 'next/server';

import {
  getLivePublications,
  PublicationsFeedError,
} from '@/services/external/publications-feed.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, s-maxage=21600, stale-while-revalidate=86400';

const parsePositiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export async function GET(request: NextRequest) {
  const page = parsePositiveInteger(
    request.nextUrl.searchParams.get('page'),
    1,
  );
  const pageSize = parsePositiveInteger(
    request.nextUrl.searchParams.get('page_size'),
    12,
  );

  try {
    const response = await getLivePublications({ page, pageSize });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': CACHE_CONTROL,
      },
    });
  } catch (error) {
    const message =
      error instanceof PublicationsFeedError
        ? error.message
        : 'Unable to load live publications';

    console.error('Live publications feed error:', message);

    return NextResponse.json(
      { error: 'Live publications are temporarily unavailable' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
