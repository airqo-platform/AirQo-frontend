'use client';

import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    AqCheckCircle,
    AqXCircle,
    AqImage01,
} from '@airqo/icons-react';
import Image from 'next/image';
import countryList from 'react-select-country-list';
import {
    useCreateOrganizationRequest,
    useCheckSlugAvailability,
} from '@/core/hooks/useGroups';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cloudinaryImageUpload } from '@/core/apis/cloudinary';
import { generateSlug } from '@/lib/validators';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import ReusableSelectInput from '@/components/shared/select/ReusableSelectInput';
import ReusableButton from '@/components/shared/button/ReusableButton';
import ReusableToast from '@/components/shared/toast/ReusableToast';

// Define Zod Schema
const requestOrganizationSchema = z.object({
    organization_name: z.string().min(1, 'Organization name is required'),
    organization_slug: z
        .string()
        .min(1, 'Slug is required')
        .min(3, 'Slug must be at least 3 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase, numbers, or hyphens only'),
    contact_email: z.string().min(1, 'Email is required').email('Invalid email address'),
    contact_name: z.string().min(1, 'Contact name is required'),
    contact_phone: z.string().min(1, 'Phone number is required'),
    use_case: z.string().min(1, 'Use case is required').min(1, 'Use case is required'),
    organization_type: z.string().min(1, 'Organization type is required'),
    country: z.string().min(1, 'Country is required'),
    branding_settings: z.object({
        logo_url: z.string().optional(),
        primary_color: z.string().min(1, 'Primary color is required'),
        secondary_color: z.string().min(1, 'Secondary color is required'),
    }),
});

type RequestOrganizationFormData = z.infer<typeof requestOrganizationSchema>;

interface SlugCheckState {
    status: 'idle' | 'checking' | 'available' | 'unavailable' | 'error';
    message?: string;
}

