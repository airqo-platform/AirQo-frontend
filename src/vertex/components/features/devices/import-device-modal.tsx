"use client";

import React, { useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { useImportDevice, useBulkImportDevices } from "@/core/hooks/useDevices";
import type { BulkImportDeviceResponse } from "@/app/types/devices";
import { DEVICE_CATEGORIES } from "@/core/constants/devices";
import { useNetworks } from "@/core/hooks/useNetworks";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useGroupCohorts } from "@/core/hooks/useCohorts";
import { useAppSelector } from "@/core/redux/hooks";
import { usePathname } from "next/navigation";
import logger from "@/lib/logger";
import { NetworkRequestDialog } from "../networks/network-request-dialog";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { DEFAULT_DEVICE_TAGS } from "@/core/constants/devices";
import { Label } from "@/components/ui/label";

interface ImportDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledNetwork?: string;
}

const ImportDeviceModal: React.FC<ImportDeviceModalProps> = ({
  open,
  onOpenChange,
  prefilledNetwork,
}) => {
  const [formData, setFormData] = useState({
    long_name: "",
    network: prefilledNetwork || "",
    category: DEVICE_CATEGORIES[0].value,
    serial_number: "",
    description: "",
    device_number: "",
    writeKey: "",
    readKey: "",
    api_code: "",
    tags: [] as string[],
  });

  const [showMore, setShowMore] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkImportDeviceResponse | null>(null);
  const importDevice = useImportDevice();
  const bulkImport = useBulkImportDevices();
  const { networks, isLoading: isLoadingNetworks } = useNetworks();

  const { userContext, activeGroup } = useUserContext();
  const userDetails = useAppSelector((state) => state.user.userDetails);

  const shouldFetchGroupCohorts = userContext === 'external-org' && !!activeGroup?._id;

  const { data: groupCohorts } = useGroupCohorts(activeGroup?._id, {
    enabled: shouldFetchGroupCohorts,
  });

  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin/');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.long_name.trim()) {
      newErrors.long_name = "Device name is required";
    }
    if (!formData.network) {
      newErrors.network = "Sensor Manufacturer is required";
    }

    if (!formData.serial_number.trim()) {
      newErrors.serial_number = "Serial number is required";
    }

    if (!formData.api_code?.trim()) {
      newErrors.api_code = "Device Connection URL is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCohortId = (): string | undefined => {
    if (userContext === 'external-org' && groupCohorts && groupCohorts.length > 0) {
      return groupCohorts[0];
    }

    return undefined;
  };

  const downloadFailedRows = () => {
    if (!bulkResults || !bulkResults.results) return;
    const failedRows = bulkResults.results.filter(r => !r.success);
    if (failedRows.length === 0) return;

    const headers = ['serial_number', 'long_name', 'error'];
    const csvContent = [
      headers.join(','),
      ...failedRows.map(r => `"${r.serial_number || ''}","${r.long_name || ''}","${(r.error || '').replace(/"/g, '""')}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'failed_devices.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    setErrors({});
    if (bulkFile) {
      const userId = userDetails?._id;
      if (!userId) {
        logger.warn("User ID is missing");
        setErrors({ general: "User ID is missing. Please log in again." });
        return;
      }
      const cohortId = getCohortId();
      const fileName = bulkFile.name.toLowerCase();

      if (fileName.endsWith('.csv')) {
        const formDataPayload = new FormData();
        formDataPayload.append('file', bulkFile);
        formDataPayload.append('user_id', userId);
        if (cohortId) formDataPayload.append('cohort_id', cohortId);
        if (formData.network) formDataPayload.append('network_override', formData.network);

        bulkImport.mutate(
          { type: 'csv', payload: formDataPayload },
          {
            onSuccess: (data) => {
              if (data.results) {
                setBulkResults(data);
              } else {
                onOpenChange(false);
              }
            }
          }
        );
      } else if (fileName.endsWith('.json')) {
        try {
          const text = await bulkFile.text();
          const json = JSON.parse(text);
          const devices = Array.isArray(json) ? json : (json.devices || []);
          if (!Array.isArray(devices) || devices.length === 0) {
            setErrors({ general: 'JSON file must contain an array of devices' });
            return;
          }
          const payload = {
            user_id: userId,
            ...(cohortId && { cohort_id: cohortId }),
            ...(formData.network && { network_override: formData.network }),
            devices
          };
          bulkImport.mutate(
            { type: 'json', payload },
            {
              onSuccess: (data) => {
                if (data.results) {
                  setBulkResults(data);
                } else {
                  onOpenChange(false);
                }
              }
            }
          );
        } catch (e) {
          setErrors({ general: 'Invalid JSON file format' });
        }
      } else {
        setErrors({ general: 'Unsupported file type. Please upload a CSV or JSON file.' });
      }
      return;
    }

    if (!validateForm()) {
      return;
    }

    const deviceDataToSend = { ...formData };

    (Object.keys(deviceDataToSend) as Array<keyof typeof deviceDataToSend>).forEach((key) => {
      if (!deviceDataToSend[key]) {
        delete deviceDataToSend[key];
      }
    });

    const cohortId = getCohortId();
    const userId = userDetails?._id;

    if (!userId) {
      logger.warn("User ID is missing");
      return;
    }

    importDevice.mutate(
      {
        ...deviceDataToSend,
        user_id: userId,
        ...(cohortId && { cohort_id: cohortId }),
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (!open) {
      setFormData({
        long_name: "",
        network: prefilledNetwork || "",
        category: DEVICE_CATEGORIES[0].value,
        serial_number: "",
        description: "",
        device_number: "",
        writeKey: "",
        readKey: "",
        api_code: "",
        tags: [],
      });
      setErrors({});
      setShowMore(false);
      setIsRequestDialogOpen(false);
      setBulkFile(null);
      setBulkResults(null);
    }
  }, [open, prefilledNetwork]);

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleClose}
      title="Import External Device"
      size="md"
      primaryAction={bulkResults ? {
        label: "Done",
        onClick: handleClose,
        className: "min-w-[100px]",
      } : {
        label: importDevice.isPending || bulkImport.isPending ? "Importing..." : "Import External Device",
        onClick: handleSubmit,
        disabled: importDevice.isPending || bulkImport.isPending,
        className: "min-w-[100px]",
      }}
      secondaryAction={
        bulkResults && bulkResults.failed > 0
          ? {
              label: "Download Failed CSV",
              onClick: downloadFailedRows,
              variant: "outline",
            }
          : bulkResults
          ? undefined
          : {
              label: "Cancel",
              onClick: handleClose,
              disabled: importDevice.isPending || bulkImport.isPending,
              variant: "outline",
            }
      }
    >
      <div className="space-y-2">
        {bulkResults ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-md ${bulkResults.failed === 0 ? 'bg-green-50 text-green-700' : bulkResults.imported === 0 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-800'}`}>
              <h3 className="font-medium mb-1">
                {bulkResults.imported} of {bulkResults.total} devices imported. {bulkResults.failed} failed.
              </h3>
            </div>
            
            <div className="border rounded-md max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-medium">Device Name</th>
                    <th className="px-4 py-2 font-medium">Serial Number</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bulkResults.results.map((result, idx) => (
                    <tr key={idx} className={!result.success ? "bg-red-50/50" : ""}>
                      <td className="px-4 py-2">{result.long_name || '-'}</td>
                      <td className="px-4 py-2 font-mono text-xs">{result.serial_number || '-'}</td>
                      <td className="px-4 py-2">
                        {result.success ? (
                          <span className="text-green-600 font-medium">Success</span>
                        ) : (
                          <span className="text-red-600 font-medium text-xs break-words">{result.error || 'Failed'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {errors.general}
              </div>
            )}

            <div className="space-y-1 pb-4 border-b">
              <ReusableInputField
                label="Bulk Import (Optional)"
                id="bulk_file"
                type="file"
                accept=".csv,.json"
                onChange={(e: any) => {
                  const file = e.target.files?.[0];
                  setBulkFile(file || null);
                }}
                placeholder="Upload file to bulk import devices"
              />
              <p className="text-xs text-slate-500">Supported file types are CSV and JSON. If a file is selected, single device fields below will be ignored (except Sensor Manufacturer if you want to override).</p>
            </div>

            <div className={bulkFile ? "opacity-50 pointer-events-none space-y-2" : "space-y-2"}>
              <ReusableInputField
          label="Device Name"
          id="long_name"
          value={formData.long_name}
          onChange={(e) => handleInputChange("long_name", e.target.value)}
          placeholder="Enter device name"
          error={errors.long_name}
          required
        />

        <div>
          <ReusableSelectInput
            label="Sensor Manufacturer"
            id="network"
            value={formData.network}
            onChange={(e) => handleInputChange("network", e.target.value)}
            error={errors.network}
            required
            placeholder={isLoadingNetworks ? "Loading Sensor Manufacturer..." : "Select a Sensor Manufacturer"}
            disabled={isLoadingNetworks}
          >
            {networks
              .filter((network) => network.net_name.toLowerCase() !== 'airqo')
              .map((network) => (
                <option key={network.net_name} value={network.net_name}>
                  {network.net_name}
                </option>
              ))}
          </ReusableSelectInput>

          {!isAdminPage && (
            <div className="flex justify-end">
              <ReusableButton
                onClick={() => setIsRequestDialogOpen(true)}
                variant="text"
                className="text-xs p-0 px-1 mt-1 h-auto"
              >
                Can&apos;t find your Sensor Manufacturer?
              </ReusableButton>
            </div>
          )}
        </div>

        <ReusableSelectInput
          label="Category"
          id="category"
          value={formData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
          error={errors.category}
          required
        >
          {DEVICE_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </ReusableSelectInput>

        <ReusableInputField
          label="Serial Number"
          id="serial_number"
          value={formData.serial_number}
          onChange={(e) => handleInputChange("serial_number", e.target.value)}
          placeholder="Enter serial number"
          error={errors.serial_number}
          required
        />

        <ReusableInputField
          label="Device Connection URL"
          id="api_code"
          value={formData.api_code}
          onChange={(e) => handleInputChange("api_code", e.target.value)}
          placeholder="https://api.mair.com/v1/12345"
          error={errors.api_code}
          required
        />

        <ReusableInputField
          as="textarea"
          label="Description (Optional)"
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Enter device description"
          rows={3}
        />
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags (Optional)</Label>
          <MultiSelectCombobox
            options={DEFAULT_DEVICE_TAGS}
            placeholder="Select or create tags..."
            value={formData.tags}
            onValueChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
            allowCreate={true}
          />
        </div>

        {showMore && (
          <div className="space-y-4 pt-2 border-t">
            <ReusableInputField
              label="Device Number (Optional)"
              id="device_number"
              value={formData.device_number}
              onChange={(e) => handleInputChange("device_number", e.target.value)}
              placeholder="Enter device number"
            />

            <ReusableInputField
              label="Write Key (Optional)"
              id="writeKey"
              value={formData.writeKey}
              onChange={(e) => handleInputChange("writeKey", e.target.value)}
              placeholder="Enter write key"
            />

            <ReusableInputField
              label="Read Key (Optional)"
              id="readKey"
              value={formData.readKey}
              onChange={(e) => handleInputChange("readKey", e.target.value)}
              placeholder="Enter read key"
            />
          </div>
        )}

              <ReusableButton variant="text" onClick={() => setShowMore(!showMore)} className="p-0 h-auto">
                {showMore ? "Show Less" : "Show More Options"}
              </ReusableButton>
            </div>
          </>
        )}
      </div>

      <NetworkRequestDialog 
        open={isRequestDialogOpen} 
        onOpenChange={setIsRequestDialogOpen} 
      />
    </ReusableDialog>
  );
};

export default ImportDeviceModal;
