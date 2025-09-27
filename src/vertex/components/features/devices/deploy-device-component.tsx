"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

import { AqCalendar, AqChevronDown, AqChevronUp } from "@airqo/icons-react";
import ReusableButton from "@/components/shared/button/ReusableButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { Label } from "@/components/ui/label";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useDevices, useDeployDevice } from "@/core/hooks/useDevices";
import { ComboBox } from "@/components/ui/combobox";
import { useAppSelector } from "@/core/redux/hooks";
import { Device } from "@/app/types/devices";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import LocationAutocomplete from "@/components/LocationAutocomplete";
const MiniMap = React.lazy(() => import("../mini-map/mini-map"));

interface MountTypeOption {
  value: string;
  label: string;
}

interface PowerTypeOption {
  value: string;
  label: string;
}

interface DeviceData {
  deviceName: string;
  height: string;
  deployment_date: Date | undefined;
  mountType: string;
  powerType: string;
  isPrimarySite: boolean;
  latitude: string;
  longitude: string;
  siteName: string;
  network: string;
}

interface DeviceDetailsStepProps {
  deviceData: DeviceData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string) => (value: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onCheckboxChange: (checked: boolean) => void;
  availableDevices: Device[];
  onDeviceSelect: (deviceName: string) => void;
  onClaimDevice: () => void;
  isLoadingDevices: boolean;
  isDevicePrefilled: boolean;
}

interface LocationStepProps {
  deviceData: DeviceData;
  onCoordinateChange: (lat: string, lng: string) => void;
  onSiteNameChange: (name: string) => void;
  inputMode: 'siteName' | 'coordinates';
  onToggleInputMode: () => void;
}

interface DeployDeviceComponentProps {
  prefilledDevice?: Device;
  onClose?: () => void;
  availableDevices?: Device[];
  onDeploymentSuccess?: () => void;
  onDeploymentError?: (error: Error) => void;
}

const mountTypeOptions: MountTypeOption[] = [
  { value: "faceboard", label: "Faceboard" },
  { value: "pole", label: "Pole" },
  { value: "rooftop", label: "Rooftop" },
  { value: "suspended", label: "Suspended" },
  { value: "wall", label: "Wall" },
];

const powerTypeOptions: PowerTypeOption[] = [
  { value: "solar", label: "Solar" },
  { value: "mains", label: "Mains" },
  { value: "alternator", label: "Alternator" },
];

const fetchClaimedDevices = async () => {
  const res = await fetch("/api/v2/devices/my-devices?claim_status=claimed");
  if (!res.ok) throw new Error('Failed to fetch devices');
  const data = await res.json();
  return data.devices || [];
};

