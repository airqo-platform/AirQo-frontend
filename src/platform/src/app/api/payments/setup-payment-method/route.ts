import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message:
        'Direct payment-method setup is not supported in the current API. Use checkout to upgrade or renew subscriptions.',
      comingSoon: true,
    },
    { status: 501 }
  );
}
