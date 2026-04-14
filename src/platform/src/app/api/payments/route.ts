import { NextRequest, NextResponse } from 'next/server';
import type { Transaction } from '@/shared/types/api';
import {
  extractEnvelopeData,
  makeUsersApiRequest,
  parseJsonSafe,
} from '../subscription/_lib/paymentsProxy';

export const dynamic = 'force-dynamic';

interface BackendTransaction {
  _id?: string;
  id?: string;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  description?: string;
  paymentMethod?: string | { masked?: string; brand?: string; last4?: string };
  reference?: string;
  createdAt?: string;
  date?: string;
}

const normalizePaymentMethod = (
  paymentMethod: BackendTransaction['paymentMethod']
): string => {
  if (!paymentMethod) {
    return 'Provider-hosted checkout';
  }

  if (typeof paymentMethod === 'string') {
    return paymentMethod;
  }

  if (paymentMethod.masked) {
    return paymentMethod.masked;
  }

  if (paymentMethod.last4) {
    const brandPrefix = paymentMethod.brand ? `${paymentMethod.brand} ` : '';
    return `${brandPrefix}•••• ${paymentMethod.last4}`;
  }

  return 'Provider-hosted checkout';
};

const normalizeTransactions = (items: BackendTransaction[]): Transaction[] => {
  return items.map((item, index) => {
    const id = item._id || item.id || `txn-${index + 1}`;

    return {
      id,
      amount: Number(item.amount || 0),
      currency: item.currency || 'USD',
      status: item.status || 'pending',
      description: item.description || 'Subscription transaction',
      date: item.date || item.createdAt || new Date().toISOString(),
      paymentMethod: normalizePaymentMethod(item.paymentMethod),
      reference: item.reference,
    };
  });
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    };

    const result = await makeUsersApiRequest(
      '/transactions/transaction-history',
      {
        method: 'GET',
      },
      query
    );

    if ('error' in result) {
      return result.error;
    }

    const payload = await parseJsonSafe<Record<string, unknown>>(
      result.response
    );

    if (!result.response.ok || !payload) {
      const message =
        (payload?.message as string | undefined) ||
        'Failed to retrieve transaction history';

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: result.response.status || 500 }
      );
    }

    const rawTransactions =
      extractEnvelopeData<BackendTransaction[]>(payload) || [];
    const transactions = normalizeTransactions(rawTransactions);

    return NextResponse.json({
      success: true,
      message:
        (payload.message as string) ||
        'Transaction history retrieved successfully',
      data: transactions,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve transaction history',
      },
      { status: 500 }
    );
  }
}
