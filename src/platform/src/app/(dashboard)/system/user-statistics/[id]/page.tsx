import { redirect } from 'next/navigation';

interface UserDetailRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailRedirectPage({
  params,
}: UserDetailRedirectPageProps) {
  const { id } = await params;
  redirect(`/system/users/${id}`);
}
