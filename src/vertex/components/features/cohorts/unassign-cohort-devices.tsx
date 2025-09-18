"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCohorts, useUnassignDevicesFromCohort } from "@/core/hooks/useCohorts";
import { useDevices } from "@/core/hooks/useDevices";
import { ComboBox } from "@/components/ui/combobox";
import { MultiSelectCombobox, Option } from "@/components/ui/multi-select";
import { Cohort } from "@/app/types/cohorts";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";

interface UnassignCohortDevicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDevices: string[];
  onSuccess?: () => void;
  cohortId?: string;
}

const formSchema = z.object({
  cohortId: z.string().min(1, {
    message: "Please select a cohort.",
  }),
  devices: z.array(z.string()).min(1, {
    message: "Please select at least one device.",
  }),
});

export function UnassignCohortDevicesDialog({
  open,
  onOpenChange,
  selectedDevices,
  onSuccess,
  cohortId,
}: UnassignCohortDevicesDialogProps) {
  const { cohorts } = useCohorts();
  const { devices: allDevices } = useDevices();
  const { mutate: unassignDevices, isPending: isUnassigning } = useUnassignDevicesFromCohort();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cohortId: cohortId || "",
      devices: selectedDevices,
    },
  });

  const deviceOptions: Option[] = useMemo(() => {
    return allDevices
      .map((device) => ({
        value: device._id || device.id || "",
        label: device.long_name || device.name || `Device ${device._id}`,
      }))
      .filter((option) => option.value);
  }, [allDevices]);

  useEffect(() => {
    if (open) {
      form.reset({
        cohortId: cohortId || "",
        devices: selectedDevices,
      });
    }
  }, [open, selectedDevices, form, cohortId]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    unassignDevices(
      {
        cohortId: values.cohortId,
        deviceIds: values.devices,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        },
      }
    );
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={() => handleOpenChange(false)}
      title="Unassign devices from cohort"
      subtitle={`${selectedDevices.length} device(s) selected`}
      size="lg"
      maxHeight="max-h-[70vh]"
      primaryAction={{
        label: "Unassign",
        onClick: form.handleSubmit(onSubmit),
        disabled: !form.watch("cohortId") || !form.watch("devices")?.length || isUnassigning,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: () => handleOpenChange(false),
        variant: "outline",
        disabled: isUnassigning,
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="cohortId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Cohort <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <ComboBox
                    options={cohorts.map((cohort: Cohort) => ({
                      value: cohort._id,
                      label: cohort.name,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select a cohort"
                    searchPlaceholder="Search cohorts..."
                    emptyMessage="No cohorts found"
                    disabled={!!cohortId}
                    className="w-full"
                    allowCustomInput={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="devices"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Devices <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <MultiSelectCombobox
                    options={deviceOptions}
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Select devices..."
                    allowCreate={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ReusableDialog>
  );
}