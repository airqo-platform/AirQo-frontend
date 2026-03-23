import { redirect } from 'next/navigation';

export default function AboutRedirect() {
  // Redirect users from /africa-clean-air-forum/about to /africa-clean-air-forum
  redirect('/africa-clean-air-forum');
}
