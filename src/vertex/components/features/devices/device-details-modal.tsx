import { Switch } from "@/components/ui/switch";
import { Loader2, Save, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useUpdateDeviceLocal, useUpdateDeviceGlobal, useDecryptDeviceKeys } from "@/core/hooks/useDevices";
import { DEVICE_CATEGORIES } from "@/core/constants/devices";
import { PERMISSIONS } from "@/core/permissions/constants";
import { Device } from "@/app/types/devices";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { AqEdit01 as AqEdit, AqKey01 } from "@airqo/icons-react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import logger from "@/lib/logger";

interface DeviceDetailsModalProps {
  open: boolean;
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

const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ open, device, onClose }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const updateLocal = useUpdateDeviceLocal();
  const updateGlobal = useUpdateDeviceGlobal();
  const decryptKeys = useDecryptDeviceKeys();

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

  // Reset edit mode when modal is closed
  useEffect(() => {
    if (!open) {
      setIsEditMode(false);
      form.reset();
    }
  }, [open, form]);

  const handleCancel = () => {
    if (isEditMode) {
      form.reset();
      setIsEditMode(false);
    } else {
      onClose();
    }
  };

  const onSubmitLocal = async (data: DeviceUpdateFormData) => {
    if (!device?._id) {
      ReusableToast({ message: "Cannot update device: missing device ID", type: "WARNING" });
      return;
    }

    const { dirtyFields } = form.formState;
    const dirtyData = Object.fromEntries(
      (Object.keys(dirtyFields) as Array<keyof DeviceUpdateFormData>).map((key) => [key, data[key]]),
    );

    if (Object.keys(dirtyData).length === 0) {
      setIsEditMode(false);
      return;
    }

    const processedData: Record<string, string | number | boolean | undefined> = { ...dirtyData };
    if (typeof processedData.device_number === "string") {
      processedData.device_number =
        processedData.device_number.trim() === "" ? undefined : parseInt(processedData.device_number, 10);
    }
    if (typeof processedData.latitude === "string") {
      processedData.latitude =
        processedData.latitude.trim() === "" ? undefined : parseFloat(processedData.latitude);
    }
    if (typeof processedData.longitude === "string") {
      processedData.longitude =
        processedData.longitude.trim() === "" ? undefined : parseFloat(processedData.longitude);
    }
    if (typeof processedData.generation_count === "string") {
      processedData.generation_count =
        processedData.generation_count.trim() === "" ? undefined : parseInt(processedData.generation_count, 10);
    }

    updateLocal.mutate(
      { deviceId: device._id, deviceData: processedData },
      {
        onSuccess: () => {
          setIsEditMode(false);
          form.reset(data);
        },
      }
    );
  };

  const onSubmitGlobal = async (data: DeviceUpdateFormData) => {
    if (!device?._id) {
      ReusableToast({ message: "Cannot update device: missing device ID", type: "WARNING" });
      return;
    }

    const { dirtyFields } = form.formState;
    const dirtyData = Object.fromEntries(
      (Object.keys(dirtyFields) as Array<keyof DeviceUpdateFormData>).map((key) => [key, data[key]]),
    );

    if (Object.keys(dirtyData).length === 0) {
      setIsEditMode(false);
      return;
    }

    const processedData: Record<string, string | number | boolean | undefined> = { ...dirtyData };
    if (typeof processedData.device_number === "string") {
      processedData.device_number =
        processedData.device_number.trim() === "" ? undefined : parseInt(processedData.device_number, 10);
    }
    if (typeof processedData.latitude === "string") {
      processedData.latitude =
        processedData.latitude.trim() === "" ? undefined : parseFloat(processedData.latitude);
    }
    if (typeof processedData.longitude === "string") {
      processedData.longitude =
        processedData.longitude.trim() === "" ? undefined : parseFloat(processedData.longitude);
    }
    if (typeof processedData.generation_count === "string") {
      processedData.generation_count =
        processedData.generation_count.trim() === "" ? undefined : parseInt(processedData.generation_count, 10);
    }

    updateGlobal.mutate(
      { deviceId: device._id, deviceData: processedData },
      {
        onSuccess: () => {
          setIsEditMode(false);
          form.reset(data);
        },
      }
    );
  };

  const handleCopy = async (valueToCopy: string | number) => {
    if (valueToCopy !== undefined && valueToCopy !== null) {
      try {
        await navigator.clipboard?.writeText(String(valueToCopy))
        ReusableToast({ message: "Decrypted Key Copied", type: "SUCCESS" })
      } catch (err) {
        ReusableToast({ message: `Failed to copy key: ${String(err)}`, type: "ERROR" })
      }
    }
  }

  const handleDecryptKey = async (keyType: 'readKey' | 'writeKey') => {
    const encryptedKey = keyType === 'readKey' ? device.readKey : device.writeKey;
    const deviceNumber = device.device_number;

    if (!encryptedKey || !deviceNumber) {
      ReusableToast({ message: `No ${keyType} or device number available for decryption.`, type: "WARNING" });
      return;
    }

    try {
      const response = await decryptKeys.mutateAsync([
        {
          encrypted_key: encryptedKey,
          device_number: Number(deviceNumber),
        },
      ]);

      if (response.success && response.decrypted_keys && response.decrypted_keys.length > 0) {
        handleCopy(response.decrypted_keys[0].decrypted_key);
      } else {
        ReusableToast({ message: "Decryption failed or no key returned.", type: "ERROR" });
      }
    } catch {
      logger.error("Decryption failed")
    }
  };

  const isLoading = updateLocal.isPending || updateGlobal.isPending;

  // Edit-only mode view
  return (
    <ReusableDialog
      isOpen={open}
      onClose={onClose}
      title={isEditMode ? "Edit Device Details" : "Device Details"}
      className="w-screen h-[90vh] max-w-none max-h-none m-0 p-0"
      contentAreaClassName="p-4 md:p-6"
      maxHeight="h-full"
      customFooter={
        <div className="flex justify-end gap-2 p-4 border-t">
          {isEditMode ? (
            <>
              <ReusableButton variant="outlined" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </ReusableButton>

              <ReusableButton
                variant="outlined"
                onClick={form.handleSubmit(onSubmitGlobal)}
                disabled={isLoading}
                Icon={updateGlobal.isPending ? Loader2 : RefreshCw}
                loading={updateGlobal.isPending}
                permission={PERMISSIONS.DEVICE.UPDATE}
              >
                Sync Global
              </ReusableButton>

              <ReusableButton
                onClick={form.handleSubmit(onSubmitLocal)}
                disabled={isLoading}
                Icon={updateLocal.isPending ? Loader2 : Save}
                loading={updateLocal.isPending}
                permission={PERMISSIONS.DEVICE.UPDATE}
              >
                Save Local
              </ReusableButton>
            </>
          ) : (
            <>
              <ReusableButton variant="outlined" onClick={onClose}>
                Close
              </ReusableButton>
              <ReusableButton onClick={() => setIsEditMode(true)} Icon={AqEdit} permission={PERMISSIONS.DEVICE.UPDATE}>
                Edit
              </ReusableButton>
            </>
          )}
        </div>
      }
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <FormField
                control={form.control}
                name="long_name"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Device Name"
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    showCopyButton={true}
                    error={fieldState.error?.message}
                    required
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                  <ReusableSelectInput
                    label="Category"
                    placeholder="Select category"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isLoading || !isEditMode}
                    error={fieldState.error?.message}
                    required
                  >
                    {DEVICE_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </ReusableSelectInput>
                )}
              />
              <FormField
                control={form.control}
                name="serial_number"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Serial Number"
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    showCopyButton={true}
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <ReusableInputField
                label="Network"
                value={device?.network || "-"}
                readOnly={true}
                showCopyButton={true}
                disabled
              />
              <ReusableInputField
                label="Status"
                value={device?.status || "-"}
                readOnly={true}
                showCopyButton={true}
                disabled
              />
              <ReusableInputField
                label="Claim Status"
                value={device?.claim_status || "-"}
                readOnly={true}
                showCopyButton={true}
                disabled
              />
              <div className="lg:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <ReusableInputField
                      as="textarea"
                      label="Description"
                      disabled={isLoading}
                      readOnly={!isEditMode}
                      error={fieldState.error?.message}
                      rows={1}
                      placeholder="Device description..."
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </section>

          {/* Technical Details */}
          <section>
            <h3 className="text-lg font-medium">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <FormField
                control={form.control}
                name="device_number"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Channel ID"
                    type="number"
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    showCopyButton={true}
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Height (meters)"
                    type="number"
                    step="0.1"
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    error={fieldState.error?.message}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="writeKey"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Write Key"
                    type={isEditMode ? "text" : "password"}
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    showCopyButton={true}
                    error={fieldState.error?.message}
                    customActionIcon={AqKey01}
                    onCustomAction={() => handleDecryptKey('writeKey')}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="readKey"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Read Key"
                    type={isEditMode ? "text" : "password"}
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    showCopyButton={true}
                    error={fieldState.error?.message}
                    customActionIcon={AqKey01}
                    onCustomAction={() => handleDecryptKey('readKey')}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="generation_version"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Generation Version"
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="generation_count"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Generation Count"
                    type="number"
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="powerType"
                render={({ field, fieldState }) => (
                  <ReusableSelectInput
                    label="Power Type"
                    placeholder="Select power type"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isLoading || !isEditMode}
                    error={fieldState.error?.message}
                  >
                    {[
                      { value: "solar", label: "Solar" },
                      { value: "alternator", label: "Alternator" },
                      { value: "mains", label: "Mains" },
                    ].map((powerType) => (
                      <option key={powerType.value} value={powerType.value}>
                        {powerType.label}
                      </option>
                    ))}
                  </ReusableSelectInput>
                )}
              />
            </div>
          </section>

          {/* Location & Contact */}
          <section>
            <h3 className="text-lg font-medium">Location & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Latitude"
                    type="number"
                    step="any"
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Longitude"
                    type="number"
                    step="any"
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Phone Number"
                    type="tel"
                    disabled={isLoading}
                    readOnly={!isEditMode}
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
            </div>
          </section>

          {/* Settings */}
          <section>
            <h3 className="text-lg font-medium">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading || !isEditMode} />
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading || !isEditMode} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </section>
        </div>
      </Form>
    </ReusableDialog>
  );
};

export default DeviceDetailsModal; 