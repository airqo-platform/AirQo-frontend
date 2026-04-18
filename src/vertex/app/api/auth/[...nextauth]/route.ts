import NextAuth from 'next-auth';
import { options } from './options';

const handler = (req: any, res: any) => NextAuth(req, res, options);

export { handler as GET, handler as POST };
