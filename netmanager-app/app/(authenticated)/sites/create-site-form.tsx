"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { sites } from "@/core/apis/sites";
import { useAppSelector } from "@/core/redux/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useApproximateCoordinates } from "@/core/hooks/useSites";
import { AxiosError } from "axios";
import Error from "next/error";

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

const steps = [
  { id: "Step 1", name: "Site Details" },
  { id: "Step 2", name: "Map Preview" },
];

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

const MapPreview = ({
  latitude,
  longitude,
  onPositionChange,
}: {
  latitude: string;
  longitude: string;
  onPositionChange: (lat: string, lng: string) => void;
}) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const position: [number, number] = [lat || 0, lng || 0];

  const handleMarkerDrag = (e: L.LeafletEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    onPositionChange(position.lat.toFixed(6), position.lng.toFixed(6));
  };

  if (!lat || !lng) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
        <p className="text-gray-500">Enter coordinates to see map preview</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-md overflow-hidden">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          icon={icon}
          draggable={true}
          eventHandlers={{
            dragend: handleMarkerDrag,
          }}
        />
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
};

export function CreateSiteForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const { getApproximateCoordinates, isPending } = useApproximateCoordinates();

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: "",
      latitude: "",
      longitude: "",
    },
  });

  async function onSubmit(values: SiteFormValues) {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sites.createSite({
        ...values,
        network: activeNetwork?.net_name || "",
      });

      await queryClient.invalidateQueries({ queryKey: ["sites"] });

      setOpen(false);
      form.reset();
      setCurrentStep(0);
    } catch (error: any) {
      setError(error.message || "An error occurred while creating the site.");
    } finally {
      setLoading(false);
    }
  }

  const onBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add Site</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-background pb-4">
          <DialogTitle>Create Site</DialogTitle>
          <DialogDescription>
            Enter the details for the new site. Click next to preview on map.
          </DialogDescription>
        </DialogHeader>

        <nav aria-label="Progress" className="mb-6">
          <ol
            role="list"
            className="space-y-4 md:flex md:space-y-0 md:space-x-8"
          >
            {steps.map((step, index) => (
              <li key={step.name} className="md:flex-1">
                <div
                  className={cn(
                    "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0",
                    index <= currentStep ? "border-primary" : "border-gray-200"
                  )}
                >
                  <span className="text-sm font-medium text-primary">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {currentStep === 0 && (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter site name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is the name that will be used to identify the
                            site.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>Network</FormLabel>
                      <FormControl>
                        <Input
                          value={activeNetwork?.net_name || ""}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>
                        The network under which this site will be created.
                      </FormDescription>
                    </FormItem>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
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
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter longitude" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const lat = form.getValues("latitude");
                      const lng = form.getValues("longitude");
                      if (lat && lng) {
                        getApproximateCoordinates(
                          { latitude: lat, longitude: lng },
                          {
                            onSuccess: (data) => {
                              const {
                                approximate_latitude,
                                approximate_longitude,
                              } = data.approximate_coordinates;
                              form.setValue(
                                "latitude",
                                approximate_latitude.toString()
                              );
                              form.setValue(
                                "longitude",
                                approximate_longitude.toString()
                              );
                            },
                          }
                        );
                      }
                    }}
                    disabled={
                      !form.getValues("latitude") ||
                      !form.getValues("longitude") ||
                      isPending
                    }
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      "⭐ Optimize Coordinates"
                    )}
                  </Button>
                </div>
              </>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Map Preview</h3>
                <MapPreview
                  latitude={form.getValues("latitude")}
                  longitude={form.getValues("longitude")}
                  onPositionChange={(lat, lng) => {
                    form.setValue("latitude", lat);
                    form.setValue("longitude", lng);
                  }}
                />
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Site Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Site Name:</p>
                      <p>{form.getValues("name")}</p>
                    </div>
                    <div>
                      <p className="font-medium">Network:</p>
                      <p>{activeNetwork?.net_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium">Coordinates:</p>
                      <p>
                        {form.getValues("latitude")},{" "}
                        {form.getValues("longitude")}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Please confirm that the location on the map is correct. If
                  not, go back and adjust the coordinates.
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="bg-background pt-4">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={onBack}>
                  Back
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : currentStep === 1 ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Site
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
