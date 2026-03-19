import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { useDevices } from "@/core/hooks/useDevices";
import { useCreateCohortWithDevices } from "@/core/hooks/useCohorts";
import { useNetworks } from "@/core/hooks/useNetworks";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { DeviceNameParser } from "./device-name-parser";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { DEFAULT_COHORT_TAGS } from "@/core/constants/devices";
import { buildCohortName, sanitizeCohortInput } from "@/core/utils/cohortName";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type PreselectedDevice = { value: string; label: string };

const EMPTY_PRESELECTED_DEVICES: PreselectedDevice[] = [];

interface CreateCohortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (cohortData?: { cohort: { _id: string; name: string } }) => void;
  onError?: (error: unknown) => void;
  andNavigate?: boolean;
  preselectedDevices?: PreselectedDevice[];
}

const formSchema = z.object({
  name: z.string().optional(),
  city: z.string().optional(),
  projectName: z.string().optional(),
  funder: z.string().optional(),
  network: z.string().min(1, {
    message: "Please select a Sensor Manufacturer.",
  }),
  devices: z.array(z.string()).min(1, {
    message: "Please select at least one device.",
  }),
  cohort_tags: z.array(z.string()).min(1, {
    message: "Please select at least one tag.",
  }),
}).superRefine((values, ctx) => {
  const isOrganizational = values.cohort_tags?.includes("organizational");
  if (isOrganizational) {
    if (!values.city?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required.", path: ["city"] });
    }
    if (!values.projectName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Project name is required.", path: ["projectName"] });
    }
  } else {
    if (!values.name?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cohort name is required.", path: ["name"] });
    }
  }
});

