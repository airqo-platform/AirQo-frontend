import NextAuth from 'next-auth';
import { authOptions } from '@/shared/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (NextAuth as unknown as (options: any) => any)(authOptions);

export { handler as GET, handler as POST };
