import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_TRANSLATE_ELEMENT_BASE_URL =
  'https://translate.googleapis.com/translate_a/element.js';
const DEFAULT_CALLBACK_NAME = 'googleTranslateElementInit';
const GOOGLE_TRANSLATE_ELEMENT_TIMEOUT_MS = 10000;

export async function GET(request: NextRequest) {
  const callbackName =
    request.nextUrl.searchParams.get('cb') || DEFAULT_CALLBACK_NAME;

  try {
    const upstreamUrl = `${GOOGLE_TRANSLATE_ELEMENT_BASE_URL}?cb=${encodeURIComponent(callbackName)}`;
    const upstreamResponse = await fetch(upstreamUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(GOOGLE_TRANSLATE_ELEMENT_TIMEOUT_MS),
    });

    if (!upstreamResponse.ok) {
      return new NextResponse(
        `/* Google Translate upstream error: ${upstreamResponse.status} */`,
        {
          status: 502,
          headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    const scriptBody = await upstreamResponse.text();
    return new NextResponse(scriptBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return new NextResponse('/* Google Translate upstream timeout */', {
        status: 504,
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    return new NextResponse('/* Google Translate proxy error */', {
      status: 502,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
}
