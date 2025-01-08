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
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: initialData || {
      name: "",
      organization: "AirQo", // This comes from the current org context
      latitude: "",
      longitude: "",
    },
  });

  function onSubmit(values: SiteFormValues) {
    console.log(values);
    // Here you would typically send this data to your API
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
                  <Input placeholder="Enter network" {...field} />
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
          <h3 className="text-lg font-medium mb-2">Mobile App Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mobileAppName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile App Name</FormLabel>
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
                  <FormLabel>Mobile App Description</FormLabel>
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
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
