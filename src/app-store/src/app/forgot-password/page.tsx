import Link from 'next/link';
import { forgotPasswordUrl } from '@/core/urls';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center">
        <h1 className="text-2xl font-semibold text-heading">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please visit the AirQo Analytics portal to reset your password.
        </p>
        <Link href={forgotPasswordUrl || 'https://analytics.airqo.net'} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
          Go to Analytics
        </Link>
      </div>
    </div>
  );
}
