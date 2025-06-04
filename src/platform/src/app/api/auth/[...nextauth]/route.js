import NextAuth from 'next-auth';
import { options as userOptions } from '../user/[...nextauth]/options.js';

// Default NextAuth handler that uses user options
// This handles session requests from new tabs and provides compatibility
const handler = NextAuth(userOptions);

// Export the handler for both GET and POST methods
export const GET = handler;
export const POST = handler;

// Export authOptions for other parts of the app
export { userOptions as authOptions };
