import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, RefreshCw } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateDeviceLocal, useUpdateDeviceGlobal } from "@/core/hooks/useDevices";
import { DEVICE_CATEGORIES } from "@/core/constants/devices";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import { Device } from "@/app/types/devices";

interface DeviceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
  onClose: () => void;
}

// Form validation schema
const deviceUpdateSchema = z.object({
  long_name: z.string().min(1, "Device name is required"),
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  device_number: z.string().optional(),
  writeKey: z.string().optional(),
  readKey: z.string().optional(),
  serial_number: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  visibility: z.boolean().optional(),
  isPrimaryInLocation: z.boolean().optional(),
  generation_version: z.string().optional(),
  generation_count: z.string().optional(),
  phoneNumber: z.string().optional(),
  height: z.number().optional(),
  powerType: z.enum(["solar", "alternator", "mains"]).optional(),
  claim_status: z.enum(["claimed", "unclaimed"]).optional(),
  // Read-only fields for display
  network: z.string().optional(),
  status: z.enum(["not deployed", "deployed", "recalled", "online", "offline"]).optional(),
  isActive: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  createdAt: z.string().optional(),
  nextMaintenance: z.string().optional(),
});

type DeviceUpdateFormData = z.infer<typeof deviceUpdateSchema>;

const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ open, onOpenChange, device, onClose }) => {
  const updateLocal = useUpdateDeviceLocal();
  const updateGlobal = useUpdateDeviceGlobal();
  
  // Permission checks
  const canEdit = usePermission(PERMISSIONS.DEVICE.UPDATE);
  const canSync = usePermission(PERMISSIONS.DEVICE.UPDATE);
  
  const form = useForm<DeviceUpdateFormData>({
    resolver: zodResolver(deviceUpdateSchema),
    defaultValues: {
      long_name: device?.long_name || "",
      name: device?.name || "",
      description: device?.description || "",
      category: device?.category || "",
      device_number: device?.device_number?.toString() || "",
      writeKey: device?.writeKey || "",
      readKey: device?.readKey || "",
      serial_number: device?.serial_number || "",
      latitude: device?.latitude?.toString() || "",
      longitude: device?.longitude?.toString() || "",
      visibility: device?.visibility || false,
      isPrimaryInLocation: device?.isPrimaryInLocation || false,
      generation_version: String(device?.generation_version) || "",
      generation_count: device?.generation_count?.toString() || "",
      phoneNumber: device?.phoneNumber || "",
      height: device?.height || undefined,
      powerType: device?.powerType || undefined,
      claim_status: device?.claim_status || undefined,
    },
  });

  // Reset form when device changes
  useEffect(() => {
    if (device) {
      form.reset({
        long_name: device.long_name || "",
        name: device.name || "",
        description: device.description || "",
        category: device.category || "",
        device_number: device.device_number?.toString() || "",
        writeKey: device.writeKey || "",
        readKey: device.readKey || "",
        serial_number: device.serial_number || "",
        latitude: device.latitude?.toString() || "",
        longitude: device.longitude?.toString() || "",
        visibility: device.visibility || false,
        isPrimaryInLocation: device.isPrimaryInLocation || false,
        generation_version: String(device.generation_version) || "",
        generation_count: device.generation_count?.toString() || "",
        phoneNumber: device.phoneNumber || "",
        height: device.height || undefined,
        powerType: device.powerType || undefined,
        claim_status: device.claim_status || undefined,
      });
    }
  }, [device, form]);

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const onSubmitLocal = async (data: DeviceUpdateFormData) => {
    if (!device?.id) return;
    
    // Convert string numbers back to numbers where needed
    const processedData = {
      ...data,
      device_number: data.device_number ? parseInt(data.device_number) : undefined,
      latitude: data.latitude ? parseFloat(data.latitude) : undefined,
      longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      generation_count: data.generation_count ? parseInt(data.generation_count) : undefined,
    };
    
    updateLocal.mutate(
      { deviceId: device.id, deviceData: processedData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const onSubmitGlobal = async (data: DeviceUpdateFormData) => {
    if (!device?.id) return;
    
    // Convert string numbers back to numbers where needed
    const processedData = {
      ...data,
      device_number: data.device_number ? parseInt(data.device_number) : undefined,
      latitude: data.latitude ? parseFloat(data.latitude) : undefined,
      longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      generation_count: data.generation_count ? parseInt(data.generation_count) : undefined,
    };
    
    updateGlobal.mutate(
      { deviceId: device.id, deviceData: processedData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const isLoading = updateLocal.isPending || updateGlobal.isPending;

  // Edit-only mode view
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-screen w-screen max-w-none max-h-none m-0 p-0 rounded-none">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto p-6 flex flex-col h-full">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <DialogTitle className="text-xl font-semibold">Edit Device Details</DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <Form {...form}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="long_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device Name *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DEVICE_CATEGORIES.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="serial_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serial Number</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Read-only Network field */}
                      <div className="flex flex-col space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Network</Label>
                        <Input value={device?.network || "-"} disabled className="bg-muted" />
                      </div>
                      
                      {/* Read-only Status field */}
                      <div className="flex flex-col space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <Input value={device?.status || "-"} disabled className="bg-muted" />
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Claim Status</Label>
                        <Input value={device?.claim_status || "-"} disabled className="bg-muted" /> 
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                disabled={isLoading}
                                rows={3}
                                placeholder="Device description..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Technical Details */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Technical Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="device_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Channel ID</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} type="number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (meters)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isLoading}
                                type="number"
                                step="0.1"
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="writeKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Write Key</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="readKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Read Key</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="generation_version"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Generation Version</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="generation_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Generation Count</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} type="number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="powerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Power Type *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select power type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
                                  { value: "solar", label: "Solar" },
                                  { value: "alternator", label: "Alternator" },
                                  { value: "mains", label: "Mains" },
                                ].map((powerType) => (
                                  <SelectItem key={powerType.value} value={powerType.value}>
                                    {powerType.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Location & Contact */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Location & Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} type="number" step="any" />
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
                              <Input {...field} disabled={isLoading} type="number" step="any" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Settings</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Public Data Access</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Allow public access to this device&apos;s data
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isPrimaryInLocation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Primary Device in Location</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Mark as the primary device at this location
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </Form>
            </div>

            <DialogFooter className="mt-4 flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              {canSync && (
                <Button
                  variant="secondary"
                  onClick={form.handleSubmit(onSubmitGlobal)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {updateGlobal.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Sync Global
                </Button>
              )}
              {canEdit && <Button
                onClick={form.handleSubmit(onSubmitLocal)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {updateLocal.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Local
              </Button>}
            </DialogFooter>
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  );
};

export default DeviceDetailsModal; 