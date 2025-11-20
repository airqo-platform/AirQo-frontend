"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { useDevices } from "@/core/hooks/useDevices";
import { useCreateCohortWithDevices } from "@/core/hooks/useCohorts";
import { useNetworks } from "@/core/hooks/useNetworks";
import { useAppSelector } from "@/core/redux/hooks";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

export type PreselectedDevice = { value: string; label: string };

interface CreateCohortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (cohortData?: { cohort: { _id: string; name: string } }) => void;
  onError?: (error: unknown) => void;
  andNavigate?: boolean;
  preselectedDevices?: PreselectedDevice[];
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Cohort name must be at least 2 characters.",
  }),
  network: z.string().min(1, {
    message: "Please select a network.",
  }),
  devices: z.array(z.string()).min(1, {
    message: "Please select at least one device.",
  }),
});

export function CreateCohortDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
  andNavigate = true,
  preselectedDevices = [],
}: CreateCohortDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      network: "",
      devices: preselectedDevices.map((d) => d.value),
    },
  });

  const selectedNetwork = form.watch("network");
  const [deviceSearch, setDeviceSearch] = useState("");

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

  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const router = useRouter();

  useEffect(() => {
    form.setValue("devices", []);
    setDeviceSearch("");
  }, [selectedNetwork, form]);

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        network: "",
        devices: preselectedDevices.map((d) => d.value),
      });
      setDeviceSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeNetwork]);

  const { mutate: createCohort, isPending } = useCreateCohortWithDevices();

  const handleCancel = () => {
    form.reset();
    setDeviceSearch("");
    onOpenChange(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    createCohort(
      { name: values.name, network: values.network, deviceIds: values.devices },
      {
        onSuccess: (response) => {
          onSuccess?.(response);
          form.reset();
          setDeviceSearch("");

          if (andNavigate && response?.cohort?._id) {
            router.push(`/cohorts/${response.cohort._id}`);
          } else {
            onOpenChange(false);
          }
        },
        onError: (error) => {
          onError?.(error);
        },
      },
    );
  }

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleCancel}
      title="Create Cohort"
      size="lg"
      primaryAction={{
        label: isPending ? "Creating…" : "Submit",
        onClick: form.handleSubmit(onSubmit),
        disabled: isPending || !selectedNetwork,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: handleCancel,
        disabled: isPending,
        variant: "outline",
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <ReusableInputField
                label="Cohort name"
                placeholder="Cohort name"
                required
                {...field}
                error={form.formState.errors.name?.message}
              />
            )}
          />
          <FormField
            control={form.control}
            name="network"
            render={({ field }) => (
              <ReusableSelectInput
                label="Network"
                id="network"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
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
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select Device(s) <span className="text-red-500">*</span>
                </label>
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
                        ? "No devices found for this network."
                        : "Please select a network first."
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
    </ReusableDialog>
  );
}