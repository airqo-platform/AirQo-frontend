"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useCohorts, useAssignDevicesToCohort, useGroupCohorts } from "@/core/hooks/useCohorts";
import { useDevices } from "@/core/hooks/useDevices";
import { ComboBox } from "@/components/ui/combobox";
import { AqPlus } from "@airqo/icons-react";
import { MultiSelectCombobox, Option } from "@/components/ui/multi-select";
import { CreateCohortDialog, PreselectedDevice } from "./create-cohort";
import { Cohort } from "@/app/types/cohorts";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { Device } from "@/app/types/devices";
import { useUserContext } from "@/core/hooks/useUserContext";

interface AssignCohortDevicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDevices?: Device[];
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

export function AssignCohortDevicesDialog({
  open,
  onOpenChange,
  selectedDevices,
  onSuccess,
  cohortId,
}: AssignCohortDevicesDialogProps) {
  const { isExternalOrg, activeGroup } = useUserContext();

  const { cohorts: allCohorts } = useCohorts({ enabled: open && !isExternalOrg });
  const { data: groupCohortIds } = useGroupCohorts(
    activeGroup?._id,
    { enabled: open && isExternalOrg && !!activeGroup?._id }
  );

  const { cohorts: groupCohortsDetails } = useCohorts(
    { cohort_id: groupCohortIds, enabled: open && isExternalOrg && !!groupCohortIds && groupCohortIds.length > 0 }
  );
  const cohorts = isExternalOrg ? groupCohortsDetails : allCohorts;

  const { devices: allDevices } = useDevices({ enabled: open });
  const { mutate: assignDevices, isPending: isAssigning } = useAssignDevicesToCohort();

  const [createCohortModalOpen, setCreateCohortModalOpen] = useState(false);
  const [preselectedForCreate, setPreselectedForCreate] = useState<PreselectedDevice[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cohortId: cohortId || "",
      devices: selectedDevices?.map((d) => d._id).filter((id): id is string => !!id) || [],
    },
  });

  const deviceOptions: Option[] = useMemo(() => {
    const combined = [...(selectedDevices ?? []), ...(allDevices ?? [])];
    const unique = new Map<string, Option>();

    combined.forEach((device) => {
      if (!device?._id) return;
      unique.set(device._id, {
        value: device._id,
        label: device.long_name || device.name || `Device ${device._id}`,
      });
    });

    return Array.from(unique.values());
  }, [allDevices, selectedDevices]);

  useEffect(() => {
    if (open) {
      form.reset({
        cohortId: cohortId || "",
        devices: selectedDevices?.map((d) => d._id).filter((id): id is string => !!id) || [],
      });
    }
  }, [open, selectedDevices, form, cohortId]);

  const handleCreateCohortSuccess = () => {
    setCreateCohortModalOpen(false);
    onOpenChange(false);
  };

  const handleCreateCohortClose = (open: boolean) => {
    if (!open) {
      setCreateCohortModalOpen(false);
    }
  };

  const handleCreateCohortAction = () => {
    const selectedIds = form.getValues("devices") || [];
    const preselected = deviceOptions
      .filter((opt) => selectedIds.includes(opt.value))
      .map((opt) => ({ value: opt.value, label: opt.label }));

    setPreselectedForCreate(preselected); // store in state
    onOpenChange(false);
    setCreateCohortModalOpen(true);
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    assignDevices(
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
      setCreateCohortModalOpen(false);
    }
  };

  return (
    <>
      <ReusableDialog
        isOpen={open}
        onClose={() => handleOpenChange(false)}
        title="Add devices to cohort"
        subtitle={`${form.watch("devices")?.length || 0} device(s) selected`}
        size="lg"
        maxHeight="max-h-[70vh]"
        primaryAction={{
          label: "Add",
          onClick: form.handleSubmit(onSubmit),
          disabled: !form.watch("cohortId") || !form.watch("devices")?.length || isAssigning,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => onOpenChange(false),
          variant: "outline",
          disabled: isAssigning,
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
                      customActionLabel="Create New Cohort"
                      customActionIcon={AqPlus}
                      onCustomAction={handleCreateCohortAction}
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

      <CreateCohortDialog
        open={createCohortModalOpen}
        onOpenChange={handleCreateCohortClose}
        onSuccess={handleCreateCohortSuccess}
        preselectedDevices={preselectedForCreate}
        andNavigate={true}
      />

    </>
  );
}