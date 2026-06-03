import React from "react";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";
import { DEVICE_CATEGORIES, DEFAULT_DEVICE_TAGS } from "@/core/constants/devices";
import type { ImportDeviceFormData } from "./types";
import type { Network } from "@/core/apis/networks";

interface SingleImportFormProps {
  formData: ImportDeviceFormData;
  errors: Record<string, string>;
  handleInputChange: (field: string, value: string | boolean | string[]) => void;
  showMore: boolean;
  setShowMore: (show: boolean) => void;
  networks: Network[];
  isLoadingNetworks: boolean;
  isAdminPage: boolean;
  setIsRequestDialogOpen: (open: boolean) => void;
}

export const SingleImportForm: React.FC<SingleImportFormProps> = ({
  formData,
  errors,
  handleInputChange,
  showMore,
  setShowMore,
  networks,
  isLoadingNetworks,
  isAdminPage,
  setIsRequestDialogOpen,
}) => {
  return (
    <div className="space-y-4">
      <ReusableInputField
        label="Device Name"
        id="long_name"
        value={formData.long_name}
        onChange={(e) => handleInputChange("long_name", e.target.value)}
        placeholder="Enter device name"
        error={errors.long_name}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReusableSelectInput
          label="Authentication Required"
          id="auth_required"
          value={String(formData.authRequired)}
          onChange={(e) => handleInputChange("authRequired", e.target.value === 'true')}
          placeholder="Choose whether authentication is required"
          required
        >
          <option value="true">True</option>
          <option value="false">False</option>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <ReusableInputField
        as="textarea"
        label="Description (Optional)"
        id="description"
        value={formData.description}
        onChange={(e) => handleInputChange("description", e.target.value)}
        placeholder="Enter device description"
        rows={3}
      />

      {showMore && (
        <div className="space-y-4 pt-2 border-t">
          <ReusableInputField
            label="Device Number (Optional)"
            id="device_number"
            value={formData.device_number}
            onChange={(e) => handleInputChange("device_number", e.target.value)}
            placeholder="Enter device number"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      )}

      <ReusableButton variant="text" onClick={() => setShowMore(!showMore)} className="p-0 h-auto">
        {showMore ? "Show Less" : "Show More Options"}
      </ReusableButton>
    </div>
  );
};
