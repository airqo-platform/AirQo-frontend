import { useForm } from 'react-hook-form';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import { Form, FormField } from '@/components/ui/form';
import { ClaimDeviceFormData, ErrorAlert } from '../claim-device-modal';
import CohortAssignmentBanner from './CohortAssignmentBanner';

const ManualInputStep = ({
  formMethods,
  isPersonalContext,
  isExternalOrg,
  defaultCohort,
  activeGroupTitle,
  error,
}: {
  formMethods: ReturnType<typeof useForm<ClaimDeviceFormData>>;
  isPersonalContext: boolean;
  isExternalOrg: boolean;
  defaultCohort: string | null;
  activeGroupTitle?: string;
  error: string | null;
}) => (
  <Form {...formMethods}>
    <div className="space-y-6">
      {!isPersonalContext && defaultCohort && (
        <CohortAssignmentBanner
          isExternalOrg={isExternalOrg}
          isPersonalContext={isPersonalContext}
          activeGroupTitle={activeGroupTitle}
        />
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Enter the device name and claim token from your shipment — both are printed on the shipping label. Claiming only works for devices AirQo has already shipped to you.
      </p>
      <div className="space-y-4">
        <FormField
          control={formMethods.control}
          name="device_id"
          render={({ field, fieldState }) => (
            <ReusableInputField label="Device Name" placeholder="e.g. airqo_g5241" error={fieldState.error?.message} required {...field} />
          )}
        />
        <FormField
          control={formMethods.control}
          name="claim_token"
          render={({ field, fieldState }) => (
            <ReusableInputField label="Claim Token" placeholder="Enter claim token (e.g. A1B2C3D4)" error={fieldState.error?.message} required {...field} />
          )}
        />
      </div>
      {error && <ErrorAlert message={error} />}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have a claim token?{' '}
        <a
          href="mailto:support@airqo.net"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Contact AirQo support
        </a>
        , or close this dialog and use <span className="font-medium">Import External Device</span> to add a sensor you already own.
      </p>
    </div>
  </Form>
);

export default ManualInputStep;