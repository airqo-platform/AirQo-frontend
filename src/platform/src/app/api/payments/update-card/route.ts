import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        'Updating payment methods is not available in the current API. Use hosted checkout for subscription changes.',
      comingSoon: true,
    },
    { status: 501 }
  );
}
