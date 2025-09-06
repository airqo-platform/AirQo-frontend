"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField } from "@/components/ui/form";
import { useUpdateSiteDetails } from "@/core/hooks/useSites";
import { toast } from "sonner";
import { Site } from "@/core/redux/slices/sitesSlice";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { useEffect } from "react";

const siteFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  latitude: z.string().refine((val) => !isNaN(parseFloat(val)), { message: "Please enter a valid latitude" }),
  longitude: z.string().refine((val) => !isNaN(parseFloat(val)), { message: "Please enter a valid longitude" }),
  parish: z.string().optional(),
  subCounty: z.string().optional(),
  district: z.string().optional(),
  region: z.string().optional(),
  altitude: z.string().optional(),
  search_name: z.string().optional(),
  location_name: z.string().optional(),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

interface EditSiteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site;
}

export function EditSiteDetailsDialog({ open, onOpenChange, site }: EditSiteDetailsDialogProps) {
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

    const transformedData = Object.entries(fieldMapping).reduce((acc, [formField, apiField]) => {
      if (dirtyFields[formField as keyof typeof dirtyFields]) {
        acc[apiField] = values[formField as keyof SiteFormValues];
      }
      return acc;
    }, {} as Record<string, string | undefined>);

    if (Object.keys(transformedData).length === 0) {
      toast.error("No fields have been modified");
      return;
    }

    updateSite(
      { siteId: site._id, data: transformedData },
      {
        onSuccess: () => {
          toast.success("Site details updated successfully");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update site details");
        },
      }
    );
  }

  return (
    <ReusableDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Edit Site"
      subtitle="Make changes to the site details here. Click save when you're done."
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field, fieldState }) => (<ReusableInputField label="Site Name *" {...field} error={fieldState.error?.message} />)} />
            <FormField control={form.control} name="description" render={({ field, fieldState }) => (<ReusableInputField label="Description" {...field} error={fieldState.error?.message} />)} />
            <ReusableInputField label="Network" value={site.network} readOnly />
            <ReusableInputField label="Organization" value={site.network} readOnly />
            <FormField control={form.control} name="latitude" render={({ field, fieldState }) => (<ReusableInputField label="Latitude *" {...field} error={fieldState.error?.message} />)} />
            <FormField control={form.control} name="longitude" render={({ field, fieldState }) => (<ReusableInputField label="Longitude *" {...field} error={fieldState.error?.message} />)} />
            <FormField control={form.control} name="parish" render={({ field, fieldState }) => (<ReusableInputField label="Parish" {...field} error={fieldState.error?.message} />)} />
            <FormField control={form.control} name="subCounty" render={({ field, fieldState }) => (<ReusableInputField label="Sub County" {...field} error={fieldState.error?.message} />)} />
            <FormField control={form.control} name="district" render={({ field, fieldState }) => (<ReusableInputField label="District" {...field} error={fieldState.error?.message} />)} />
            <FormField control={form.control} name="region" render={({ field, fieldState }) => (<ReusableInputField label="Region" {...field} error={fieldState.error?.message} />)} />
            <FormField control={form.control} name="altitude" render={({ field, fieldState }) => (<ReusableInputField label="Altitude" {...field} error={fieldState.error?.message} />)} />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2 mt-4 border-t pt-4">Mobile App Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="search_name" render={({ field, fieldState }) => (<ReusableInputField label="Editable Name" {...field} error={fieldState.error?.message} />)} />
              <FormField control={form.control} name="location_name" render={({ field, fieldState }) => (<ReusableInputField label="Editable Description" {...field} error={fieldState.error?.message} />)} />
            </div>
          </div>
        </form>
      </Form>
    </ReusableDialog>
  );
}
