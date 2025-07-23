"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateSiteDetails } from "@/core/hooks/useSites";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { DialogClose } from "@/components/ui/dialog";
import { useRef } from "react";

const siteFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  organization: z.string(),
  latitude: z.string().regex(/^-?[0-9]\d*(\.\d+)?$/, {
    message: "Please enter a valid latitude",
  }),
  longitude: z.string().regex(/^-?[0-9]\d*(\.\d+)?$/, {
    message: "Please enter a valid longitude",
  }),
  network: z.string().optional(),
  parish: z.string().optional(),
  subCounty: z.string().optional(),
  district: z.string().optional(),
  region: z.string().optional(),
  altitude: z.string().optional(),
  greenness: z.string().optional(),
  nearestRoad: z.string().optional(),
  mobileAppName: z.string().optional(),
  mobileAppDescription: z.string().optional(),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

interface SiteFormProps {
  initialData?: Partial<SiteFormValues>;
}

export function SiteForm({ initialData }: SiteFormProps) {
  const params = useParams();
  const siteId = params.id as string;
  const { toast } = useToast();
  const { mutate: updateSite, isPending } = useUpdateSiteDetails();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: initialData || {
      name: "",
      organization: "AirQo",
      latitude: "",
      longitude: "",
    },
  });

  function onSubmit(values: SiteFormValues) {
    const dirtyFields = form.formState.dirtyFields;

    const fieldMapping = {
      name: "name",
      description: "description",
      network: "network",
      latitude: "latitude",
      longitude: "longitude",
      parish: "parish",
      subCounty: "sub_county",
      district: "district",
      region: "region",
      altitude: "altitude",
      mobileAppName: "search_name",
      mobileAppDescription: "location_name",
    };

    const transformedData = Object.entries(fieldMapping).reduce((acc, [formField, apiField]) => {
      if (dirtyFields[formField as keyof typeof dirtyFields]) {
        acc[apiField] = values[formField as keyof SiteFormValues];
      }
      return acc;
    }, {} as Record<string, string | undefined>);

    if (Object.keys(transformedData).length === 0) {
      toast({
        title: "No Changes",
        description: "No fields have been modified",
      });
      return;
    }

    updateSite(
      { siteId, data: transformedData },
      {
        onSuccess: () => {
          cancelButtonRef.current?.click();
          toast({
            title: "Success",
            description: "Site details updated successfully",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update site details",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter site name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="network"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Network</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter latitude" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter longitude" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parish"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parish</FormLabel>
                <FormControl>
                  <Input placeholder="Enter parish" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subCounty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub County</FormLabel>
                <FormControl>
                  <Input placeholder="Enter sub county" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <FormControl>
                  <Input placeholder="Enter district" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input placeholder="Enter region" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="altitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altitude</FormLabel>
                <FormControl>
                  <Input placeholder="Enter altitude" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="greenness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Greenness</FormLabel>
                <FormControl>
                  <Input placeholder="Enter greenness" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nearestRoad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nearest Road (m)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter nearest road distance" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Mobile App Site Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mobileAppName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Editable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter mobile app name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobileAppDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Editable Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter mobile app description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" ref={cancelButtonRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
