import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message:
        'Billing profile management is not yet available in the backend API. Subscription and transaction history are available.',
      comingSoon: true,
    },
    { status: 501 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      message:
        'Billing profile management is not yet available in the backend API. Subscription and transaction history are available.',
      comingSoon: true,
    },
    { status: 501 }
  );
}
