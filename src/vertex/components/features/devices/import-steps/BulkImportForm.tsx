import React from "react";
import ReusableFileUpload from "@/components/shared/fileupload/ReusableFileUpload";
import { Label } from "@/components/ui/label";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { DEVICE_CATEGORIES, DEFAULT_DEVICE_TAGS } from "@/core/constants/devices";
import type { ImportDeviceFormData } from "./types";
import type { Network } from "@/core/apis/networks";

interface BulkImportFormProps {
  bulkFile: File | null;
  handleFileUpload: (file: File | null) => void;
  errors: Record<string, string>;
  formData: ImportDeviceFormData;
  handleInputChange: (field: string, value: string | boolean | string[]) => void;
  networks: Network[];
  isLoadingNetworks: boolean;
  isAdminPage: boolean;
  setIsRequestDialogOpen: (open: boolean) => void;
}

export const BulkImportForm: React.FC<BulkImportFormProps> = ({
  bulkFile,
  handleFileUpload,
  errors,
  formData,
  handleInputChange,
  networks,
  isLoadingNetworks,
  isAdminPage,
  setIsRequestDialogOpen,
}) => {
  return (
    <div className="space-y-4">
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

      <div className="space-y-4 pt-2">
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
            onValueChange={(tags) => handleInputChange("tags", tags)}
            allowCreate={true}
          />
        </div>
      </div>
    </div>
  );
};
