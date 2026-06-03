"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { useImportDevice, useBulkImportDevices } from "@/core/hooks/useDevices";
import type { BulkImportDeviceResponse } from "@/app/types/devices";
import { DEVICE_CATEGORIES } from "@/core/constants/devices";
import { useNetworks } from "@/core/hooks/useNetworks";
import { useAssignDevicesToCohort } from "@/core/hooks/useCohorts";
import { useAppSelector } from "@/core/redux/hooks";
import { usePathname } from "next/navigation";
import { useBanner } from "@/context/banner-context";
import { useBannerWithDelay } from "@/core/hooks/useBannerWithDelay";
import { NetworkRequestDialog } from "../networks/network-request-dialog";
import Papa from "papaparse";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { AqChevronDown, AqChevronUp } from "@airqo/icons-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

import { EXPECTED_FIELDS } from "./import-steps/types";
import type { ImportDeviceFormData } from "./import-steps/types";
import dynamic from "next/dynamic";

const SingleImportForm = dynamic(() => import("./import-steps/SingleImportForm").then(mod => mod.SingleImportForm));
const BulkImportForm = dynamic(() => import("./import-steps/BulkImportForm").then(mod => mod.BulkImportForm));
const FieldMappingStep = dynamic(() => import("./import-steps/FieldMappingStep").then(mod => mod.FieldMappingStep));
const ImportPreviewStep = dynamic(() => import("./import-steps/ImportPreviewStep").then(mod => mod.ImportPreviewStep));
const CohortSelectionStep = dynamic(() => import("./import-steps/CohortSelectionStep").then(mod => mod.CohortSelectionStep));
const ConfirmationStep = dynamic(() => import("./import-steps/ConfirmationStep").then(mod => mod.ConfirmationStep));
const BulkResultsStep = dynamic(() => import("./import-steps/BulkResultsStep").then(mod => mod.BulkResultsStep));
const ImportSuccessStep = dynamic(() => import("./import-steps/ImportSuccessStep").then(mod => mod.ImportSuccessStep));
const ImportMethodSelectStep = dynamic(() => import("./import-steps/ImportMethodSelectStep").then(mod => mod.ImportMethodSelectStep));

interface StepCardProps {
  title: string;
  stepIndex: number;
  currentStep: number;
  onHeaderClick: (stepIndex: number) => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ title, stepIndex, currentStep, onHeaderClick, children, footer }) => (
  <Card className="mb-4 p-3 shadow-none border border-gray-100 dark:border-gray-800">
    <Collapsible open={currentStep === stepIndex}>
      <CollapsibleTrigger asChild>
        <CardHeader className="cursor-pointer select-none py-0 px-2" onClick={() => onHeaderClick(stepIndex)}>
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            {title}
            <span className="ml-2 text-base">{currentStep === stepIndex ? <AqChevronUp /> : <AqChevronDown />}</span>
          </CardTitle>
        </CardHeader>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <CardContent className="py-2 px-2 pt-4">{children}</CardContent>
        {footer && <CardFooter className="py-2 px-2 pt-2 border-t mt-2">{footer}</CardFooter>}
      </CollapsibleContent>
    </Collapsible>
  </Card>
);

interface ImportDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledNetwork?: string;
  onSuccess?: (deviceInfo?: { deviceId?: string; deviceName?: string; cohortId?: string; isCohortImport?: boolean }) => void;
  mode?: 'guided' | 'fast';
}

