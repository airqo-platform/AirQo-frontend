import { redirect } from 'next/navigation';

interface OrganizationRootPageProps {
  params: {
    org_slug: string;
  };
}

export default function OrganizationRootPage({
  params,
}: OrganizationRootPageProps) {
  redirect(`/org/${encodeURIComponent(params.org_slug)}/dashboard`);
}
