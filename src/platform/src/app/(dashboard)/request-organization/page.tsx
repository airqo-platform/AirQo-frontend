'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AqCheckCircle } from '@airqo/icons-react';
import { countries } from 'countries-list';
import { useCreateOrganizationRequest } from '@/shared/hooks';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { TextInput } from '@/shared/components/ui/text-input';
import SelectField from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { toast } from '@/shared/components/ui/toast';
import Dialog from '@/shared/components/ui/dialog';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { validateEmail } from '@/shared/lib/validators';

const ORGANIZATION_TYPES = [
  { value: 'government', label: 'Government' },
  { value: 'academic', label: 'Academic / Research' },
  { value: 'ngo', label: 'NGO / Non-profit' },
  { value: 'private', label: 'Private Sector' },
  { value: 'other', label: 'Other' },
] as const;

interface FormData {
  city: string;
  project_name: string;
  funder_partner: string;
  contact_email: string;
  contact_name: string;
  use_case: string;
  country: string;
  organization_type: (typeof ORGANIZATION_TYPES)[number]['value'];
}

interface ValidationErrors {
  city?: string;
  project_name?: string;
  contact_email?: string;
  contact_name?: string;
  use_case?: string;
  country?: string;
}

const INITIAL_FORM: FormData = {
  city: '',
  project_name: '',
  funder_partner: '',
  contact_email: '',
  contact_name: '',
  use_case: '',
  country: '',
  organization_type: 'government',
};

const RequestOrganizationPage = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { trigger: createRequest, isMutating: isCreating } =
    useCreateOrganizationRequest();

  const countryOptions = useMemo(() => {
    return Object.values(countries)
      .map(c => ({ value: c.name, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  useEffect(() => {
    if (!formData.contact_email.trim()) {
      setValidationErrors(prev => ({ ...prev, contact_email: undefined }));
      return;
    }

    const emailError = validateEmail(formData.contact_email);
    setValidationErrors(prev => ({
      ...prev,
      contact_email: emailError || undefined,
    }));
  }, [formData.contact_email]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setValidationErrors(prev => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSelectChange = (e: {
    target: { value: unknown; name?: string };
  }) => {
    const { value, name } = e.target;
    if (!name || typeof value !== 'string') return;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setValidationErrors(prev => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const nextErrors: ValidationErrors = {};

    if (!formData.project_name.trim()) {
      nextErrors.project_name = 'Project name is required';
    }

    if (!formData.city.trim()) {
      nextErrors.city = 'City is required';
    }

    if (!formData.country.trim()) {
      nextErrors.country = 'Country is required';
    }

    if (!formData.contact_name.trim()) {
      nextErrors.contact_name = 'Contact name is required';
    }

    if (!formData.contact_email.trim()) {
      nextErrors.contact_email = 'Email is required';
    } else {
      const emailError = validateEmail(formData.contact_email);
      if (emailError) {
        nextErrors.contact_email = emailError;
      }
    }

    if (!formData.use_case.trim()) {
      nextErrors.use_case = 'Use case is required';
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const completedRequiredFields = useMemo(() => {
    const checks = [
      !!formData.project_name.trim(),
      !!formData.city.trim(),
      !!formData.country.trim(),
      !!formData.contact_name.trim(),
      !!formData.contact_email.trim() && !validationErrors.contact_email,
      !!formData.use_case.trim(),
      !!formData.organization_type.trim(),
    ];

    return checks.filter(Boolean).length;
  }, [formData, validationErrors.contact_email]);

  const isFormValid = completedRequiredFields === 7;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        'Missing required details',
        'Please complete the required fields before submitting.'
      );
      return;
    }

    try {
      const submitData = {
        city: formData.city.trim(),
        project_name: formData.project_name.trim(),
        contact_email: formData.contact_email.trim(),
        contact_name: formData.contact_name.trim(),
        use_case: formData.use_case.trim(),
        country: formData.country.trim(),
        organization_type: formData.organization_type,
        ...(formData.funder_partner.trim()
          ? { funder_partner: formData.funder_partner.trim() }
          : {}),
      };

      await createRequest(submitData);
      setShowSuccessDialog(true);
      setFormData(INITIAL_FORM);
      setValidationErrors({});
    } catch (error) {
      toast.error('Submission failed', getUserFriendlyErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:px-4">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-6">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Request Organization Access
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              Share your project details so we can provision your organization
              workspace. Reviews are typically completed within 2-3 business
              days.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Project Details</CardTitle>
                  <CardDescription>
                    Enter the details for the project that needs onboarding.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Project Name"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Clean Air Monitor"
                    error={validationErrors.project_name}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Kampala"
                      error={validationErrors.city}
                    />

                    <SelectField
                      label="Organization Type"
                      name="organization_type"
                      value={formData.organization_type}
                      onChange={handleSelectChange}
                      required
                    >
                      {ORGANIZATION_TYPES.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SelectField
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleSelectChange}
                      required
                      error={validationErrors.country}
                      placeholder="Select a country"
                    >
                      <option value="">Select a country</option>
                      {countryOptions.map(c => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </SelectField>

                    <Input
                      label="Funder / Partner"
                      name="funder_partner"
                      value={formData.funder_partner}
                      onChange={handleInputChange}
                      placeholder="WorldBank (optional)"
                      description="Optional: sponsor or implementation partner."
                    />
                  </div>

                  <TextInput
                    label="Use Case"
                    name="use_case"
                    value={formData.use_case}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Describe what you are monitoring, who will use the data, and expected impact."
                    error={validationErrors.use_case}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Primary Contact</CardTitle>
                  <CardDescription>
                    We will use these details for onboarding updates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="Contact Name"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Jane Doe"
                      error={validationErrors.contact_name}
                    />

                    <Input
                      label="Contact Email"
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      required
                      placeholder="contact@example.com"
                      error={validationErrors.contact_email}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isCreating || !isFormValid}
                  loading={isCreating}
                  className="min-w-[220px]"
                >
                  {isCreating ? 'Submitting Request...' : 'Submit Request'}
                </Button>
              </div>
            </form>

            <Card className="h-fit lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="text-xl">Submission Checklist</CardTitle>
                <CardDescription>
                  Required fields completed: {completedRequiredFields}/7
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span>Project name</span>
                    {formData.project_name.trim() ? (
                      <AqCheckCircle className="h-4 w-4 text-green-600" />
                    ) : null}
                  </li>
                  <li className="flex items-center justify-between">
                    <span>City and country</span>
                    {formData.city.trim() && formData.country.trim() ? (
                      <AqCheckCircle className="h-4 w-4 text-green-600" />
                    ) : null}
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Organization type</span>
                    {formData.organization_type.trim() ? (
                      <AqCheckCircle className="h-4 w-4 text-green-600" />
                    ) : null}
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Use case</span>
                    {formData.use_case.trim() ? (
                      <AqCheckCircle className="h-4 w-4 text-green-600" />
                    ) : null}
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Primary contact</span>
                    {formData.contact_name.trim() &&
                    formData.contact_email.trim() &&
                    !validationErrors.contact_email ? (
                      <AqCheckCircle className="h-4 w-4 text-green-600" />
                    ) : null}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog
          isOpen={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          title="Request Submitted Successfully"
          subtitle="We'll review your application shortly"
          icon={AqCheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          size="md"
          primaryAction={{
            label: 'Got it',
            onClick: () => setShowSuccessDialog(false),
            variant: 'filled',
          }}
        >
          <div className="text-sm text-muted-foreground">
            <p>
              Request submitted. Our team will review it and respond to the
              contact email provided in this form.
            </p>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default RequestOrganizationPage;
