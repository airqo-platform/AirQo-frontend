'use client';

import React, { useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { PermissionGuard } from '@/shared/components';
import { Card, LoadingState } from '@/shared/components/ui';
import type {
  CreateSurveyRequest,
  Survey,
  UpdateSurveyRequest,
} from '@/shared/types/api';
import { surveyService } from '@/shared/services';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import SurveyForm from '../../components/SurveyForm';

const SurveyEditPage: React.FC = () => {
  const params = useParams<{ surveyId: string }>();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const surveyId = params?.surveyId;

  const {
    data: survey,
    error,
    isLoading,
    mutate: refreshSurvey,
  } = useSWR(
    surveyId ? `system/surveys/${surveyId}` : null,
    () => surveyService.getSurveyById(surveyId as string),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (!surveyId) {
      router.push('/system/surveys');
    }
  }, [router, surveyId]);

  const handleCancel = useCallback(() => {
    router.push(`/system/surveys/${surveyId}`);
  }, [router, surveyId]);

  const handleSubmit = useCallback(
    async (payload: CreateSurveyRequest | UpdateSurveyRequest) => {
      return surveyService.updateSurvey(
        surveyId as string,
        payload as UpdateSurveyRequest
      );
    },
    [surveyId]
  );

  const handleSuccess = useCallback(
    async (updatedSurvey: Survey) => {
      await Promise.allSettled([
        mutate('system/surveys'),
        mutate(`system/surveys/${updatedSurvey._id}`),
        refreshSurvey(),
      ]);

      router.replace(`/system/surveys/${updatedSurvey._id}`);
    },
    [mutate, refreshSurvey, router]
  );

  const surveyErrorMessage = error
    ? getUserFriendlyErrorMessage(error)
    : 'Survey not found.';

  return (
    <PermissionGuard
      requireAirQoSuperAdmin={true}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need the AIRQO_SUPER_ADMIN role with an @airqo.net email to edit surveys."
    >
      {isLoading ? (
        <LoadingState
          className="min-h-[calc(100vh-220px)]"
          text="Loading survey editor..."
        />
      ) : error || !survey ? (
        <Card className="p-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{surveyErrorMessage}</p>
            <button
              type="button"
              onClick={() => router.push('/system/surveys')}
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to surveys
            </button>
          </div>
        </Card>
      ) : (
        <SurveyForm
          mode="edit"
          initialSurvey={survey}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          onSuccess={handleSuccess}
        />
      )}
    </PermissionGuard>
  );
};

export default SurveyEditPage;
