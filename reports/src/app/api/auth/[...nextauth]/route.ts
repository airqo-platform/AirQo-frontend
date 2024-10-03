import NextAuth from 'next-auth';

import { options } from '@/services/authService';

const handler = NextAuth(options);

export { handler as GET, handler as POST };
