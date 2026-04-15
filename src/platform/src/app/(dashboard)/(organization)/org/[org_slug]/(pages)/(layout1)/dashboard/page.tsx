import { AnalyticsDashboard } from '@/modules/analytics';

interface PageProps {
  params: {
    org_slug: string;
  };
}

const Page = ({ params }: PageProps) => {
  return (
    <AnalyticsDashboard
      isOrganizationFlow={true}
      organizationSlug={params.org_slug}
    />
  );
};

export default Page;
