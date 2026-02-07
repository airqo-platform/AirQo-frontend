'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  AqCheckCircle,
  AqXCircle,
  AqUpload01,
  AqImage01,
} from '@airqo/icons-react';
import Image from 'next/image';
import { countries } from 'countries-list';
import {
  useCreateOrganizationRequest,
  useCheckSlugAvailability,
} from '@/shared/hooks';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { TextInput } from '@/shared/components/ui/text-input';
import SelectField from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { PhoneNumberInput } from '@/shared/components/ui/phone-input';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { toast } from '@/shared/components/ui/toast';
import Dialog from '@/shared/components/ui/dialog';
import { uploadToCloudinary } from '@/shared/utils/cloudinaryUpload';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import {
  validateEmail,
  validateSlug,
  validatePhone,
  generateSlug,
} from '@/shared/lib/validators';

interface FormData {
  organization_name: string;
  organization_slug: string;
  contact_email: string;
  contact_name: string;
  contact_phone: string;
  use_case: string;
  organization_type: string;
  country: string;
  branding_settings: {
    logo_url: string;
    primary_color: string;
    secondary_color: string;
  };
}

interface SlugCheckState {
  status: 'idle' | 'checking' | 'available' | 'unavailable' | 'error';
  message?: string;
}

const RequestOrganizationPage = () => {
  const [formData, setFormData] = useState<FormData>({
    organization_name: '',
    organization_slug: '',
    contact_email: '',
    contact_name: '',
    contact_phone: '',
    use_case: '',
    organization_type: 'government',
    country: '',
    branding_settings: {
      logo_url: '',
      primary_color: '#004080',
      secondary_color: '#FFFFFF',
    },
  });

  const [slugCheck, setSlugCheck] = useState<SlugCheckState>({
    status: 'idle',
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Country options for dropdown
  const countryOptions = useMemo(() => {
    return Object.values(countries)
      .map(c => ({ value: c.name, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    organization_name?: string;
    organization_slug?: string;
    contact_email?: string;
    contact_name?: string;
    contact_phone?: string;
    use_case?: string;
    country?: string;
  }>({});

  const { trigger: createRequest, isMutating: isCreating } =
    useCreateOrganizationRequest();

  const { trigger: checkSlug } = useCheckSlugAvailability();

  // Debounced slug checking
  const debouncedSlugCheck = useCallback(
    async (slug: string) => {
      if (!slug || slug.length < 3) {
        setSlugCheck({ status: 'idle' });
        return;
      }

      setSlugCheck({ status: 'checking' });

      try {
        const current = slug;
        const response = await checkSlug({ slug: current });
        // Ignore stale results
        if (current !== formData.organization_slug) return;
        setSlugCheck({
          status: response.available ? 'available' : 'unavailable',
          message: response.available
            ? 'Slug is available!'
            : 'Slug is not available',
        });
      } catch {
        if (slug !== formData.organization_slug) return;
        setSlugCheck({
          status: 'error',
          message: 'Failed to check slug availability',
        });
      }
    },
    [checkSlug, formData.organization_slug]
  );

  // Real-time validation effects
  useEffect(() => {
    const error = validateEmail(formData.contact_email);
    setValidationErrors(prev => ({
      ...prev,
      contact_email: error || undefined,
    }));
  }, [formData.contact_email]);

  useEffect(() => {
    if (formData.organization_slug.trim()) {
      const error = validateSlug(formData.organization_slug);
      setValidationErrors(prev => ({
        ...prev,
        organization_slug: error || undefined,
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, organization_slug: undefined }));
    }
  }, [formData.organization_slug]);

  useEffect(() => {
    if (formData.contact_phone) {
      const error = validatePhone(formData.contact_phone);
      setValidationErrors(prev => ({
        ...prev,
        contact_phone: error || undefined,
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, contact_phone: undefined }));
    }
  }, [formData.contact_phone]);

  // Real-time slug checking with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSlugCheck(formData.organization_slug);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.organization_slug, debouncedSlugCheck]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (e: {
    target: { value: unknown; name?: string };
  }) => {
    const { value, name } = e.target;
    if (name && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClearLogo = () => {
    setSelectedLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview('');
    // Clear any existing URL from form data
    setFormData(prev => ({
      ...prev,
      branding_settings: {
        ...prev.branding_settings,
        logo_url: '',
      },
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhoneChange = (phone: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      contact_phone: phone || '',
    }));
  };

  const handleGenerateSlug = () => {
    if (!formData.organization_name.trim()) {
      toast.warning(
        'Organization name required',
        'Please enter an organization name first to generate a slug.'
      );
      return;
    }

    const generatedSlug = generateSlug(formData.organization_name);
    setFormData(prev => ({ ...prev, organization_slug: generatedSlug }));
    toast.success(
      'Slug generated',
      'Slug has been generated from organization name.'
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        'Invalid file type',
        'Please select a valid image file (PNG, JPG, GIF, or SVG).'
      );
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File too large', 'Please select an image smaller than 5MB.');
      return;
    }

    setSelectedLogoFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    // Revoke previous URL if any
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(previewUrl);

    toast.success(
      'Logo selected',
      'Logo has been selected and will be uploaded when you submit the form.'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate slug availability
    if (slugCheck.status !== 'available') {
      toast.error(
        'Invalid slug',
        'Please ensure your organization slug is available.'
      );
      return;
    }

    setLogoUploading(true);

    try {
      let logoUrl = '';

      // Upload logo if selected
      if (selectedLogoFile) {
        const result = await uploadToCloudinary(selectedLogoFile, {
          folder: 'organization_profiles',
          tags: ['organization', 'logo'],
        });
        logoUrl = result.secure_url;
      }

      // Prepare form data with uploaded logo URL
      const submitData = {
        ...formData,
        branding_settings: {
          ...formData.branding_settings,
          logo_url: logoUrl,
        },
      };

      // Submit organization request
      await createRequest(submitData);

      // Show success dialog
      setShowSuccessDialog(true);

      // Reset form
      setFormData({
        organization_name: '',
        organization_slug: '',
        contact_email: '',
        contact_name: '',
        contact_phone: '',
        use_case: '',
        organization_type: 'government',
        country: '',
        branding_settings: {
          logo_url: '',
          primary_color: '#004080',
          secondary_color: '#FFFFFF',
        },
      });
      setSelectedLogoFile(null);
      setLogoPreview('');
      setSlugCheck({ status: 'idle' });
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error('Submission failed', errorMessage);
    } finally {
      setLogoUploading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.organization_name.trim() &&
      formData.organization_slug.trim() &&
      formData.contact_email.trim() &&
      formData.contact_name.trim() &&
      formData.contact_phone.trim() &&
      formData.use_case.trim() &&
      formData.country.trim() &&
      slugCheck.status === 'available'
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto md:px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Request Organization
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill out the form below to request creation of a new organization.
            Our team will review your request and get back to you within 2-3
            business days.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Organization Name"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter organization name"
                />

                <SelectField
                  label="Organization Type"
                  name="organization_type"
                  value={formData.organization_type}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="government">Government</option>
                  <option value="academic">Academic/Research</option>
                  <option value="ngo">NGO/Non-profit</option>
                  <option value="private">Private Sector</option>
                  <option value="other">Other</option>
                </SelectField>

                <SelectField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleSelectChange}
                  required
                  placeholder="Select a country"
                >
                  <option value="">Select a country</option>
                  {countryOptions.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </SelectField>
              </div>

              {/* Organization Slug Section */}
              <div className="space-y-3">
                <div className="flex flex-row items-center justify-center gap-3">
                  <div className="flex-1">
                    <Input
                      label="Organization Slug"
                      name="organization_slug"
                      value={formData.organization_slug}
                      onChange={handleInputChange}
                      required
                      placeholder="organization-slug"
                      description="This will be used in your organization's URL. Only lowercase letters, numbers, and hyphens allowed. Example: my-organization-name"
                      error={validationErrors.organization_slug}
                    />
                  </div>

                  <div>
                    <Button
                      type="button"
                      variant="outlined"
                      size="md"
                      className="py-3"
                      onClick={handleGenerateSlug}
                    >
                      Generate Slug
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {slugCheck.status === 'checking' && (
                    <>
                      <LoadingSpinner size={16} />
                      <span className="text-muted-foreground">
                        Checking availability...
                      </span>
                    </>
                  )}
                  {slugCheck.status === 'available' && (
                    <>
                      <AqCheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">
                        {slugCheck.message}
                      </span>
                    </>
                  )}
                  {slugCheck.status === 'unavailable' && (
                    <>
                      <AqXCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">{slugCheck.message}</span>
                    </>
                  )}
                  {slugCheck.status === 'error' && (
                    <>
                      <AqXCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">{slugCheck.message}</span>
                    </>
                  )}
                </div>
              </div>

              <TextInput
                label="Use Case"
                name="use_case"
                value={formData.use_case}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Describe how you plan to use this organization platform..."
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Contact Name"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />

                <Input
                  label="Contact Email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  required
                  placeholder="contact@organization.com"
                  error={validationErrors.contact_email}
                />
              </div>

              <div className="max-w-md">
                <PhoneNumberInput
                  label="Contact Phone"
                  value={formData.contact_phone}
                  onChange={handlePhoneChange}
                  required
                  placeholder="Enter phone number"
                  error={validationErrors.contact_phone}
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Branding Settings (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Image preview + upload actions */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Organization Logo
                  </label>

                  <div className="bg-card border rounded-lg p-3 flex flex-col items-center gap-3">
                    {logoPreview ? (
                      <div className="w-full flex flex-col items-center">
                        <div className="w-36 h-36 rounded-lg overflow-hidden border bg-white shadow-sm">
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            width={144}
                            height={144}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        </div>

                        <div className="flex gap-2 mt-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.svg"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outlined"
                            size="sm"
                            Icon={AqUpload01}
                            onClick={handleLogoUploadClick}
                          >
                            Change
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearLogo}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center">
                        <div className="w-36 h-36 rounded-lg border-2 border-dashed border-muted-foreground flex items-center justify-center bg-muted/10">
                          <AqImage01 className="w-9 h-9 text-muted-foreground" />
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.svg"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="filled"
                          size="sm"
                          Icon={AqUpload01}
                          onClick={handleLogoUploadClick}
                          className="mt-2"
                        >
                          Upload Logo
                        </Button>

                        <p className="text-xs text-muted-foreground mt-2">
                          PNG, JPG, GIF, or SVG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Colors and preview */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name="branding_settings.primary_color"
                        value={formData.branding_settings.primary_color}
                        onChange={handleInputChange}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <TextInput
                        name="branding_settings.primary_color"
                        value={formData.branding_settings.primary_color}
                        onChange={handleInputChange}
                        className="flex-1"
                        placeholder="#004080"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name="branding_settings.secondary_color"
                        value={formData.branding_settings.secondary_color}
                        onChange={handleInputChange}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <TextInput
                        name="branding_settings.secondary_color"
                        value={formData.branding_settings.secondary_color}
                        onChange={handleInputChange}
                        className="flex-1"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* Live badge preview */}
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Live Preview
                    </label>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded flex items-center justify-center border"
                        style={{
                          background: formData.branding_settings.primary_color,
                        }}
                      >
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            alt="logo small"
                            width={36}
                            height={36}
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <AqImage01 className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Example Organization
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Colors and logo preview for quick check
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              size="lg"
              disabled={isCreating || logoUploading || !isFormValid()}
              loading={isCreating || logoUploading}
              className="min-w-[200px]"
            >
              {logoUploading
                ? 'Uploading Logo...'
                : isCreating
                  ? 'Submitting Request...'
                  : 'Submit Request'}
            </Button>
          </div>
        </form>

        {/* Success Dialog */}
        <Dialog
          isOpen={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          title="Request Submitted Successfully"
          subtitle="Check your email for next steps"
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
              Your organization request has been submitted for review. Our team
              will review your application and send you an email with the next
              steps.
            </p>
            <p className="mt-3">
              Please check your inbox at{' '}
              <span className="font-medium text-foreground">
                {formData.contact_email || 'your email'}
              </span>{' '}
              for updates.
            </p>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default RequestOrganizationPage;
