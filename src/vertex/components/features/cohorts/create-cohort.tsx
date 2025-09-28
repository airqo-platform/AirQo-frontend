"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { useDevices } from "@/core/hooks/useDevices";
import { useCreateCohortWithDevices } from "@/core/hooks/useCohorts";
import { useAppSelector } from "@/core/redux/hooks";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
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
      devices: preselectedDevices.map((d) => d.value),
    },
  });

  const { devices, isLoading, error } = useDevices();

  const deviceOptions = useMemo(() => {
    const allDeviceOptions = (devices || []).map((d) => ({
      value: d._id || "",
      label: d.long_name || d.name || `Device ${d._id}`,
    }));

    const combinedOptions = [...preselectedDevices, ...allDeviceOptions];
    const uniqueOptions = Array.from(new Map(combinedOptions.map((opt) => [opt.value, opt])).values());
    return uniqueOptions.filter((opt) => opt.value);
  }, [devices, preselectedDevices]);

  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const router = useRouter();
  const network = activeNetwork?.net_name || "";

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        devices: preselectedDevices.map((d) => d.value),
      });
    }
  }, [open, preselectedDevices, form]);

  const { mutate: createCohort, isPending } = useCreateCohortWithDevices();

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    createCohort(
      { name: values.name, network, deviceIds: values.devices },
      {
        onSuccess: (response) => {
          onSuccess?.(response);
          form.reset();

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
      subtitle={network ? `Network: ${network}` : "Network not selected"}
      size="lg"
      primaryAction={{
        label: isPending ? "Creating…" : "Submit",
        onClick: form.handleSubmit(onSubmit),
        disabled: isPending || !network,
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
                    value={field.value}
                    allowCreate={false}
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