const ImportDeviceModal: React.FC<ImportDeviceModalProps> = ({
  open,
  onOpenChange,
  prefilledNetwork,
  onSuccess,
  mode = 'fast',
}) => {
  const isGuidedMode = mode === 'guided';


  
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [importFlow, setImportFlow] = useState<'single' | 'bulk' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [importedDeviceName, setImportedDeviceName] = useState("");
  
  const [formData, setFormData] = useState<ImportDeviceFormData>({
    long_name: "",
    network: prefilledNetwork || "",
    category: DEVICE_CATEGORIES[0].value,
    serial_number: "",
    description: "",
    device_number: "",
    writeKey: "",
    readKey: "",
    api_code: "",
    authRequired: true,
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
  const [transformedPreview, setTransformedPreview] = useState<Record<string, string | string[] | number | boolean | undefined>[]>([]);
  
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [selectedCohortName, setSelectedCohortName] = useState<string>("");

  const { showBanner } = useBanner();
  const { showBannerWithDelay } = useBannerWithDelay();
  const importDevice = useImportDevice();
  const bulkImport = useBulkImportDevices();
  const assignDevicesToCohort = useAssignDevicesToCohort();
  const { networks, isLoading: isLoadingNetworks } = useNetworks();
  const userDetails = useAppSelector((state) => state.user.userDetails);

  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin/');

  const resetState = useCallback(() => {
    setCurrentStep(0);
    setImportFlow(null);
    setIsSuccess(false);
    setImportedDeviceName("");
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
      authRequired: true,
      tags: [],
    });
    setBulkFile(null);
    setBulkResults(null);
    setFileHeaders([]);
    setParsedData([]);
    setImportFlow(null);
    setFieldMapping({});
    setTransformedPreview([]);
    setSelectedCohortId("");
    setSelectedCohortName("");
    setErrors({});
  }, [prefilledNetwork]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (!open) {
      // Delay reset to allow exit animations and prevent reset if open flickers false -> true
      timer = setTimeout(() => {
        resetState();
      }, 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open, resetState]);

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev: ImportDeviceFormData) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const autoMapFields = (headers: string[]) => {
    const initialMapping: Record<string, string> = {};
    const normalizeHeader = (value: string) =>
      value.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const normalizedHeaders = headers.map(normalizeHeader);
    
    EXPECTED_FIELDS.forEach((field: { key: string; label: string; required?: boolean }) => {
      let matchIdx = -1;
      const key = normalizeHeader(field.key);
      
      if (key === 'longname') {
        const aliases = ['longname', 'locationname', 'devicename', 'name'];
        matchIdx = normalizedHeaders.findIndex(h => aliases.includes(h));
      } else if (key === 'serialnumber') {
        const aliases = ['serialnumber', 'locationid', 'serial', 'id'];
        matchIdx = normalizedHeaders.findIndex(h => aliases.includes(h));
      } else if (key === 'authrequired') {
        const aliases = ['authrequired', 'authenticationrequired', 'requiresauth', 'requiredauth', 'auth required'];
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
      setParsedData([]);
      setFileHeaders([]);
      setFieldMapping({});
      setTransformedPreview([]);
      if (currentStep === 0) {
        setImportFlow('single');
      }
      return;
    }

    setImportFlow('bulk');
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
            showBanner({ severity: 'error', message: "The uploaded CSV does not contain any devices.", scoped: true });
            return;
          }

          setFileHeaders(headers);
          setParsedData(rows);
          autoMapFields(headers);
        },
        error: (err: { message: string }) => {
          showBanner({ severity: 'error', message: `Failed to parse CSV: ${err.message}`, scoped: true });
        }
      });
    } else if (fileName.endsWith('.json')) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const devices = Array.isArray(json) ? json : (json.devices || []);
        if (!Array.isArray(devices) || devices.length === 0) {
          showBanner({ severity: 'error', message: 'JSON file must contain an array of devices', scoped: true });
          return;
        }
        const headers = Object.keys(devices[0] || {});
        setFileHeaders(headers);
        setParsedData(devices as Record<string, string | number | undefined>[]);
        autoMapFields(headers);
      } catch {
        showBanner({ severity: 'error', message: 'Invalid JSON file format', scoped: true });
      }
    } else {
      showBanner({ severity: 'error', message: 'Unsupported file type. Please upload a CSV or JSON file.', scoped: true });
    }
  };

  const validateSingleForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.long_name.trim()) newErrors.long_name = "Device name is required";
    if (!formData.network) newErrors.network = "Sensor Manufacturer is required";
    if (!formData.serial_number.trim()) newErrors.serial_number = "Serial number is required";
    if (!formData.api_code?.trim()) newErrors.api_code = "Device Connection URL is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBulkForm = () => {
    if (!bulkFile) {
      showBanner({ severity: 'error', message: "Please upload a file.", scoped: true });
      return false;
    }
    if (!formData.network) {
      showBanner({ severity: 'error', message: "Please select a Sensor Manufacturer.", scoped: true });
      return false;
    }
    if (!formData.category) {
      showBanner({ severity: 'error', message: "Please select a Category.", scoped: true });
      return false;
    }
    return true;
  };

  const transformBulkData = () => {
    const missingRequired = EXPECTED_FIELDS.filter((f: { key: string; label: string; required?: boolean }) => f.required && !fieldMapping[f.key]);
    if (missingRequired.length > 0) {
      showBanner({ severity: 'error', message: `Please map the required fields: ${missingRequired.map((f: { key: string; label: string; required?: boolean }) => f.label).join(', ')}`, scoped: true });
      return false;
    }

    const mappedHeaders = Object.values(fieldMapping).filter(Boolean);
    const duplicateHeaders = mappedHeaders.filter(
      (header, index) => mappedHeaders.indexOf(header) !== index
    );
    if (duplicateHeaders.length > 0) {
      showBanner({ severity: 'error', message: "Each file column can only be mapped once.", scoped: true });
      return false;
    }

    const invalidAuthRows: number[] = [];
    const transformedDevices = parsedData.map((row, rowIndex) => {
      const device: Record<string, string | string[] | number | boolean | undefined> = {};
      EXPECTED_FIELDS.forEach((field: { key: string; label: string; required?: boolean }) => {
        const mappedHeader = fieldMapping[field.key];
        if (mappedHeader && row[mappedHeader] !== undefined && row[mappedHeader] !== "") {
          if (field.key === 'authRequired') {
            const rawValue = String(row[mappedHeader]).trim().toLowerCase();
            const TRUTHY_VALUES = ['true', '1', 'yes', 'y'];
            const FALSY_VALUES = ['false', '0', 'no', 'n'];

            if (TRUTHY_VALUES.includes(rawValue)) {
              device.authRequired = true;
            } else if (FALSY_VALUES.includes(rawValue)) {
              device.authRequired = false;
            } else {
              invalidAuthRows.push(rowIndex + 1);
            }
          } else {
            device[field.key] = row[mappedHeader];
          }
        }
      });

      device.network = formData.network;
      device.category = formData.category;
      if (device.authRequired === undefined) device.authRequired = true;
      if (formData.tags && formData.tags.length > 0) device.tags = formData.tags;

      return device;
    });

    if (invalidAuthRows.length > 0) {
      showBanner({
        severity: 'error',
        message: `Invalid Authentication Required value on row(s): ${invalidAuthRows.join(', ')}. Accepted values are: yes, no, true, false, 1, 0, y, n.`,
        scoped: true,
      });
      return false;
    }

    setTransformedPreview(transformedDevices);
    return true;
  };

  const handleNext = () => {
    if (importFlow === 'bulk') {
      if (currentStep === 0) {
        if (validateBulkForm() && parsedData.length > 0) {
          setCurrentStep(1);
        }
      } else if (currentStep === 1) {
        if (transformBulkData()) {
          setCurrentStep(2);
        }
      } else if (currentStep === 2) {
        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (!isAdminPage && !selectedCohortId) {
          showBanner({ severity: 'error', message: "Please assign the devices to a cohort.", scoped: true });
          return;
        }
        setCurrentStep(4);
      }
    } else if (importFlow === 'single') {
      if (currentStep === 0) {
        if (validateSingleForm()) {
          setCurrentStep(1);
        }
      } else if (currentStep === 1) {
        if (!isAdminPage && !selectedCohortId) {
          showBanner({ severity: 'error', message: "Please assign the device to a cohort.", scoped: true });
          return;
        }
        setCurrentStep(2);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const executeAssignment = (deviceIds: string[], cohortId: string, onAssigned?: () => void) => {
    assignDevicesToCohort.mutate({
      cohortId,
      deviceIds,
    }, {
      onSuccess: () => {
        showBannerWithDelay({
          severity: 'success',
          message: `${deviceIds.length} device(s) assigned to cohort successfully`,
          scoped: false,
        }, 600);
        onAssigned?.();
      },
      onError: (err) => {
        showBanner({ severity: 'error', message: `Device imported, but cohort assignment failed: ${getApiErrorMessage(err)}`, scoped: false });
      }
    });
  };

  const handleCompleteSingle = () => {
    const userId = userDetails?._id;
    if (!userId) return;

    const deviceDataToSend = { ...formData };
    (Object.keys(deviceDataToSend) as Array<keyof typeof deviceDataToSend>).forEach((key) => {
      const value = deviceDataToSend[key];
      if (value === "" || value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
        delete deviceDataToSend[key];
      }
    });

    importDevice.mutate(
      {
        ...deviceDataToSend,
        user_id: userId,
        ...(selectedCohortId && { cohort_id: selectedCohortId }),
      },
      {
        onSuccess: (data, variables) => {
          if (isGuidedMode) {
            setImportedDeviceName(variables.long_name.trim());
            setIsSuccess(true);
          } else {
            onOpenChange(false);
            showBannerWithDelay({
              severity: 'success',
              title: 'Success',
              message: `${variables.long_name.trim()} has been imported successfully.`,
              scoped: false
            }, 300);
          }
          
          if (selectedCohortId && data.created_device?._id) {
            executeAssignment([data.created_device._id], selectedCohortId, () => {
              onSuccess?.({
                deviceId: data.created_device.name || '',
                deviceName: variables.long_name.trim(),
                cohortId: selectedCohortId,
                isCohortImport: true,
              });
            });
          } else {
            onSuccess?.({
              deviceId: data.created_device.name || '',
              deviceName: variables.long_name.trim(),
              cohortId: selectedCohortId,
              isCohortImport: false,
            });
          }
        },
        onError: (error) => {
          showBanner({ severity: 'error', message: `Import Failed: ${getApiErrorMessage(error)}`, scoped: true });
        },
      }
    );
  };

  const handleCompleteBulk = () => {
    const userId = userDetails?._id;
    if (!userId) return;

    const payload = {
      user_id: userId,
      ...(selectedCohortId && { cohort_id: selectedCohortId }),
      ...(formData.network && { network_override: formData.network }),
      devices: transformedPreview
    };

    bulkImport.mutate(
      { type: 'json', payload },
      {
        onSuccess: (data) => {
          const notifyHomeImportSuccess = () => {
            onSuccess?.({
              cohortId: selectedCohortId,
              isCohortImport: !!selectedCohortId,
            });
          };

          if (data.failed === 0 && data.imported > 0) {
            if (isGuidedMode) {
              setImportedDeviceName(`${data.imported} device(s)`);
              setIsSuccess(true);
            } else {
              onOpenChange(false);
              showBannerWithDelay({
                severity: 'success',
                title: 'Success',
                message: `${data.imported} device(s) imported successfully.`,
                scoped: false,
              }, 300);
            }
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
              setIsSuccess(true); // show results
            }
          }

          if (selectedCohortId && data.results) {
            const successfulDeviceIds = data.results.filter(r => r.success && r.created_device?._id).map(r => r.created_device!._id);
            if (successfulDeviceIds.length > 0) {
              executeAssignment(successfulDeviceIds, selectedCohortId, notifyHomeImportSuccess);
            } else if (data.imported > 0) {
              notifyHomeImportSuccess();
            }
          } else if (data.imported > 0) {
            notifyHomeImportSuccess();
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

  const handleComplete = () => {
    if (importFlow === 'bulk') {
      handleCompleteBulk();
    } else {
      handleCompleteSingle();
    }
  };

  const handleHeaderClick = (stepIndex: number) => {
    if (stepIndex > currentStep) {
      handleNext();
    } else {
      setCurrentStep(stepIndex);
    }
  };

  // Build the steps based on the mode
  const getSteps = () => {
    if (importFlow === 'bulk') {
      return [
        {
          title: "File Upload & Settings",
          content: (
            <BulkImportForm 
              bulkFile={bulkFile}
              handleFileUpload={handleFileUpload}
              errors={errors}
              formData={formData}
              handleInputChange={handleInputChange}
              networks={networks}
              isLoadingNetworks={isLoadingNetworks}
              isAdminPage={isAdminPage}
              setIsRequestDialogOpen={setIsRequestDialogOpen}
            />
          ),
          footer: (
            <>
              <ReusableButton variant="outlined" onClick={() => setImportFlow(null)} className="w-32 mr-3">Back</ReusableButton>
              <ReusableButton onClick={handleNext} className="w-32">Next</ReusableButton>
            </>
          )
        },
        {
          title: "Map Fields",
          content: (
            <FieldMappingStep 
              parsedData={parsedData}
              fileHeaders={fileHeaders}
              fieldMapping={fieldMapping}
              setFieldMapping={setFieldMapping}
              errors={errors}
            />
          ),
          footer: (
            <>
              <ReusableButton variant="outlined" onClick={handleBack} className="w-32 mr-3">Back</ReusableButton>
              <ReusableButton onClick={handleNext} className="w-32">Next</ReusableButton>
            </>
          )
        },
        {
          title: "Preview Data",
          content: <ImportPreviewStep transformedPreview={transformedPreview} errors={errors} />,
          footer: (
            <>
              <ReusableButton variant="outlined" onClick={handleBack} className="w-32 mr-3">Back</ReusableButton>
              <ReusableButton onClick={handleNext} className="w-32">Next</ReusableButton>
            </>
          )
        },
        {
          title: "Group Devices",
          content: (
            <CohortSelectionStep 
              selectedCohortId={selectedCohortId} 
              onCohortSelect={(id, name) => { setSelectedCohortId(id); setSelectedCohortName(name); }} 
              open={open && currentStep === 3}
              isAdminPage={isAdminPage}
              preselectedNetwork={formData.network}
            />
          ),
          footer: (
            <>
              <ReusableButton variant="outlined" onClick={handleBack} className="w-32 mr-3">Back</ReusableButton>
              <ReusableButton onClick={handleNext} className="w-32">Next</ReusableButton>
            </>
          )
        },
        {
          title: "Confirmation",
          content: (
            <div className="space-y-4">
              <p className="text-sm">You are about to import {transformedPreview.length} devices.</p>
              {selectedCohortId ? (
                <p className="text-sm">They will be assigned to the selected cohort: <strong>{selectedCohortName}</strong>.</p>
              ) : (
                <p className="text-sm">They will <strong>not</strong> be assigned to any cohort.</p>
              )}
            </div>
          ),
          footer: (
            <>
              <ReusableButton variant="outlined" onClick={handleBack} className="w-32 mr-3" disabled={bulkImport.isPending}>Back</ReusableButton>
              <ReusableButton onClick={handleComplete} className="w-32" loading={bulkImport.isPending}>Complete</ReusableButton>
            </>
          )
        }
      ];
    } else {
      return [
        {
          title: "Device Details",
          content: (
            <SingleImportForm
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              showMore={showMore}
              setShowMore={setShowMore}
              networks={networks}
              isLoadingNetworks={isLoadingNetworks}
              isAdminPage={isAdminPage}
              setIsRequestDialogOpen={setIsRequestDialogOpen}
            />
          ),
          footer: (
            <>
              <ReusableButton variant="outlined" onClick={() => setImportFlow(null)} className="w-32 mr-3">Back</ReusableButton>
              <ReusableButton onClick={handleNext} className="w-32">Next</ReusableButton>
            </>
          )
        },
        {
          title: "Group Devices",
          content: (
            <CohortSelectionStep 
              selectedCohortId={selectedCohortId} 
              onCohortSelect={(id, name) => { setSelectedCohortId(id); setSelectedCohortName(name); }} 
              open={open && currentStep === 1}
              isAdminPage={isAdminPage}
              preselectedNetwork={formData.network}
            />
          ),
          footer: (
            <>
              <ReusableButton variant="outlined" onClick={handleBack} className="w-32 mr-3">Back</ReusableButton>
              <ReusableButton onClick={handleNext} className="w-32">Next</ReusableButton>
            </>
          )
        },
        {
          title: "Confirmation",
          content: <ConfirmationStep formData={formData} selectedCohortId={selectedCohortId} selectedCohortName={selectedCohortName} />,
          footer: (
            <>
              <ReusableButton variant="outlined" onClick={handleBack} className="w-32 mr-3" disabled={importDevice.isPending}>Back</ReusableButton>
              <ReusableButton onClick={handleComplete} className="w-32" loading={importDevice.isPending}>Complete</ReusableButton>
            </>
          )
        }
      ];
    }
  };

  const steps = getSteps();

  return (
    <>
      <ReusableDialog
        isOpen={open}
        onClose={() => onOpenChange(false)}
        title="Import External Device"
        subtitle={isSuccess ? undefined : "Add a device from a different sensor manufacturer"}
        size="3xl"
        maxHeight="max-h-[55vh]"
        preventBackdropClose={true}
      >
        <div className="py-2">
          {isSuccess ? (
            bulkResults ? (
              <BulkResultsStep bulkResults={bulkResults} />
            ) : (
              <ImportSuccessStep deviceName={importedDeviceName} />
            )
          ) : !importFlow ? (
            <div className="p-2">
              <ImportMethodSelectStep 
                onSelect={(method) => {
                  setImportFlow(method);
                  setCurrentStep(0);
                  setErrors({});
                }} 
              />
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <StepCard
                  key={idx}
                  title={step.title}
                  stepIndex={idx}
                  currentStep={currentStep}
                  onHeaderClick={handleHeaderClick}
                  footer={step.footer}
                >
                  {step.content}
                </StepCard>
              ))}
            </div>
          )}
        </div>
      </ReusableDialog>
      <NetworkRequestDialog 
        open={isRequestDialogOpen} 
        onOpenChange={setIsRequestDialogOpen} 
      />
    </>
  );
};

export default ImportDeviceModal;
