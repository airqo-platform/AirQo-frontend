import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import type { Session } from 'next-auth';

/**
 * GET /api/payments/billing-info
 * Retrieves billing information for the authenticated user
 */
export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Replace with actual API call to AirQo payments service
    // This is a placeholder response based on the payment service documentation
    const billingInfo = {
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: '12',
        expiryYear: '2025',
      },
      billingAddress: {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'Kampala',
        state: 'Central',
        postalCode: '12345',
        country: 'Uganda',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      email: (session.user as any)?.email || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: (session.user as any)?.name || '',
    };

    return NextResponse.json({
      success: true,
      message: 'Billing information retrieved successfully',
      billingInfo,
    });
  } catch (error) {
    console.error('Error fetching billing info:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch billing information',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/payments/billing-info
 * Updates billing information for the authenticated user
 */
export async function PUT(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // TODO: Replace with actual API call to AirQo payments service
    // POST /payments/billing-info endpoint based on the payment service documentation

    return NextResponse.json({
      success: true,
      message: 'Billing information updated successfully',
      billingInfo: body,
    });
  } catch (error) {
    console.error('Error updating billing info:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update billing information',
      },
      { status: 500 }
    );
  }
}
