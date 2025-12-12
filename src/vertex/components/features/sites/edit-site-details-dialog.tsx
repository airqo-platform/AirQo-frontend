"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField } from "@/components/ui/form";
import { useUpdateSiteDetails } from "@/core/hooks/useSites";
import { toast } from "sonner";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { useEffect } from "react";
import { Site } from "@/app/types/sites";

const siteFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  latitude: z.string().refine((val) => {
    const n = Number(val);
    return Number.isFinite(n) && n >= -90 && n <= 90;
  }, { message: "Latitude must be between -90 and 90." }),
  longitude: z.string().refine((val) => {
    const n = Number(val);
    return Number.isFinite(n) && n >= -180 && n <= 180;
  }, { message: "Longitude must be between -180 and 180." }),
  parish: z.string().optional(),
  subCounty: z.string().optional(),
  district: z.string().optional(),
  region: z.string().optional(),
  altitude: z.string().optional().refine((val) => {
    if (val === undefined || val === "") return true;
    return Number.isFinite(Number(val));
  }, { message: "Please enter a valid altitude" }),
  search_name: z.string().optional(),
  location_name: z.string().optional(),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

interface EditSiteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site;
  section: "general" | "mobile";
}

export function EditSiteDetailsDialog({
  open,
  onOpenChange,
  site,
  section,
}: EditSiteDetailsDialogProps) {
  const { mutate: updateSite, isPending } = useUpdateSiteDetails();

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
  });

  useEffect(() => {
    if (site && open) {
      form.reset({
        name: site.name || "",
        description: site.description || "",
        latitude: site.latitude?.toString() || "",
        longitude: site.longitude?.toString() || "",
        parish: site.parish || "",
        subCounty: site.sub_county || "",
        district: site.district || "",
        region: site.region || "",
        altitude: site.altitude?.toString() || "",
        search_name: site.search_name || "",
        location_name: site.location_name || "",
      });
    }
  }, [site, open, form]);

  function onSubmit(values: SiteFormValues) {
    const dirtyFields = form.formState.dirtyFields;

    const fieldMapping = {
      name: "name",
      description: "description",
      latitude: "latitude",
      longitude: "longitude",
      parish: "parish",
      subCounty: "sub_county",
      district: "district",
      region: "region",
      altitude: "altitude",
      search_name: "search_name",
      location_name: "location_name",
    };

    const numericFields = new Set(["latitude", "longitude", "altitude"]);
    const transformedData = Object.entries(fieldMapping).reduce(
      (acc, [formField, apiField]) => {
        if (dirtyFields[formField as keyof typeof dirtyFields]) {
          const v = values[formField as keyof SiteFormValues];
          acc[apiField] = numericFields.has(formField)
            ? v
              ? Number(v as string)
              : undefined
            : (v as string | undefined);
        }
        return acc;
      },
      {} as Record<string, string | number | undefined>
    );

    if (Object.keys(transformedData).length === 0) {
      toast.error("No fields have been modified");
      return;
    }

    updateSite(
      { siteId: site._id, data: transformedData },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <ReusableDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={section === "general" ? "Edit Site Details" : "Edit Mobile App Details"}
      size="3xl"
      primaryAction={{
        label: isPending ? "Saving..." : "Save Changes",
        onClick: form.handleSubmit(onSubmit),
        disabled: isPending,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: () => onOpenChange(false),
        variant: "outline",
        disabled: isPending,
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4  p-1">
          {section === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Site Name *"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Description"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="latitude"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Latitude *"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Longitude *"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="parish"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Parish"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="subCounty"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Sub County"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="District"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Region"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="altitude"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Altitude"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
          )}

          {section === "mobile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="search_name"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Editable Name"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="location_name"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Editable Description"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
          )}
        </form>
      </Form>
    </ReusableDialog>
  );
}
