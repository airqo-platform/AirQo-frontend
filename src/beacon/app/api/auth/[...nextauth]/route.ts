import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = (req: any, res: any) => {
  // Dynamically resolve and set process.env.NEXTAUTH_URL based on incoming request headers
  const getHeader = (name: string): string | null => {
    if (typeof req.headers.get === 'function') {
      return req.headers.get(name);
    }
    if (req.headers && typeof req.headers === 'object') {
      return req.headers[name] || req.headers[name.toLowerCase()] || null;
    }
    return null;
  };

  const host = getHeader('x-forwarded-host') || getHeader('host');
  const proto = getHeader('x-forwarded-proto') || 'https';

  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  }

  return NextAuth(req, res, authOptions);
};

export { handler as GET, handler as POST };
