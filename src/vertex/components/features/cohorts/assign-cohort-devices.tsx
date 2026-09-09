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
import { DeviceNameParser } from "./device-name-parser";
import { Cohort } from "@/app/types/cohorts";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { Device } from "@/app/types/devices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useBanner } from "@/context/banner-context";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";
import { getCohortAssignmentOutcome } from "@/core/utils/cohortAssignment";
import { useBannerWithDelay } from "@/core/hooks/useBannerWithDelay";

interface AssignCohortDevicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDevices?: Device[];
  onSuccess?: () => void;
  cohortId?: string;
  title?: string;
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
  title = "Add devices to cohort",
}: AssignCohortDevicesDialogProps) {
  const { isExternalOrg, activeGroup } = useUserContext();
  const { showBanner } = useBanner();
  const { showBannerWithDelay } = useBannerWithDelay();
  const [cohortSearch, setCohortSearch] = useState("");
  const [debouncedCohortSearch, setDebouncedCohortSearch] = useState("");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [debouncedDeviceSearch, setDebouncedDeviceSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCohortSearch(cohortSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [cohortSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDeviceSearch(deviceSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [deviceSearch]);

  const { cohorts: allCohorts, isFetching: isFetchingAllCohorts } = useCohorts({
    enabled: open && !isExternalOrg,
    search: debouncedCohortSearch,
    limit: 100
  });

  const { data: groupCohortIds, isFetching: isFetchingCohortIds } = useGroupCohorts(
    activeGroup?._id,
    { enabled: open && isExternalOrg && !!activeGroup?._id }
  );

  const { cohorts: searchedCohorts, isFetching: isFetchingGroupCohorts } = useCohorts({
    enabled: open && isExternalOrg && !!activeGroup?._id,
    search: debouncedCohortSearch,
    limit: 100
  });

  const filteredGroupCohorts = useMemo(() => {
    if (!isExternalOrg || !groupCohortIds || groupCohortIds.length === 0) {
      return searchedCohorts;
    }
    const cohortIdSet = new Set(groupCohortIds);
    return searchedCohorts.filter(cohort => cohortIdSet.has(cohort._id));
  }, [isExternalOrg, searchedCohorts, groupCohortIds]);

  const cohorts = isExternalOrg ? filteredGroupCohorts : allCohorts;
  const isFetchingCohorts = isExternalOrg ? (isFetchingGroupCohorts || isFetchingCohortIds) : isFetchingAllCohorts;

  // Complete device pool for matching and selection (not restricted by active combobox search or 100-item page)
  const { devices: completeDevices, isFetching: isFetchingCompleteDevices } = useDevices({
    enabled: open,
    limit: 2000,
  });

  const { devices: searchedDevices, isFetching: isFetchingSearchedDevices } = useDevices({
    enabled: open && !!debouncedDeviceSearch,
    search: debouncedDeviceSearch,
  });

  const [importedDevices, setImportedDevices] = useState<Device[]>([]);

  const isFetchingDevices = debouncedDeviceSearch
    ? isFetchingSearchedDevices
    : isFetchingCompleteDevices;

  const { mutate: assignDevices, isPending: isAssigning } = useAssignDevicesToCohort({
    onSuccess: (data, variables) => {
      showBannerWithDelay({
        ...getCohortAssignmentOutcome(data, variables.deviceIds.length),
        scoped: false,
      });
    },
    onError: (error) => {
      showBanner({
        severity: 'error',
        message: `Failed to assign devices: ${getApiErrorMessage(error)}`,
        scoped: true,
      });
    },
  });

  const [createCohortModalOpen, setCreateCohortModalOpen] = useState(false);
  const [preselectedForCreate, setPreselectedForCreate] = useState<PreselectedDevice[]>([]);
  const [preselectedNetworkForCreate, setPreselectedNetworkForCreate] = useState<string | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cohortId: cohortId || "",
      devices: selectedDevices?.map((d) => d._id).filter((id): id is string => !!id) || [],
    },
  });

  const selectedDeviceIds = form.watch("devices") || [];
  const watchedCohortId = form.watch("cohortId");

  const deviceById = useMemo(() => {
    const combined = [
      ...(selectedDevices ?? []),
      ...(completeDevices ?? []),
      ...(searchedDevices ?? []),
      ...importedDevices,
    ];
    const unique = new Map<string, Device>();

    combined.forEach((device) => {
      if (!device?._id) return;
      unique.set(device._id, device);
    });

    return unique;
  }, [completeDevices, searchedDevices, selectedDevices, importedDevices]);

  const deviceOptions: Option[] = useMemo(() => {
    if (debouncedDeviceSearch) {
      const selectedIds = new Set(selectedDeviceIds);
      const optionsMap = new Map<string, Option>();

      (searchedDevices ?? []).forEach((device) => {
        if (!device?._id) return;
        optionsMap.set(device._id, {
          value: device._id,
          label: device.long_name || device.name || `Device ${device._id}`,
        });
      });

      // Also ensure all currently selected devices are present in options so their badge labels resolve
      selectedIds.forEach((id) => {
        if (!optionsMap.has(id)) {
          const device = deviceById.get(id);
          optionsMap.set(id, {
            value: id,
            label: device?.long_name || device?.name || `Device ${id}`,
          });
        }
      });

      return Array.from(optionsMap.values());
    }

    return Array.from(deviceById.values()).map((device) => ({
      value: device._id as string,
      label: device.long_name || device.name || `Device ${device._id}`,
    }));
  }, [debouncedDeviceSearch, searchedDevices, deviceById, selectedDeviceIds]);

  useEffect(() => {
    if (open) {
      form.reset({
        cohortId: cohortId || "",
        devices: selectedDevices?.map((d) => d._id).filter((id): id is string => !!id) || [],
      });
      setCohortSearch("");
      setDebouncedCohortSearch("");
      setDeviceSearch("");
      setDebouncedDeviceSearch("");
      setImportedDevices([]);
    }
  }, [open, form, cohortId, selectedDevices]);

  // andNavigate={true} means CreateCohortDialog shows its own "Success!"
  // step instead of closing immediately — don't close it here too.
  const handleCreateCohortSuccess = () => {
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

    // CreateCohortDialog resets its device field when its network changes,
    // so without a starting network the user picking one wipes this
    // preselection — carry over the first device's network too.
    const preselectedNetwork = selectedIds
      .map((id) => deviceById.get(id)?.network)
      .find((network): network is string => !!network);

    setPreselectedForCreate(preselected); // store in state
    setPreselectedNetworkForCreate(preselectedNetwork);
    onOpenChange(false);
    setCreateCohortModalOpen(true);
  };

  const handleDeviceImport = (deviceNames: string[]) => {
    // Resolve imported device names against the complete device set (independent of active combobox search and 100-item page)
    const devicePool = completeDevices.length > 0 ? completeDevices : Array.from(deviceById.values());

    if (devicePool.length === 0) {
      showBanner({
        severity: "warning",
        message: "No devices available to match against. Please wait for devices to load.",
        scoped: true,
      });
      return;
    }

    const matchedDevices: Device[] = [];
    const matchedIds: string[] = [];
    let notFoundCount = 0;

    deviceNames.forEach((name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const nameLower = trimmed.toLowerCase();

      // 1. Try exact match on name, long_name, or _id
      let match = devicePool.find(
        (d) =>
          d.name?.toLowerCase() === nameLower ||
          d.long_name?.toLowerCase() === nameLower ||
          d._id?.toLowerCase() === nameLower
      );

      // 2. Fall back to contains match if nameLower length >= 3
      if (!match && nameLower.length >= 3) {
        match = devicePool.find(
          (d) =>
            d.name?.toLowerCase().includes(nameLower) ||
            d.long_name?.toLowerCase().includes(nameLower)
        );
      }

      if (match?._id) {
        matchedDevices.push(match);
        matchedIds.push(match._id);
      } else {
        notFoundCount++;
      }
    });

    const uniqueMatchedIds = Array.from(new Set(matchedIds));

    if (uniqueMatchedIds.length === 0) {
      showBanner({
        severity: "warning",
        message: "No matching devices found. Please ensure the devices exist.",
        scoped: true,
      });
      return;
    }

    // Preserve matched Device objects so their metadata / labels remain available in deviceById
    setImportedDevices((prev) => {
      const prevIds = new Set(prev.map((d) => d._id));
      const newlyAdded = matchedDevices.filter((d) => !prevIds.has(d._id));
      return [...prev, ...newlyAdded];
    });

    // Merge with existing selections
    const currentDevices = form.getValues("devices") || [];
    const uniqueDevices = Array.from(
      new Set([...currentDevices, ...uniqueMatchedIds])
    );
    form.setValue("devices", uniqueDevices, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const importedCount = uniqueMatchedIds.length;

    if (notFoundCount > 0) {
      showBanner({
        severity: "warning",
        message: `Imported ${importedCount} device${
          importedCount !== 1 ? "s" : ""
        }. ${notFoundCount} not found.`,
        scoped: true,
      });
    } else {
      showBanner({
        severity: "success",
        message: `Imported ${importedCount} device${
          importedCount !== 1 ? "s" : ""
        } successfully.`,
        scoped: true,
      });
    }
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
      setImportedDevices([]);
    }
  };

  return (
    <>
      <ReusableDialog
        isOpen={open}
        onClose={() => handleOpenChange(false)}
        title={title}
        subtitle={`${selectedDeviceIds.length} device(s) selected`}
        size="lg"
        maxHeight="max-h-[70vh]"
        primaryAction={{
          label: "Add",
          onClick: form.handleSubmit(onSubmit),
          disabled: !watchedCohortId || !selectedDeviceIds.length || isAssigning,
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
                      onSearchChange={setCohortSearch}
                      isLoading={isFetchingCohorts}
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
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">
                      Devices <span className="text-red-500">*</span>
                    </FormLabel>
                    <DeviceNameParser
                      onDevicesParsed={handleDeviceImport}
                      shouldBlock={isFetchingCompleteDevices && completeDevices.length === 0}
                      tooltipMessage="Loading devices..."
                    />
                  </div>
                  <FormControl>
                  <MultiSelectCombobox
                    options={deviceOptions}
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Select devices..."
                    allowCreate={false}
                    onSearchChange={setDeviceSearch}
                    searchValue={deviceSearch}
                    emptyMessage={isFetchingDevices ? "Searching devices..." : "No devices found."}
                  />
                </FormControl>
                {isFetchingDevices && (
                  <p className="text-xs text-muted-foreground">Searching devices...</p>
                )}
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
        preselectedNetwork={preselectedNetworkForCreate}
        andNavigate={true}
      />

    </>
  );
}
