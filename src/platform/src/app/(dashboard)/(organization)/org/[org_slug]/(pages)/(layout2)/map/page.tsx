'use client';

import React, { useMemo } from 'react';
import { MapPage } from '@/modules/airqo-map';
import { useUser } from '@/shared/hooks/useUser';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';

interface PageProps {
  params: {
    org_slug: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  const { groups, isLoading } = useUser();
  const { org_slug } = params;

  const activeGroup = useMemo(() => {
    return groups?.find((g) => g.organizationSlug === org_slug);
  }, [groups, org_slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!activeGroup) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p>Organization not found or you do not have access.</p>
      </div>
    );
  }

  return <MapPage cohortId={activeGroup.id} />;
};

export default Page;