const DeviceDetailsStep = ({
  deviceData,
  onInputChange,
  onSelectChange,
  onDateChange,
  onCheckboxChange,
  availableDevices,
  onDeviceSelect,
  onClaimDevice,
  isLoadingDevices,
  isDevicePrefilled,
}: DeviceDetailsStepProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="deviceName">Device to Deploy</Label>
        <ComboBox
          options={availableDevices.map((dev) => ({
            value: dev.name,
            label: dev.long_name || dev.name,
          }))}
          value={deviceData.deviceName}
          onValueChange={onDeviceSelect}
          placeholder={isLoadingDevices ? "Loading devices..." : "Select or type device name"}
          searchPlaceholder="Search or type device name..."
          emptyMessage="No devices found"
          disabled={isLoadingDevices || isDevicePrefilled}
          allowCustomInput={!isDevicePrefilled}
          onCustomAction={!isDevicePrefilled ? onClaimDevice : undefined}
          customActionLabel={!isDevicePrefilled ? "Device not listed? Claim a new device" : undefined}
          className="w-full"
        />
      </div>
      <div className="grid gap-2">
        <Label>Deployment Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-700 border-gray-300 transition-colors duration-150 ease-in-out dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-700 dark:disabled:text-gray-400",
                !deviceData.deployment_date && "text-muted-foreground"
              )}
            >
              <AqCalendar className="mr-2 h-4 w-4" />
              {deviceData.deployment_date ? (
                format(deviceData.deployment_date, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={deviceData.deployment_date}
              onSelect={onDateChange}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </PopoverContent>
        </Popover>
      </div>
      <ReusableInputField
        label="Height (meters)"
        id="height"
        name="height"
        type="number"
        placeholder="Enter height"
        value={deviceData.height}
        onChange={onInputChange}
      />
      <ReusableSelectInput
        label="Mount Type"
        id="mountType"
        value={deviceData.mountType}
        onChange={(e) => onSelectChange("mountType")(e.target.value)}
        placeholder="Select mount type"
      >
        {mountTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </ReusableSelectInput>
      <ReusableSelectInput
        label="Power Type"
        id="powerType"
        value={deviceData.powerType}
        onChange={(e) => onSelectChange("powerType")(e.target.value)}
        placeholder="Select power type"
      >
        {powerTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </ReusableSelectInput>
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="primarySite"
          checked={deviceData.isPrimarySite}
          onCheckedChange={(checked) => onCheckboxChange(checked === true)}
        />
        <Label htmlFor="primarySite">Primary Site</Label>
      </div>
    </div>
  );
};

const LocationStep = ({
  deviceData,
  onCoordinateChange,
  onSiteNameChange,
  inputMode,
  onToggleInputMode
}: LocationStepProps) => {

  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Location Input Mode</Label>
          <ReusableButton
            onClick={onToggleInputMode}
            variant="text"
            className="text-sm underline h-auto p-0"
          >
            Switch to {inputMode === 'siteName' ? 'Coordinates' : 'Site Name'}
          </ReusableButton>
        </div>

        {inputMode === 'siteName' ? (
          <div className="grid gap-2">
            <Label htmlFor="siteName">Site Name</Label>
            <LocationAutocomplete
              value={deviceData.siteName}
              onChange={onSiteNameChange}
              onLocationSelect={(location) => {
                onSiteNameChange(location.name);
                onCoordinateChange(location.latitude.toString(), location.longitude.toString());
              }}
              placeholder="Search for a location"
            />
            <p className="text-xs text-muted-foreground">
              Search and select a location to automatically set coordinates
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ReusableInputField
                label="Latitude"
                id="latitude"
                name="latitude"
                placeholder="Enter latitude"
                value={deviceData.latitude}
                onChange={(e) => onCoordinateChange(e.target.value, deviceData.longitude)}
              />
              <ReusableInputField
                label="Longitude"
                id="longitude"
                name="longitude"
                placeholder="Enter longitude"
                value={deviceData.longitude}
                onChange={(e) => onCoordinateChange(deviceData.latitude, e.target.value)}
              />
            </div>
            <ReusableInputField
              label="Custom Site Name"
              id="customSiteName"
              name="customSiteName"
              placeholder="Enter custom site name"
              value={deviceData.siteName}
              onChange={(e) => onSiteNameChange(e.target.value)}
              description="Enter a custom name for this site location. This will be used as a fallback if the map cannot determine a location name automatically."
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Interactive Map</Label>
        <p className="text-sm text-muted-foreground">
          Click on the map to set location or drag the marker. The site name will be automatically
          updated with the location name from Mapbox when you interact with the map.
          {inputMode === 'siteName'
            ? ' You can also search for locations by name.'
            : ' Switch to Site Name mode to search by location name.'}
        </p>
        <React.Suspense fallback={<div className="w-full h-72 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />}>
          <MiniMap
            latitude={deviceData.latitude}
            longitude={deviceData.longitude}
            onCoordinateChange={onCoordinateChange}
            onSiteNameChange={onSiteNameChange}
            inputMode={inputMode}
            customSiteName={inputMode === 'coordinates' ? deviceData.siteName : undefined}
          />
        </React.Suspense>
      </div>
    </div>
  );
};

// StepCard component for collapsible step cards
interface StepCardProps {
  title: string;
  stepIndex: number;
  currentStep: number;
  onHeaderClick: (stepIndex: number) => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}
const StepCard: React.FC<StepCardProps> = ({ title, stepIndex, currentStep, onHeaderClick, children, footer }) => (
  <Card className="mb-4 p-3 shadow-none">
    <Collapsible open={currentStep === stepIndex}>
      <CollapsibleTrigger asChild>
        <CardHeader className="cursor-pointer select-none py-0 px-2" onClick={() => onHeaderClick(stepIndex)}>
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            {title}
            <span className="ml-2 text-base">{currentStep === stepIndex ? <AqChevronUp /> : <AqChevronDown />}</span>
          </CardTitle>
        </CardHeader>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="py-2 px-2">{children}</CardContent>
        {footer && <CardFooter className="py-2 px-2">{footer}</CardFooter>}
      </CollapsibleContent>
    </Collapsible>
  </Card>
);

const DeployDeviceComponent = ({
  prefilledDevice,
  onClose,
  availableDevices: externalAvailableDevices = [],
  onDeploymentSuccess,
  onDeploymentError
}: DeployDeviceComponentProps) => {
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const queryClient = useQueryClient();
  const { isPersonalContext, userDetails } = useUserContext();
  const { devices: allDevices } = useDevices();
  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [inputMode, setInputMode] = React.useState<'siteName' | 'coordinates'>('siteName');

  const [deviceData, setDeviceData] = React.useState<DeviceData>({
    deviceName: prefilledDevice?.name || "",
    deployment_date: undefined,
    height: prefilledDevice?.height?.toString() || "",
    mountType: prefilledDevice?.mountType || "",
    powerType: prefilledDevice?.powerType || "",
    isPrimarySite: prefilledDevice?.isPrimaryInLocation || false,
    latitude: prefilledDevice?.latitude?.toString() || "",
    longitude: prefilledDevice?.longitude?.toString() || "",
    siteName: prefilledDevice?.site_name || "",
    network: activeNetwork?.net_name || "airqo",
  });

  // Use external availableDevices if provided, otherwise use internal filtering
  const filteredAirQoDevices = React.useMemo(() => {
    if (externalAvailableDevices.length > 0) return externalAvailableDevices;
    if (isPersonalContext) return [];
    return allDevices.filter(
      (dev: { status?: string }) => dev.status === "not deployed" || dev.status === "recalled"
    );
  }, [externalAvailableDevices, isPersonalContext, allDevices]);

  // Fetch claimed devices for personal context
  const { data: claimedDevices = [], isLoading: isLoadingClaimedDevices, refetch: refetchDevices } = useQuery({
    queryKey: ['claimedDevices'],
    queryFn: fetchClaimedDevices,
    enabled: isPersonalContext, // Only fetch when in personal context
    refetchOnWindowFocus: true,
  });

  // Choose which devices to show based on context
  const availableDevices = isPersonalContext ? claimedDevices : filteredAirQoDevices;
  const isLoadingDevices = isPersonalContext ? isLoadingClaimedDevices : false;

  const devicesForSelection = React.useMemo(() => {
    if (prefilledDevice) {
      // Check if the prefilled device is already in the list of available devices
      const isDeviceInList = availableDevices.some(
        (device: Device) => device.name === prefilledDevice.name,
      );
      // If not, add it to the beginning of the list for display purposes
      if (!isDeviceInList) {
        return [prefilledDevice, ...availableDevices];
      }
    }
    return availableDevices;
  }, [prefilledDevice, availableDevices]);

  // When returning from claim page, refresh device list (only for personal context)
  React.useEffect(() => {
    if (isPersonalContext) {
      refetchDevices();
    }
  }, [isPersonalContext, refetchDevices]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setDeviceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange =
    (name: string) =>
      (value: string): void => {
        setDeviceData((prev) => ({ ...prev, [name]: value }));
      };

  const handleDateChange = (date: Date | undefined): void => {
    setDeviceData((prev) => ({ ...prev, deployment_date: date }));
  };

  const handleDeviceSelect = (deviceName: string) => {
    setDeviceData((prev) => ({ ...prev, deviceName }));
  };

  const handleClaimDevice = () => {
    // In modal context, we might want to handle this differently
    if (onClose) {
      onClose();
    }
    window.location.href = '/devices/claim';
  };

  const handleCheckboxChange = (checked: boolean): void => {
    setDeviceData((prev) => ({ ...prev, isPrimarySite: checked }));
  };

  const handleCoordinateChange = (lat: string, lng: string): void => {
    setDeviceData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSiteNameChange = (name: string): void => {
    setDeviceData((prev) => ({ ...prev, siteName: name }));
  };

  const toggleInputMode = (): void => {
    setInputMode((prev) => prev === 'siteName' ? 'coordinates' : 'siteName');
  };

  const handleNext = (): void => {
    if (currentStep === 0 && !validateDeviceDetails()) {
      ReusableToast({
        type: "ERROR",
        message: "Incomplete Details: Please fill in all required device details.",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 1));
  };

  const handleBack = (): void => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const validateDeviceDetails = (): boolean => {
    return Boolean(
      deviceData.deviceName &&
      deviceData.deployment_date &&
      deviceData.height &&
      deviceData.mountType &&
      deviceData.powerType
    );
  };

  const validateLocation = (): boolean => {
    return Boolean(deviceData.latitude && deviceData.longitude);
  };

  const deployDevice = useDeployDevice();

  const handleDeploy = (): void => {
    if (!userDetails?._id) {
      ReusableToast({
        type: "ERROR",
        message: "User information not available. Please reload the page.",
      });
      return;
    }

    deployDevice.mutate(
      {
        deviceName: deviceData.deviceName,
        deployment_date: deviceData.deployment_date?.toISOString(),
        height: deviceData.height,
        mountType: deviceData.mountType,
        powerType: deviceData.powerType,
        isPrimaryInLocation: deviceData.isPrimarySite,
        latitude: deviceData.latitude,
        longitude: deviceData.longitude,
        site_name: deviceData.siteName || `${deviceData.deviceName} Site`,
        network: activeNetwork?.net_name || "airqo",
        user_id: userDetails._id,
      },
      {
        onSuccess: () => {
          if (prefilledDevice?._id) {
            queryClient.invalidateQueries({ queryKey: ["device-details", prefilledDevice._id] });
          }

          // On successful deployment, reset form fields
          setDeviceData({
            deviceName: "",
            deployment_date: undefined,
            height: "",
            mountType: "",
            powerType: "",
            isPrimarySite: false,
            latitude: "",
            longitude: "",
            siteName: "",
            network: activeNetwork?.net_name || "-",
          });

          setCurrentStep(0);
          setInputMode("siteName");

          onDeploymentSuccess?.();
          if (onClose) onClose();
        },
        onError: (error) => {
          onDeploymentError?.(error instanceof Error ? error : new Error("Unknown error"));
        },
      }
    );
  };

  // Update handleSectionClick to toggle open/close
  const handleSectionClick = (stepIndex: number) => {
    setCurrentStep((prev) => (prev === stepIndex ? -1 : stepIndex));
  };

  // In DeployDeviceComponent, define steps array and map over it
  const steps = [
    {
      title: "Enter Device Details",
      content: (
        <DeviceDetailsStep
          deviceData={deviceData}
          onInputChange={handleInputChange}
          onDateChange={handleDateChange}
          onSelectChange={handleSelectChange}
          onCheckboxChange={handleCheckboxChange}
          availableDevices={devicesForSelection}
          onDeviceSelect={handleDeviceSelect}
          onClaimDevice={handleClaimDevice}
          isLoadingDevices={isLoadingDevices}
          isDevicePrefilled={!!prefilledDevice}
        />
      ),
      footer: (
        <ReusableButton onClick={handleNext} className="w-32">Next</ReusableButton>
      ),
    },
    {
      title: "Set Deployment Location",
      content: (
        <LocationStep
          deviceData={deviceData}
          onCoordinateChange={handleCoordinateChange}
          onSiteNameChange={handleSiteNameChange}
          inputMode={inputMode}
          onToggleInputMode={toggleInputMode}
        />
      ),
      footer: (
        <>
          <ReusableButton variant="outlined" onClick={handleBack} className="w-32 mr-3">Back</ReusableButton>
          <ReusableButton
            onClick={handleDeploy}
            className="w-32"
            disabled={!(validateDeviceDetails() && validateLocation())}
            loading={deployDevice.isPending}
          >
            {deployDevice.isPending ? "Deploying..." : "Deploy"}
          </ReusableButton>
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Main Steps Column */}
      <div className="flex-1 min-w-0">
        {steps.map((step, idx) => (
          <StepCard
            key={step.title}
            title={step.title}
            stepIndex={idx}
            currentStep={currentStep}
            onHeaderClick={handleSectionClick}
            footer={step.footer}
          >
            {step.content}
          </StepCard>
        ))}
      </div>
    </div>
  );
};

export default DeployDeviceComponent;