const RequestOrganizationPage = () => {
    // Form initialization
    const form = useForm<RequestOrganizationFormData>({
        resolver: zodResolver(requestOrganizationSchema),
        defaultValues: {
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
        },
    });

    const [slugCheck, setSlugCheck] = useState<SlugCheckState>({
        status: 'idle',
    });
    const [logoUploading, setLogoUploading] = useState(false);
    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Watch values for side effects
    const watchedSlug = form.watch('organization_slug');
    const brandingPrimary = form.watch('branding_settings.primary_color');
    const brandingSecondary = form.watch('branding_settings.secondary_color');

    // Country options for dropdown
    const countryOptions = useMemo(() => {
        return countryList().getData();
    }, []);

    const { mutateAsync: createRequest, isPending: isCreating } =
        useCreateOrganizationRequest();

    const { mutateAsync: checkSlug } = useCheckSlugAvailability();

    // Debounced slug checking
    const debouncedSlugCheck = useCallback(
        async (slug: string) => {
            if (!slug || slug.length < 3) {
                setSlugCheck({ status: 'idle' });
                return;
            }

            setSlugCheck({ status: 'checking' });

            try {
                const response = await checkSlug(slug);

                // Ignore stale results if slug changed quickly
                if (slug !== form.getValues('organization_slug')) return;

                setSlugCheck({
                    status: response.available ? 'available' : 'unavailable',
                    message: response.available
                        ? 'Slug is available!'
                        : 'Slug is not available',
                });

                // If unavailable, set form error
                if (!response.available) {
                    form.setError('organization_slug', { message: 'Slug is already taken' });
                } else {
                    form.clearErrors('organization_slug');
                }

            } catch (err) {
                if (slug !== form.getValues('organization_slug')) return;
                setSlugCheck({
                    status: 'error',
                    message: 'Failed to check slug availability',
                });
            }
        },
        [checkSlug, form]
    );

    // Real-time slug checking with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSlugCheck(watchedSlug);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [watchedSlug, debouncedSlugCheck]);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
        };
    }, [logoPreview]);

    const handleClearLogo = () => {
        setSelectedLogoFile(null);
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview('');
        form.setValue('branding_settings.logo_url', '');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleLogoUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleGenerateSlug = () => {
        const name = form.getValues('organization_name');
        if (!name.trim()) {
            ReusableToast({
                message: 'Organization name required',
                type: 'ERROR',
            });
            form.trigger('organization_name');
            return;
        }

        const generatedSlug = generateSlug(name);
        form.setValue('organization_slug', generatedSlug, { shouldValidate: true, shouldDirty: true });
        ReusableToast({
            message: 'Slug generated',
            type: 'SUCCESS',
        });
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
            ReusableToast({
                message: 'Invalid file type',
                type: 'ERROR',
            });
            return;
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            ReusableToast({
                message: 'File too large',
                type: 'ERROR',
            });
            return;
        }

        setSelectedLogoFile(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        // Revoke previous URL if any
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(previewUrl);

        ReusableToast({
            message: 'Logo selected',
            type: 'SUCCESS',
        });
    };

    const onSubmit = async (data: RequestOrganizationFormData) => {
        // Validate slug availability final check
        if (slugCheck.status === 'unavailable') {
            form.setError('organization_slug', { message: 'Slug is already taken' });
            return;
        }

        if (slugCheck.status === 'checking') {
            ReusableToast({
                message: 'Please wait for slug check to complete',
                type: 'INFO',
            });
            return;
        }

        setLogoUploading(true);

        try {
            let logoUrl = '';

            // Upload logo if selected
            if (selectedLogoFile) {
                const logoFormData = new FormData();
                logoFormData.append('file', selectedLogoFile);
                logoFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || 'airqo_vertex');
                logoFormData.append('folder', 'organization_profiles');
                logoFormData.append('tags', 'organization');
                logoFormData.append('tags', 'logo');

                const result = await cloudinaryImageUpload(logoFormData);
                if (result.error) throw new Error(result.error.message || 'Upload failed');
                logoUrl = result.secure_url;
            }

            // Update data with logo URL
            const submitData = {
                ...data,
                branding_settings: {
                    ...data.branding_settings,
                    logo_url: logoUrl,
                },
            };

            // Submit organization request
            await createRequest(submitData);

            ReusableToast({
                message: 'Your organization request has been submitted for review.',
                type: 'SUCCESS',
            });

            // Reset form
            form.reset();
            handleClearLogo();
            setSlugCheck({ status: 'idle' });
        } catch (error: any) {
            ReusableToast({
                message: error.message || 'Failed to submit request',
                type: 'ERROR',
            });
        } finally {
            setLogoUploading(false);
        }
    };

    return (
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

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Organization Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Organization Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="organization_name"
                                    render={({ field, fieldState }) => (
                                        <ReusableInputField
                                            label="Organization Name"
                                            placeholder="Enter organization name"
                                            required
                                            {...field}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="organization_type"
                                    render={({ field, fieldState }) => (
                                        <ReusableSelectInput
                                            label="Organization Type"
                                            placeholder="Select Type"
                                            required
                                            {...field}
                                            onChange={(e: any) => {
                                                const val = e.target ? e.target.value : e;
                                                field.onChange(val);
                                            }}
                                            error={fieldState.error?.message}
                                        >
                                            <option value="government">Government</option>
                                            <option value="academic">Academic/Research</option>
                                            <option value="ngo">NGO/Non-profit</option>
                                            <option value="private">Private Sector</option>
                                            <option value="other">Other</option>
                                        </ReusableSelectInput>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field, fieldState }) => (
                                        <ReusableSelectInput
                                            label="Country"
                                            placeholder="Select a country"
                                            required
                                            {...field}
                                            onChange={(e: any) => {
                                                const val = e.target ? e.target.value : e;
                                                field.onChange(val);
                                            }}
                                            error={fieldState.error?.message}
                                        >
                                            {countryOptions.map((option) => (
                                                <option key={option.value} value={option.label}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </ReusableSelectInput>
                                    )}
                                />
                            </div>

                            {/* Organization Slug Section */}
                            <div className="space-y-3">
                                <div className="flex flex-row items-end gap-3">
                                    <FormField
                                        control={form.control}
                                        name="organization_slug"
                                        render={({ field, fieldState }) => (
                                            <ReusableInputField
                                                containerClassName="flex-1"
                                                label="Organization Slug"
                                                placeholder="organization-slug"
                                                description="This will be used in your URL. Lowercase, numbers, hyphens only."
                                                required
                                                {...field}
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />

                                    <div>
                                        <ReusableButton
                                            type="button"
                                            variant="outlined"
                                            onClick={handleGenerateSlug}
                                            className="mb-[1.5rem]" // Align with input
                                        >
                                            Generate Slug
                                        </ReusableButton>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm h-5 pl-1">
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

                            <FormField
                                control={form.control}
                                name="use_case"
                                render={({ field, fieldState }) => (
                                    <ReusableInputField
                                        as="textarea"
                                        label="Use Case"
                                        placeholder="Describe how you plan to use this organization platform..."
                                        rows={4}
                                        required
                                        {...field}
                                        error={fieldState.error?.message}
                                    />
                                )}
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
                                <FormField
                                    control={form.control}
                                    name="contact_name"
                                    render={({ field, fieldState }) => (
                                        <ReusableInputField
                                            label="Contact Name"
                                            placeholder="Enter full name"
                                            required
                                            {...field}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contact_email"
                                    render={({ field, fieldState }) => (
                                        <ReusableInputField
                                            label="Contact Email"
                                            type="email"
                                            placeholder="contact@organization.com"
                                            required
                                            {...field}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div className="max-w-md">
                                <FormField
                                    control={form.control}
                                    name="contact_phone"
                                    render={({ field, fieldState }) => (
                                        <PhoneNumberInput
                                            label="Contact Phone"
                                            placeholder="Enter phone number"
                                            required
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                        />
                                    )}
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
                                                <div className="w-36 h-36 rounded-lg overflow-hidden border bg-white shadow-sm flex items-center justify-center">
                                                    <Image
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        width={144}
                                                        height={144}
                                                        className="object-contain max-h-full max-w-full"
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
                                                    <ReusableButton
                                                        type="button"
                                                        variant="outlined"
                                                        className="py-1 px-3 h-8 text-xs"
                                                        onClick={handleLogoUploadClick}
                                                    >
                                                        Change
                                                    </ReusableButton>

                                                    <ReusableButton
                                                        type="button"
                                                        variant="text"
                                                        className="py-1 px-3 h-8 text-xs"
                                                        onClick={handleClearLogo}
                                                    >
                                                        Remove
                                                    </ReusableButton>
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
                                                <ReusableButton
                                                    type="button"
                                                    variant="filled"
                                                    className="mt-2 py-1 px-3 h-8 text-xs"
                                                    onClick={handleLogoUploadClick}
                                                >
                                                    Upload Logo
                                                </ReusableButton>

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
                                        <div className="flex items-start gap-3">
                                            <FormField
                                                control={form.control}
                                                name="branding_settings.primary_color"
                                                render={({ field }) => (
                                                    <input
                                                        type="color"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="w-12 h-10 rounded border cursor-pointer p-0.5 bg-background mt-1"
                                                    />
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="branding_settings.primary_color"
                                                render={({ field, fieldState }) => (
                                                    <ReusableInputField
                                                        containerClassName="flex-1"
                                                        placeholder="#004080"
                                                        {...field}
                                                        error={fieldState.error?.message}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Secondary Color
                                        </label>
                                        <div className="flex items-start gap-3">
                                            <FormField
                                                control={form.control}
                                                name="branding_settings.secondary_color"
                                                render={({ field }) => (
                                                    <input
                                                        type="color"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="w-12 h-10 rounded border cursor-pointer p-0.5 bg-background mt-1"
                                                    />
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="branding_settings.secondary_color"
                                                render={({ field, fieldState }) => (
                                                    <ReusableInputField
                                                        containerClassName="flex-1"
                                                        placeholder="#FFFFFF"
                                                        {...field}
                                                        error={fieldState.error?.message}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Live badge preview */}
                                    <div className="mt-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Live Preview
                                        </label>
                                        <div className="flex items-center gap-4 border p-3 rounded-lg bg-card">
                                            <div
                                                className="w-12 h-12 rounded flex items-center justify-center border shadow-sm"
                                                style={{
                                                    background: brandingPrimary || '#004080',
                                                }}
                                            >
                                                {logoPreview ? (
                                                    <Image
                                                        src={logoPreview}
                                                        alt="logo small"
                                                        width={36}
                                                        height={36}
                                                        className="object-contain max-h-full max-w-full"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <AqImage01 className="w-6 h-6 text-white mix-blend-difference" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">Organization Name</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                        Admin
                                                    </span>
                                                    <span
                                                        className="h-2 w-2 rounded-full"
                                                        style={{
                                                            background: brandingSecondary || '#FFFFFF',
                                                            border: '1px solid #e5e7eb'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <ReusableButton
                            type="submit"
                            variant="filled"
                            disabled={isCreating || logoUploading}
                            loading={isCreating || logoUploading}
                            className="min-w-[200px] h-11"
                        >
                            {logoUploading
                                ? 'Uploading Logo...'
                                : isCreating
                                    ? 'Submitting...'
                                    : 'Submit Request'}
                        </ReusableButton>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default RequestOrganizationPage;
