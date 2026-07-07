'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { PermissionGuard } from '@/shared/components';
import type {
  CreateSurveyRequest,
  Survey,
  UpdateSurveyRequest,
} from '@/shared/types/api';
import { surveyService } from '@/shared/services';
import SurveyForm from '../components/SurveyForm';

const SurveyCreatePage: React.FC = () => {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const handleCancel = useCallback(() => {
    router.push('/system/surveys');
  }, [router]);

  const handleSubmit = useCallback(
    async (payload: CreateSurveyRequest | UpdateSurveyRequest) => {
      return surveyService.createSurvey(payload as CreateSurveyRequest);
    },
    []
  );

  const handleSuccess = useCallback(
    async (survey: Survey) => {
      await mutate('system/surveys');

      if (survey?._id) {
        router.replace(`/system/surveys/${survey._id}`);
        return;
      }

      router.replace('/system/surveys');
    },
    [mutate, router]
  );

  return (
    <PermissionGuard
      requireAirQoSuperAdmin={true}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need the AIRQO_SUPER_ADMIN role with an @airqo.net email to create surveys."
    >
      <SurveyForm
        mode="create"
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
      />
    </PermissionGuard>
  );
};

export default SurveyCreatePage;
