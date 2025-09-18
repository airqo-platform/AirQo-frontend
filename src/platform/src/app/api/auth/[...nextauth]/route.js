import NextAuth from 'next-auth';
import { authOptions } from './options.js';

const handler = NextAuth(authOptions);

// Export the handler for both GET and POST methods
export const GET = handler;
export const POST = handler;

// Export authOptions for other parts of the app
export { authOptions };
