'use client';

import { useRouter } from 'next/navigation';
import CardWrapper from '@/common/components/CardWrapper';
import { CreateOrganizationForm } from '@/common/features/create-organization';

/**
 * CreateOrganizationPage Component
 *
 * A beautiful page for requesting organization access.
 * Uses the existing create-organization feature components.
 */
const CreateOrganizationPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate to user home page after successful submission
    router.push('/user/Home');
  };

  const handleCancel = () => {
    // Navigate back to the previous page
    router.push('/user/Home');
  };
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-4">
            Join the AirQo Platform
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-2xl mx-auto">
            Request access for your organization to start monitoring air quality
            and accessing environmental data insights.
          </p>
        </div>

        {/* Form Container */}
        <CardWrapper className="bg-card dark:bg-card-dark shadow-lg border border-border dark:border-border-dark">
          <CreateOrganizationForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            showCancelButton={true}
          />
        </CardWrapper>
      </div>
    </div>
  );
};

export default CreateOrganizationPage;
