"use client";

import { useState, useCallback, Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField } from "@/components/ui/form";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { useAppSelector } from "@/core/redux/hooks";
import "leaflet/dist/leaflet.css";
import { useApproximateCoordinates, useCreateSite } from "@/core/hooks/useSites";
import { AqPlus } from "@airqo/icons-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import MiniMap from "@/components/features/mini-map/mini-map";
import { Label } from "@/components/ui/label";

const siteFormSchema = z.object({
  name: z.string().min(2, {
    message: "Site name must be at least 2 characters.",
  }),
  latitude: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    },
    {
      message: "Latitude must be a valid number between -90 and 90",
    }
  ),
  longitude: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    },
    {
      message: "Longitude must be a valid number between -180 and 180",
    }
  ),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

interface CreateSiteFormProps {
  disabled?: boolean;
}

export function CreateSiteForm({ disabled = false }: CreateSiteFormProps) {
  const [open, setOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"siteName" | "coordinates">("siteName");
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const { getApproximateCoordinates, isPending: isOptimizing } = useApproximateCoordinates();
  const { mutate: createSite, isPending: isCreating } = useCreateSite();

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: "",
      latitude: "",
      longitude: "",
    },
  });

  const handleClose = useCallback(() => {
    setOpen(false);
    form.reset();
    setInputMode("siteName");
  }, [form]);

  const onSubmit = useCallback((values: SiteFormValues) => {
      createSite(
        {
          ...values,
          network: activeNetwork?.net_name || "",
        },
        {
          onSuccess: () => {
            ReusableToast({ type: "SUCCESS", message: "Site created successfully" });
            handleClose();
          },
          onError: (error) => {
            ReusableToast({
              type: "ERROR",
              message: error instanceof Error ? error.message : "An error occurred while creating the site.",
            });
          },
        }
      );
    }, [createSite, activeNetwork, handleClose]);

  const handleCoordinateChange = useCallback((lat: string, lng: string) => {
    form.setValue("latitude", lat, { shouldValidate: true });
    form.setValue("longitude", lng, { shouldValidate: true });
  }, [form]);

  const handleSiteNameChange = useCallback((name: string) => {
    form.setValue("name", name, { shouldValidate: true });
  }, [form]);

  const handleOptimizeCoordinates = useCallback(() => {
    const lat = form.getValues("latitude");
    const lng = form.getValues("longitude");
    if (lat && lng) {
      getApproximateCoordinates(
        { latitude: lat, longitude: lng },
        {
          onSuccess: (data) => {
            const { approximate_latitude, approximate_longitude } = data.approximate_coordinates;
            form.setValue("latitude", approximate_latitude.toString());
            form.setValue("longitude", approximate_longitude.toString());
            ReusableToast({ type: "SUCCESS", message: "Coordinates optimized successfully." });
          },
          onError: (error) => {
            ReusableToast({
              type: "ERROR",
              message: error instanceof Error ? error.message : "Failed to optimize coordinates.",
            });
          },
        }
      );
    }
  }, [form, getApproximateCoordinates]);

  const toggleInputMode = useCallback(() => {
    setInputMode((prev) => (prev === "siteName" ? "coordinates" : "siteName"));
  }, []);

  return (
    <>
      <ReusableButton variant="filled" disabled={disabled} onClick={() => setOpen(true)} Icon={AqPlus}>
        Add Site
      </ReusableButton>
      <ReusableDialog
        isOpen={open}
        onClose={handleClose}
        title="Create Site"
        subtitle={`Network: ${activeNetwork?.net_name || "No active network"}`}
        size="2xl"
        primaryAction={{
          label: isCreating ? "Creating..." : "Create Site",
          onClick: form.handleSubmit(onSubmit),
          disabled: isCreating,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: handleClose,
          variant: "outline",
          disabled: isCreating,
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Location</h3>
                  <ReusableButton
                    onClick={toggleInputMode}
                    variant="text"
                    className="text-sm underline h-auto p-0"
                  >
                    Switch to {inputMode === "siteName" ? "Coordinates" : "Site Name"}
                  </ReusableButton>
                </div>

                {inputMode === "siteName" ? (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <div className="grid gap-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <LocationAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          onLocationSelect={(location) => {
                            handleSiteNameChange(location.name);
                            handleCoordinateChange(
                              location.latitude.toString(),
                              location.longitude.toString()
                            );
                          }}
                          placeholder="Search for a location"
                        />
                        <p className="text-xs text-muted-foreground">
                          Search and select a location to automatically set coordinates.
                        </p>
                      </div>
                    )}
                  />
                ) : (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field, fieldState: { error } }) => (
                        <ReusableInputField
                          label="Custom Site Name"
                          placeholder="Enter custom site name"
                          error={error?.message}
                          required
                          {...field}
                        />
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field, fieldState: { error } }) => (
                          <ReusableInputField
                            label="Latitude"
                            placeholder="Enter latitude"
                            error={error?.message}
                            required
                            {...field}
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field, fieldState: { error } }) => (
                          <ReusableInputField
                            label="Longitude"
                            placeholder="Enter longitude"
                            error={error?.message}
                            required
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                <ReusableButton
                  type="button"
                  className="text-sm p-1"
                  variant="outlined"
                  onClick={handleOptimizeCoordinates}
                  disabled={!form.watch("latitude") || !form.watch("longitude") || isOptimizing}
                  loading={isOptimizing}
                >
                  {isOptimizing ? "Optimizing..." : "⭐ Optimize Coordinates"}
                </ReusableButton>
              </div>

              <div className="space-y-2">
                <Label>Interactive Map</Label>
                <p className="text-sm text-muted-foreground">
                  Click on the map to set location or drag the marker.
                </p>
                <Suspense fallback={<div className="w-full h-64 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />}>
                  <MiniMap
                    latitude={form.watch("latitude")}
                    longitude={form.watch("longitude")}
                    onCoordinateChange={handleCoordinateChange}
                    onSiteNameChange={handleSiteNameChange}
                    inputMode={inputMode}
                    customSiteName={inputMode === "coordinates" ? form.watch("name") : undefined}
                  />
                </Suspense>
              </div>
            </div>
          </form>
        </Form>
      </ReusableDialog>
    </>
  );
}
                  
