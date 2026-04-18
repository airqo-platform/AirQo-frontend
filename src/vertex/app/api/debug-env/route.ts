import { NextResponse } from 'next/server';

export async function GET() {
  // Only return keys to avoid leaking sensitive data
  const envKeys = Object.keys(process.env).sort();
  
  const criticalKeys = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'AUTH_TRUST_HOST',
    'SLACK_WEBHOOK_URL',
    'NODE_ENV'
  ];
  
  const status: Record<string, boolean> = {};
  criticalKeys.forEach(key => {
    status[key] = !!process.env[key];
  });

  return NextResponse.json({
    message: "Environment Debug Info",
    present_keys_count: envKeys.length,
    critical_status: status,
    // List all keys for debugging (values are omitted for security)
    all_keys: envKeys
  });
}
