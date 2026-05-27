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
import { useBanner } from "@/context/banner-context";
import { NetworkRequestDialog } from "../networks/network-request-dialog";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import ReusableFileUpload from "@/components/shared/fileupload/ReusableFileUpload";
import { DEFAULT_DEVICE_TAGS } from "@/core/constants/devices";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";

const EXPECTED_FIELDS = [
  { key: 'long_name', label: 'Device Name', required: true },
  { key: 'serial_number', label: 'Serial Number', required: true },
  { key: 'latitude', label: 'Latitude', required: false },
  { key: 'longitude', label: 'Longitude', required: false },
  { key: 'api_code', label: 'Device Connection URL', required: false },
  { key: 'description', label: 'Description', required: false },
  { key: 'device_number', label: 'Device Number', required: false },
];



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
  const [parsedData, setParsedData] = useState<Record<string, string | number | undefined>[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [mappingMode, setMappingMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [transformedPreview, setTransformedPreview] = useState<Record<string, string | string[] | number | undefined>[]>([]);
  const { showBanner, hideBanner } = useBanner();
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

  const autoMapFields = (headers: string[]) => {
    const initialMapping: Record<string, string> = {};
    const normalizeHeader = (value: string) =>
      value.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const normalizedHeaders = headers.map(normalizeHeader);
    
    EXPECTED_FIELDS.forEach(field => {
      let matchIdx = -1;
      const key = normalizeHeader(field.key);
      
      if (key === 'longname') {
        const aliases = ['longname', 'locationname', 'devicename', 'name'];
        matchIdx = normalizedHeaders.findIndex(h => aliases.includes(h));
      } else if (key === 'serialnumber') {
        const aliases = ['serialnumber', 'locationid', 'serial', 'id'];
        matchIdx = normalizedHeaders.findIndex(h => aliases.includes(h));
      } else {
        matchIdx = normalizedHeaders.findIndex(h => h === key);
      }

      if (matchIdx !== -1) {
        initialMapping[field.key] = headers[matchIdx];
      }
    });
    
    setFieldMapping(initialMapping);
  };

  const handleFileUpload = async (file: File | null) => {
    setBulkFile(file);
    setErrors({});
    if (!file) {
      setMappingMode(false);
      setParsedData([]);
      setFileHeaders([]);
      setFieldMapping({});
      setPreviewMode(false);
      setTransformedPreview([]);
      return;
    }

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, string | number | undefined>[];

          if (rows.length === 0) {
            setFileHeaders(headers);
            setParsedData([]);
            setFieldMapping({});
            setMappingMode(false);
            setErrors({ general: "The uploaded CSV does not contain any devices." });
            return;
          }

          setFileHeaders(headers);
          setParsedData(rows);
          autoMapFields(headers);
          setMappingMode(true);
        },
        error: (err: { message: string }) => {
          setErrors({ general: `Failed to parse CSV: ${err.message}` });
        }
      });
    } else if (fileName.endsWith('.json')) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const devices = Array.isArray(json) ? json : (json.devices || []);
        if (!Array.isArray(devices) || devices.length === 0) {
          setErrors({ general: 'JSON file must contain an array of devices' });
          return;
        }
        const headers = Object.keys(devices[0] || {});
        setFileHeaders(headers);
        setParsedData(devices as Record<string, string | number | undefined>[]);
        autoMapFields(headers);
        setMappingMode(true);
      } catch {
        setErrors({ general: 'Invalid JSON file format' });
      }
    } else {
      setErrors({ general: 'Unsupported file type. Please upload a CSV or JSON file.' });
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    if (mappingMode && parsedData.length > 0) {
      if (!formData.network) {
        setErrors({ general: "Please select a Sensor Manufacturer for this import." });
        return;
      }
      if (!formData.category) {
        setErrors({ general: "Please select a Category for this import." });
        return;
      }

      const missingRequired = EXPECTED_FIELDS.filter(f => f.required && !fieldMapping[f.key]);
      if (missingRequired.length > 0) {
        setErrors({ general: `Please map the required fields: ${missingRequired.map(f => f.label).join(', ')}` });
        return;
      }

      const mappedHeaders = Object.values(fieldMapping).filter(Boolean);
      const duplicateHeaders = mappedHeaders.filter(
        (header, index) => mappedHeaders.indexOf(header) !== index
      );
      if (duplicateHeaders.length > 0) {
        setErrors({ general: "Each file column can only be mapped once." });
        return;
      }

      const transformedDevices = parsedData.map(row => {
        const device: Record<string, string | string[] | number | undefined> = {};
        EXPECTED_FIELDS.forEach(field => {
          const mappedHeader = fieldMapping[field.key];
          if (mappedHeader && row[mappedHeader] !== undefined && row[mappedHeader] !== "") {
            device[field.key] = row[mappedHeader];
          }
        });
        
        device.network = formData.network;
        device.category = formData.category;
        if (formData.tags && formData.tags.length > 0) {
          device.tags = formData.tags;
        }

        return device;
      });

      setTransformedPreview(transformedDevices);
      setMappingMode(false);
      setPreviewMode(true);
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
      showBanner({ severity: 'error', message: 'Unable to identify user. Please reload and try again.', scoped: true });
      return;
    }

    importDevice.mutate(
      {
        ...deviceDataToSend,
        user_id: userId,
        ...(cohortId && { cohort_id: cohortId }),
      },
      {
        onSuccess: (data, variables) => {
          onOpenChange(false);
          setTimeout(() => {
            showBanner({
              severity: 'success',
              title: 'Success',
              message: `${variables.long_name.trim()} has been imported successfully.`,
              scoped: false
            });
          }, 300);
        },
        onError: (error) => {
          showBanner({ severity: 'error', message: `Import Failed: ${getApiErrorMessage(error)}`, scoped: true });
        },
      }
    );
  };

  const handleConfirmImport = () => {
    setErrors({});
    const userId = userDetails?._id;
    if (!userId) {
      logger.warn("User ID is missing");
      setErrors({ general: "User ID is missing. Please log in again." });
      return;
    }
    const cohortId = getCohortId();

    const payload = {
      user_id: userId,
      ...(cohortId && { cohort_id: cohortId }),
      ...(formData.network && { network_override: formData.network }),
      devices: transformedPreview
    };

    bulkImport.mutate(
      { type: 'json', payload },
      {
        onSuccess: (data) => {
          if (data.failed === 0) {
            onOpenChange(false);
            setTimeout(() => {
              showBanner({
                severity: 'success',
                title: 'Success',
                message: `${data.imported} device(s) imported successfully.`,
                scoped: false,
              });
            }, 300);
          } else {
            if (data.imported === 0) {
              showBanner({
                severity: 'error',
                title: 'Import Failed',
                message: `Failed to import all ${data.failed} device(s).`,
                scoped: true,
              });
            } else {
              showBanner({
                severity: 'warning',
                title: 'Partial Import Success',
                message: `${data.imported} device(s) imported successfully, but ${data.failed} failed.`,
                scoped: true,
              });
            }

            if (data.results) {
              setBulkResults(data);
              setPreviewMode(false);
            } else {
              onOpenChange(false);
            }
          }
        },
        onError: (error) => {
          showBanner({
            severity: 'error',
            title: 'Bulk Import Failed',
            message: getApiErrorMessage(error),
            scoped: true,
          });
        }
      }
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
      setParsedData([]);
      setFileHeaders([]);
      setFieldMapping({});
      setMappingMode(false);
      setPreviewMode(false);
      setTransformedPreview([]);
      hideBanner();
    }
  }, [open, prefilledNetwork, hideBanner]);

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
      } : previewMode ? {
        label: importDevice.isPending || bulkImport.isPending ? "Importing..." : "Confirm Import",
        onClick: handleConfirmImport,
        disabled: importDevice.isPending || bulkImport.isPending,
        className: "min-w-[100px]",
      } : {
        label: importDevice.isPending || bulkImport.isPending ? "Importing..." : (mappingMode ? "Preview Import" : "Import External Device"),
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
          : previewMode
          ? {
              label: "Back to Mapping",
              onClick: () => {
                setPreviewMode(false);
                setMappingMode(true);
              },
              disabled: importDevice.isPending || bulkImport.isPending,
              variant: "outline",
            }
          : mappingMode
          ? {
              label: "Cancel Mapping",
              onClick: () => handleFileUpload(null),
              disabled: importDevice.isPending || bulkImport.isPending,
              variant: "outline",
            }
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
        ) : previewMode ? (
          <div className="space-y-4">
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
              <p>Previewing the first {Math.min(5, transformedPreview.length)} of {transformedPreview.length} devices. Please verify the data looks correct before importing.</p>
            </div>
            
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {errors.general}
              </div>
            )}

            <div className="border rounded-md max-h-[400px] overflow-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs uppercase bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium border-b">Device Name</th>
                    <th className="px-4 py-3 font-medium border-b">Serial Number</th>
                    <th className="px-4 py-3 font-medium border-b">Manufacturer</th>
                    <th className="px-4 py-3 font-medium border-b">Category</th>
                    <th className="px-4 py-3 font-medium border-b">Latitude</th>
                    <th className="px-4 py-3 font-medium border-b">Longitude</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transformedPreview.slice(0, 5).map((device, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{device.long_name || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{device.serial_number || '-'}</td>
                      <td className="px-4 py-3">{device.network || '-'}</td>
                      <td className="px-4 py-3">{device.category || '-'}</td>
                      <td className="px-4 py-3">{device.latitude || '-'}</td>
                      <td className="px-4 py-3">{device.longitude || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : mappingMode ? (
          <div className="space-y-4">
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
              <p>We found {parsedData.length} devices in your file. Please map the columns from your file to the expected device fields.</p>
            </div>
            
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {errors.general}
              </div>
            )}

            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium border-b w-1/2">Expected Field</th>
                    <th className="px-4 py-3 font-medium border-b w-1/2">Your File Column</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {EXPECTED_FIELDS.map((field) => (
                    <tr key={field.key} className={field.required && !fieldMapping[field.key] ? "bg-red-50/30" : ""}>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center">
                          <span className="font-medium">{field.label}</span>
                          {field.required && <span className="ml-1 text-red-500">*</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 p-2"
                          value={fieldMapping[field.key] || ""}
                          onChange={(e) => setFieldMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                        >
                          <option value="">-- Ignore this field --</option>
                          {fileHeaders.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 pt-4 mt-4 border-t">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-200">Apply to all imported devices:</h4>
              
              <div>
                <ReusableSelectInput
                  label="Sensor Manufacturer"
                  id="network_bulk"
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
                id="category_bulk"
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
            </div>
          </div>
        ) : (
          <>
            {errors.general && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {errors.general}
              </div>
            )}

            <ReusableFileUpload
              label="Import multiple devices at once."
              id="bulk_file"
              accept=".csv,.json"
              file={bulkFile}
              onChange={handleFileUpload}
              placeholder="Upload bulk import file"
              description="Supported file types are CSV and JSON."
              containerClassName="pb-4 border-b"
            />

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
