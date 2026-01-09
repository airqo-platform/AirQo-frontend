import { NextResponse } from 'next/server';
import type { Transaction } from '@/shared/types/api';

// Dummy data for transaction history
const dummyTransactions: Transaction[] = [
  {
    id: '1',
    amount: 29.99,
    currency: 'USD',
    status: 'completed',
    description: 'Monthly API subscription',
    date: '2025-12-01T10:00:00Z',
    paymentMethod: '**** **** **** 1234',
    reference: 'TXN-001',
  },
  {
    id: '2',
    amount: 15.0,
    currency: 'USD',
    status: 'completed',
    description: 'Data export fee',
    date: '2025-11-15T14:30:00Z',
    paymentMethod: '**** **** **** 5678',
    reference: 'TXN-002',
  },
  {
    id: '3',
    amount: 50.0,
    currency: 'USD',
    status: 'pending',
    description: 'Premium analytics upgrade',
    date: '2025-12-10T09:15:00Z',
    paymentMethod: '**** **** **** 9012',
    reference: 'TXN-003',
  },
  {
    id: '4',
    amount: 10.0,
    currency: 'USD',
    status: 'failed',
    description: 'Additional API calls',
    date: '2025-11-20T16:45:00Z',
    paymentMethod: '**** **** **** 3456',
    reference: 'TXN-004',
  },
];

export async function GET() {
  try {
    // In a real implementation, this would fetch from database
    // and filter by authenticated user
    const response = {
      success: true,
      message: 'Transaction history retrieved successfully',
      transactions: dummyTransactions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve transaction history' },
      { status: 500 }
    );
  }
}
