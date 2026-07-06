import { redirect } from 'next/navigation';

interface UserDetailRedirectPageProps {
  params: { id: string };
}

export default function UserDetailRedirectPage({
  params,
}: UserDetailRedirectPageProps) {
  const { id } = params;
  redirect(`/system/users/${id}`);
}
