import { NextResponse } from 'next/server';
import type { SubscriptionPlan } from '@/shared/types/api';

const plans: SubscriptionPlan[] = [
  {
    tier: 'Free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: [
      'Recent hourly calibrated measurements (last 7 days)',
      'Access by Site ID, Device ID, Cohort ID, and Grid ID',
      'Spatial heatmap visualisations',
      'Community support',
    ],
    limits: {
      hourly: 100,
      daily: 1000,
      monthly: 10000,
    },
  },
  {
    tier: 'Standard',
    name: 'Standard',
    price: 50,
    currency: 'USD',
    priceId: process.env.PAYMENTS_STANDARD_PRICE_ID,
    features: [
      'Everything in Free',
      'Historical data access up to 1 year',
      'Raw sensor data and daily aggregations',
      'Bulk data export with pagination support',
      'Email support',
    ],
    limits: {
      hourly: 500,
      daily: 5000,
      monthly: 50000,
    },
  },
  {
    tier: 'Premium',
    name: 'Premium',
    price: 150,
    currency: 'USD',
    priceId: process.env.PAYMENTS_PREMIUM_PRICE_ID,
    features: [
      'Everything in Standard',
      '7-day hourly and daily forecasts',
      'Health recommendations with forecast context',
      'Priority API access with higher limits',
      'Priority support',
    ],
    limits: {
      hourly: 2000,
      daily: 20000,
      monthly: 200000,
    },
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Subscription plans retrieved successfully',
    data: plans,
    plans,
  });
}
