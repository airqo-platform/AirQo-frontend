import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import type { Session } from 'next-auth';

/**
 * POST /api/payments/update-card
 * Updates payment card information with reCAPTCHA verification
 */
export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      cardNumber,
      cardholderName,
      expiryMonth,
      expiryYear,
      cvv,
      recaptchaToken,
    } = body;

    // Validate reCAPTCHA token
    if (!recaptchaToken) {
      return NextResponse.json(
        { success: false, message: 'reCAPTCHA verification required' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA with Google
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const recaptchaResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
      }
    );

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return NextResponse.json(
        { success: false, message: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvv) {
      return NextResponse.json(
        { success: false, message: 'All card fields are required' },
        { status: 400 }
      );
    }

    // Get last 4 digits for storage
    const last4 = cardNumber.slice(-4);

    // TODO: Replace with actual payment provider integration (Stripe, Paystack, etc.)
    // This should:
    // 1. Tokenize the card with payment provider
    // 2. Store the token securely
    // 3. Never store full card details
    // Example with Stripe:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const paymentMethod = await stripe.paymentMethods.create({
    //   type: 'card',
    //   card: {
    //     number: cardNumber,
    //     exp_month: parseInt(expiryMonth),
    //     exp_year: parseInt(expiryYear),
    //     cvc: cvv,
    //   },
    // });
    // const customer = await stripe.customers.update(customerId, {
    //   invoice_settings: {
    //     default_payment_method: paymentMethod.id,
    //   },
    // });

    // Simulate successful update
    const updatedPaymentMethod = {
      type: 'card',
      last4,
      expiryMonth,
      expiryYear,
      brand: 'Visa', // This would come from payment provider
    };

    return NextResponse.json({
      success: true,
      message: 'Payment method updated successfully',
      paymentMethod: updatedPaymentMethod,
    });
  } catch (error) {
    console.error('Error updating payment card:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update payment method',
      },
      { status: 500 }
    );
  }
}
