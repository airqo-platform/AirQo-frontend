'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { countries } from 'countries-list';
import { Dialog, Input } from '@/shared/components/ui';
import SelectField from '@/shared/components/ui/select';
import { groupDetailsSchema } from '@/shared/lib/validators';
import {
  GROUP_DESCRIPTION_MAX,
  GROUP_INDUSTRY_MAX,
  GROUP_TIMEZONE_MAX,
  GROUP_TITLE_MAX,
  GROUP_WEBSITE_MAX,
} from '@/shared/lib/validation-limits';
import type {
  GroupDetails,
  UpdateGroupDetailsRequest,
} from '@/shared/types/api';

export interface EditOrganizationDialogProps {
  isOpen: boolean;
  group: GroupDetails;
  isSaving: boolean;
  onClose: () => void;
  /** Called with the validated payload (image fields preserved). */
  onSubmit: (details: UpdateGroupDetailsRequest) => void;
}

interface FormState {
  grp_title: string;
  grp_status: string;
  grp_country: string;
  grp_industry: string;
  grp_timezone: string;
  grp_website: string;
  grp_description: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const toFormState = (group: GroupDetails): FormState => ({
  grp_title: group.grp_title ?? '',
  grp_status: group.grp_status || 'ACTIVE',
  grp_country: group.grp_country ?? '',
  grp_industry: group.grp_industry ?? '',
  grp_timezone: group.grp_timezone ?? '',
  grp_website: group.grp_website ?? '',
  grp_description: group.grp_description ?? '',
});

/**
 * Edit form for an organization (System → Organizations detail).
 *
 * Title/description/industry/timezone/website are validated with
 * `groupDetailsSchema` (plus the `GROUP_*_MAX` maxLength hints on the
 * inputs); status and country are free-form fields outside that schema, so
 * they are passed through as-is. Image fields are carried over untouched so
 * a save never clears the organization logo.
 */
const EditOrganizationDialog: React.FC<EditOrganizationDialogProps> = ({
  isOpen,
  group,
  isSaving,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<FormState>(() => toFormState(group));
  const [errors, setErrors] = useState<FormErrors>({});

  // Re-sync only when the dialog is (re)opened: a background revalidation
  // producing a new `group` object must not wipe what the operator typed.
  const groupRef = useRef(group);
  groupRef.current = group;
  useEffect(() => {
    if (isOpen) {
      setForm(toFormState(groupRef.current));
      setErrors({});
    }
  }, [isOpen]);

  const countryOptions = useMemo(
    () =>
      Object.values(countries)
        .map(country => ({ value: country.name, label: country.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const setField = (name: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSaving) return;

    const parsed = groupDetailsSchema.safeParse({
      grp_title: form.grp_title,
      grp_description: form.grp_description,
      grp_industry: form.grp_industry,
      grp_timezone: form.grp_timezone,
      grp_website: form.grp_website,
    });

    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit({
      grp_title: form.grp_title.trim(),
      grp_status: form.grp_status || 'ACTIVE',
      grp_country: form.grp_country,
      grp_industry: form.grp_industry.trim(),
      grp_timezone: form.grp_timezone.trim(),
      grp_website: form.grp_website.trim(),
      grp_description: form.grp_description.trim(),
      // Preserved so a save cannot drop the existing logo.
      grp_image: group.grp_image,
      grp_profile_picture: group.grp_profile_picture,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isSaving ? () => undefined : onClose}
      title="Edit organization"
      subtitle={group.grp_title}
      size="lg"
      maxHeight="max-h-[80vh]"
      preventBackdropClose={isSaving}
      ariaLabel={`Edit organization ${group.grp_title}`}
      primaryAction={{
        label: isSaving ? 'Saving…' : 'Save changes',
        onClick: handleSubmit,
        disabled: isSaving,
        loading: isSaving,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        disabled: isSaving,
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Organization name"
          id="grp_title"
          name="grp_title"
          value={form.grp_title}
          onChange={event => setField('grp_title', event.target.value)}
          error={errors.grp_title}
          maxLength={GROUP_TITLE_MAX}
          required
          disabled={isSaving}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Status"
            id="grp_status"
            name="grp_status"
            value={form.grp_status}
            onChange={event => setField('grp_status', String(event.target.value))}
            disabled={isSaving}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </SelectField>

          <SelectField
            label="Country"
            id="grp_country"
            name="grp_country"
            value={form.grp_country}
            onChange={event => setField('grp_country', String(event.target.value))}
            disabled={isSaving}
            searchable
            searchPlaceholder="Search countries…"
            noOptionsMessage="No countries match"
          >
            <option value="">Select country</option>
            {countryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <Input
            label="Industry"
            id="grp_industry"
            name="grp_industry"
            value={form.grp_industry}
            onChange={event => setField('grp_industry', event.target.value)}
            error={errors.grp_industry}
            maxLength={GROUP_INDUSTRY_MAX}
            disabled={isSaving}
          />

          <Input
            label="Timezone"
            id="grp_timezone"
            name="grp_timezone"
            value={form.grp_timezone}
            onChange={event => setField('grp_timezone', event.target.value)}
            error={errors.grp_timezone}
            maxLength={GROUP_TIMEZONE_MAX}
            disabled={isSaving}
          />
        </div>

        <Input
          label="Website"
          id="grp_website"
          name="grp_website"
          type="url"
          value={form.grp_website}
          onChange={event => setField('grp_website', event.target.value)}
          error={errors.grp_website}
          maxLength={GROUP_WEBSITE_MAX}
          placeholder="https://example.org"
          disabled={isSaving}
        />

        <div className="flex flex-col mb-4">
          <label
            htmlFor="grp_description"
            className="flex items-center mb-2 text-sm text-foreground"
          >
            Description
          </label>
          <textarea
            id="grp_description"
            name="grp_description"
            value={form.grp_description}
            onChange={event => setField('grp_description', event.target.value)}
            maxLength={GROUP_DESCRIPTION_MAX}
            disabled={isSaving}
            rows={4}
            aria-invalid={!!errors.grp_description}
            className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            placeholder="What does this organization do?"
          />
          {errors.grp_description ? (
            <p role="alert" className="mt-1.5 text-xs text-destructive">
              {errors.grp_description}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {form.grp_description.length}/{GROUP_DESCRIPTION_MAX}
            </p>
          )}
        </div>
      </form>
    </Dialog>
  );
};

export default EditOrganizationDialog;
