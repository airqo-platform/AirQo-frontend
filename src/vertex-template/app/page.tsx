import { redirect } from 'next/navigation';

export default function Page() {
  // Fallback: This code should theoretically not be reached because middleware
  // handles the routing for "/" before this page is rendered.
  // We keep this as a safety net.
  redirect('/home');
}