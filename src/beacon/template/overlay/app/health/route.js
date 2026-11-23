import { NextResponse } from 'next/server';

/** Liveness check for load balancers and container orchestrators. */
export async function GET() {
  return NextResponse.json({
    service: 'beacon-template',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
