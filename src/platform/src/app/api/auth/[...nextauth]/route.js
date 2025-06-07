import NextAuth from 'next-auth';
import { options } from './options.js';

const handler = NextAuth(options);

// Export the handler for both GET and POST methods
export const GET = handler;
export const POST = handler;

// Export authOptions for other parts of the app
export { options as authOptions };