export function CreateCohortDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
  preselectedDevices = EMPTY_PRESELECTED_DEVICES,
}: CreateCohortDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      city: "",
      projectName: "",
      funder: "",
      network: "",
      devices: preselectedDevices.map((d) => d.value),
      cohort_tags: [],
    },
  });

  type CohortStep = "form" | "confirmation" | "success";
  const [step, setStep] = useState<CohortStep>("form");
  const [createdCohort, setCreatedCohort] = useState<{ _id: string; name: string } | null>(null);

  const selectedNetwork = form.watch("network");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [showIgnoredTooltip, setShowIgnoredTooltip] = useState({
    city: false,
    projectName: false,
    funder: false,
  });
  const tooltipTimers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

  const { devices, isLoading, error } = useDevices({
    network: selectedNetwork,
    search: deviceSearch
  });

  const { networks, isLoading: isLoadingNetworks } = useNetworks();

  const deviceOptions = useMemo(() => {
    return (devices || []).map((d) => ({
      value: d._id || "",
      label: d.long_name || d.name || `Device ${d._id}`,
    }));
  }, [devices]);

  const router = useRouter();

  const handleSanitizedFieldChange = (
    fieldKey: "city" | "projectName" | "funder",
    value: string,
    onChange: (nextValue: string) => void
  ) => {
    const sanitized = sanitizeCohortInput(value);
    if (/[^a-zA-Z0-9]/.test(value)) {
      setShowIgnoredTooltip((prev) => ({ ...prev, [fieldKey]: true }));
      if (tooltipTimers.current[fieldKey]) {
        clearTimeout(tooltipTimers.current[fieldKey] as ReturnType<typeof setTimeout>);
      }
      tooltipTimers.current[fieldKey] = setTimeout(() => {
        setShowIgnoredTooltip((prev) => ({ ...prev, [fieldKey]: false }));
      }, 1500);
    }
    onChange(sanitized);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        city: "",
        projectName: "",
        funder: "",
        network: "",
        devices: preselectedDevices.map((d) => d.value),
        cohort_tags: [],
      });
      setDeviceSearch("");
      setStep("form");
      setCreatedCohort(null);

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preselectedDevices]);

  const { mutate: createCohort, isPending } = useCreateCohortWithDevices();

  const handleCancel = () => {
    if (step === 'form') {
      form.reset();
      setDeviceSearch("");
      onOpenChange(false);
    } else if (step === 'success') {
      onOpenChange(false);
    } else {
      setStep('form');
    }
  };

  const handleDeviceImport = (deviceNames: string[]) => {
    // Validate that network is selected first (generic block handles this now, but extra safety)
    if (!selectedNetwork) return;

    // Convert device names to device IDs by finding matches in deviceOptions
    const matchedIds = deviceNames
      .map(name => {
        const nameLower = name.toLowerCase();
        // Try exact match first
        let match = deviceOptions.find(d => d.label.toLowerCase() === nameLower);

        // If no exact match, try contains match
        if (!match) {
          match = deviceOptions.find(d =>
            d.label.toLowerCase().includes(nameLower) && nameLower.length >= 3
          );
        }

        return match?.value;
      })
      .filter(Boolean) as string[];

    if (matchedIds.length === 0) {
      ReusableToast({
        message: 'No matching devices found. Please ensure the devices exist in the selected network.',
        type: 'WARNING',
      });
      return;
    }

    // Merge with existing selections
    const currentDevices = form.getValues('devices');
    const uniqueDevices = Array.from(new Set([...currentDevices, ...matchedIds]));
    form.setValue('devices', uniqueDevices);

    const importedCount = matchedIds.length;
    const notFoundCount = deviceNames.length - importedCount;

    if (notFoundCount > 0) {
      ReusableToast({
        message: `Imported ${importedCount} device${importedCount !== 1 ? 's' : ''}. ${notFoundCount} not found.`,
        type: 'WARNING',
      });
    }
  };

  // Intermediate submit handler for form step
  const onFormReview = () => {
    setStep("confirmation");
  };

  // Final submit handler
  const handleConfirmCreate = () => {
    const values = form.getValues();
    const isOrganizational = values.cohort_tags?.includes("organizational");
    const derivedName = isOrganizational
      ? buildCohortName(values.city || "", values.projectName || "", values.funder)
      : (values.name || "").trim();
    createCohort(
      { name: derivedName, network: values.network, deviceIds: values.devices, cohort_tags: values.cohort_tags },
      {
        onSuccess: (response) => {
          if (response?.cohort) {
            setCreatedCohort(response.cohort);
            setStep("success");
            onSuccess?.(response);
          } else {
            // Fallback if response structure is unexpected
            onSuccess?.(response);
            onOpenChange(false);
          }
        },
        onError: (error) => {
          onError?.(error);
        },
      },
    );
  };

  const getDialogConfig = () => {
    switch (step) {
      case 'confirmation':
        return {
          title: 'Confirm Cohort Creation',
          primaryLabel: isPending ? 'Creating...' : 'Confirm & Create',
          primaryAction: handleConfirmCreate,
          secondaryLabel: 'Back',
          secondaryAction: () => setStep('form'),
          showFooter: true
        };
      case 'success':
        return {
          title: 'Success!',
          primaryLabel: 'Go to Cohort Details',
          primaryAction: () => {
            if (createdCohort?._id) {
              router.push(`/admin/cohorts/${createdCohort._id}`);
            } else {
              onOpenChange(false);
            }
          },
          secondaryLabel: 'Close',
          secondaryAction: () => onOpenChange(false),
          showFooter: true
        };
      default: // form
        return {
          title: 'Create Cohort',
          primaryLabel: 'Review & Create',
          primaryAction: form.handleSubmit(onFormReview),
          secondaryLabel: 'Cancel',
          secondaryAction: handleCancel,
          showFooter: true
        };
    }
  };

  const config = getDialogConfig();
  const formValues = form.getValues();
  const isOrganizational = form.watch("cohort_tags")?.includes("organizational");
  const derivedName = isOrganizational
    ? buildCohortName(formValues.city || "", formValues.projectName || "", formValues.funder)
    : (formValues.name || "").trim();

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleCancel}
      title={config.title}
      size="lg"
      primaryAction={{
        label: config.primaryLabel,
        onClick: config.primaryAction,
        disabled: isPending || (step === 'form' && !selectedNetwork),
      }}
      secondaryAction={{
        label: config.secondaryLabel,
        onClick: config.secondaryAction,
        disabled: isPending,
        variant: "outline",
      }}
      showFooter={config.showFooter}
    >
      {step === 'form' && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormReview)} className="space-y-4">
            <FormField
              control={form.control}
              name="cohort_tags"
              render={({ field }) => (
                <FormItem>
                  <Label>Tags *</Label>
                  <MultiSelectCombobox
                    options={DEFAULT_COHORT_TAGS}
                    placeholder="Select or create tags..."
                    onValueChange={field.onChange}
                    value={field.value || []}
                    allowCreate={false}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {isOrganizational ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip open={showIgnoredTooltip.city}>
                        <TooltipTrigger asChild>
                          <div>
                            <ReusableInputField
                              label="City"
                              placeholder="e.g. Nairobi"
                              required
                              {...field}
                              onChange={(e) => handleSanitizedFieldChange("city", e.target.value, field.onChange)}
                              error={form.formState.errors.city?.message}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">Special character ignored</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip open={showIgnoredTooltip.projectName}>
                        <TooltipTrigger asChild>
                          <div>
                            <ReusableInputField
                              label="Project name"
                              placeholder="e.g. WRI"
                              required
                              {...field}
                              onChange={(e) => handleSanitizedFieldChange("projectName", e.target.value, field.onChange)}
                              error={form.formState.errors.projectName?.message}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">Special character ignored</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                />
                <FormField
                  control={form.control}
                  name="funder"
                  render={({ field }) => (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip open={showIgnoredTooltip.funder}>
                        <TooltipTrigger asChild>
                          <div>
                            <ReusableInputField
                              label="Funder (optional)"
                              placeholder="e.g. EPIC"
                              {...field}
                              onChange={(e) => handleSanitizedFieldChange("funder", e.target.value, field.onChange)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">Special character ignored</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <ReusableInputField
                    label="Cohort name"
                    placeholder="Enter cohort name"
                    required
                    {...field}
                    error={form.formState.errors.name?.message}
                  />
                )}
              />
            )}
            <FormField
              control={form.control}
              name="network"
              render={({ field }) => (
                <ReusableSelectInput
                  label="Sensor Manufacturer"
                  id="network"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    form.setValue("devices", []);
                    setDeviceSearch("");
                  }}
                  error={form.formState.errors.network?.message}
                  required
                  placeholder={isLoadingNetworks ? "Loading networks..." : "Select a network"}
                  disabled={isLoadingNetworks}
                >
                  {networks.map((network) => (
                    <option key={network.net_name} value={network.net_name}>
                      {network.net_name}
                    </option>
                  ))}
                </ReusableSelectInput>
              )}
            />
            <FormField
              control={form.control}
              name="devices"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Select Device(s) <span className="text-red-500">*</span>
                    </label>
                    <DeviceNameParser
                      onDevicesParsed={handleDeviceImport}
                      shouldBlock={!selectedNetwork}
                      tooltipMessage="Please select a network first"
                    />
                  </div>
                  <FormControl>
                    <MultiSelectCombobox
                      options={deviceOptions}
                      placeholder="Select or add devices..."
                      onValueChange={field.onChange}
                      value={field.value || []}
                      allowCreate={false}
                      onSearchChange={setDeviceSearch}
                      searchValue={deviceSearch}
                      emptyMessage={
                        selectedNetwork
                          ? "No devices found for this Sensor Manufacturer."
                          : "Please select a Sensor Manufacturer first."
                      }
                    />
                  </FormControl>
                  {isLoading && <p className="text-xs text-muted-foreground">Loading devices…</p>}
                  {error && (
                    <p className="text-xs text-destructive">Failed to load devices. Please try again.</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}

      {step === 'confirmation' && (
        <div className="flex flex-col items-center justify-center py-6 px-4 space-y-4 text-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
            <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Review Cohort Details
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
              You are about to create a cohort named <span className="font-semibold text-gray-900 dark:text-white">{derivedName}</span> in the <span className="font-semibold text-gray-900 dark:text-white">{formValues.network}</span> network.
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                Devices to be added:
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {formValues.devices.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && createdCohort && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cohort Created Successfully!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              Cohort <span className="font-medium text-gray-900 dark:text-white">{createdCohort.name}</span> has been created with {formValues.devices.length} devices.
            </p>
          </div>
        </div>
      )}
    </ReusableDialog>
  );
}
