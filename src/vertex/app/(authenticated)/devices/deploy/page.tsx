"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useDevices, useDeployDevice } from "@/core/hooks/useDevices";
import { ComboBox } from "@/components/ui/combobox";
import { MiniMap } from "@/components/features/mini-map/mini-map";
import { useAppSelector } from "@/core/redux/hooks";
import LocationAutocomplete from "@/components/LocationAutocomplete";

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
  onCheckboxChange: (checked: boolean) => void;
  availableDevices: DeviceData[];
  onDeviceSelect: (deviceName: string) => void;
  onClaimDevice: () => void;
  isLoadingDevices: boolean;
}

interface LocationStepProps {
  deviceData: DeviceData;
  onCoordinateChange: (lat: string, lng: string) => void;
  onSiteNameChange: (name: string) => void;
  inputMode: 'siteName' | 'coordinates';
  onToggleInputMode: () => void;
}

interface PreviewStepProps {
  deviceData: DeviceData;
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
  const res = await fetch('/api/v2/devices/my-devices?claim_status=claimed');
  if (!res.ok) throw new Error('Failed to fetch devices');
  const data = await res.json();
  return data.devices || [];
};

const DeviceDetailsStep = ({
  deviceData,
  onInputChange,
  onSelectChange,
  onCheckboxChange,
  availableDevices,
  onDeviceSelect,
  onClaimDevice,
  isLoadingDevices
}: DeviceDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="deviceName">Device to Deploy</Label>
          <ComboBox
            options={availableDevices.map((dev) => ({
              value: dev.long_name || dev.name,
              label: dev.long_name || dev.name
            }))}
            value={deviceData.deviceName}
            onValueChange={onDeviceSelect}
            placeholder={isLoadingDevices ? 'Loading devices...' : 'Select or type device name'}
            searchPlaceholder="Search or type device name..."
            emptyMessage="No devices found"
            disabled={isLoadingDevices}
            allowCustomInput={true}
            onCustomAction={onClaimDevice}
            customActionLabel="Device not listed? Claim a new device"
            className="w-full"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="height">Height (meters)</Label>
          <Input
            id="height"
            name="height"
            type="number"
            placeholder="Enter height"
            value={deviceData.height}
            onChange={onInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mountType">Mount Type</Label>
          <Select
            onValueChange={onSelectChange("mountType")}
            value={deviceData.mountType}
          >
            <SelectTrigger id="mountType">
              <SelectValue placeholder="Select mount type" />
            </SelectTrigger>
            <SelectContent>
              {mountTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="powerType">Power Type</Label>
          <Select
            onValueChange={onSelectChange("powerType")}
            value={deviceData.powerType}
          >
            <SelectTrigger id="powerType">
              <SelectValue placeholder="Select power type" />
            </SelectTrigger>
            <SelectContent>
              {powerTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="primarySite"
            checked={deviceData.isPrimarySite}
            onCheckedChange={onCheckboxChange}
          />
          <Label htmlFor="primarySite">Primary Site</Label>
        </div>
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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Location Input Mode</Label>
          <button
            type="button"
            onClick={onToggleInputMode}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Switch to {inputMode === 'siteName' ? 'Coordinates' : 'Site Name'}
          </button>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                placeholder="Enter latitude"
                value={deviceData.latitude}
                onChange={(e) => onCoordinateChange(e.target.value, deviceData.longitude)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                placeholder="Enter longitude"
                value={deviceData.longitude}
                onChange={(e) => onCoordinateChange(deviceData.latitude, e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Interactive Map</Label>
        <p className="text-sm text-muted-foreground">
          Click on the map to set location or drag the marker. 
          {inputMode === 'siteName' 
            ? 'Map will show location based on site name.' 
            : 'Coordinates will be updated as you interact with the map.'}
        </p>
        <MiniMap
          latitude={deviceData.latitude}
          longitude={deviceData.longitude}
          siteName={deviceData.siteName}
          onCoordinateChange={onCoordinateChange}
          onSiteNameChange={onSiteNameChange}
          inputMode={inputMode}
        />
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
            <span className="ml-2 text-base">▼</span>
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

// Add SummaryItem component
const SummaryItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-primary font-semibold text-sm">{label}</div>
    <div className="text-base">{value}</div>
  </div>
);

const DeployDevicePage = () => {
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceIdFromUrl = searchParams.get('deviceId');

  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [inputMode, setInputMode] = React.useState<'siteName' | 'coordinates'>('siteName');
  const [deviceData, setDeviceData] = React.useState<DeviceData>({
    deviceName: deviceIdFromUrl || "",
    height: "",
    mountType: "",
    powerType: "",
    isPrimarySite: false,
    latitude: "",
    longitude: "",
    siteName: "",
    network: activeNetwork?.net_name || "Network A", // Get network from Redux state
  });
  const { toast } = useToast();
  const { isPersonalContext, userDetails } = useUserContext();
  const { devices: allDevices, isLoading: isLoadingAllDevices } = useDevices();
  const deployDevice = useDeployDevice();

  // Filter AirQo devices for internal context: not deployed or recalled
  const filteredAirQoDevices = React.useMemo(() => {
    if (isPersonalContext) return [];
    return allDevices.filter(
      (dev) =>
        dev.status === "not deployed" ||
        dev.status === "recalled"
    );
  }, [isPersonalContext, allDevices]);

  // Fetch claimed devices for personal context
  const { data: claimedDevices = [], isLoading: isLoadingClaimedDevices, refetch: refetchDevices } = useQuery({
    queryKey: ['claimedDevices'],
    queryFn: fetchClaimedDevices,
    enabled: isPersonalContext, // Only fetch when in personal context
    refetchOnWindowFocus: true,
  });

  // Choose which devices to show based on context
  const availableDevices = isPersonalContext ? claimedDevices : filteredAirQoDevices;
  const isLoadingDevices = isPersonalContext ? isLoadingClaimedDevices : isLoadingAllDevices;

  // If deviceIdFromUrl changes (e.g., on client navigation), update deviceName if not already set
  React.useEffect(() => {
    if (deviceIdFromUrl && !deviceData.deviceName) {
      setDeviceData((prev) => ({ ...prev, deviceName: deviceIdFromUrl }));
    }
  }, [deviceIdFromUrl]);

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

  const handleDeviceSelect = (deviceName: string) => {
    setDeviceData((prev) => ({ ...prev, deviceName }));
  };

  const handleClaimDevice = () => {
    router.push('/devices/claim');
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
      toast({
        title: "Incomplete Details",
        description: "Please fill in all required device details.",
        variant: "destructive",
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
        deviceData.height &&
        deviceData.mountType &&
        deviceData.powerType
    );
  };

  const validateLocation = (): boolean => {
    return Boolean(deviceData.latitude && deviceData.longitude);
  };

  const handleDeploy = async (): Promise<void> => {
    if (!userDetails?._id) {
      toast({
        title: "Error",
        description: "User information not available. Please reload the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deployDevice.mutateAsync({
        deviceName: deviceData.deviceName,
        height: deviceData.height,
        mountType: deviceData.mountType,
        powerType: deviceData.powerType,
        isPrimaryInLocation: deviceData.isPrimarySite,
        latitude: deviceData.latitude,
        longitude: deviceData.longitude,
        site_name: deviceData.siteName || `${deviceData.deviceName} Site`,
network: activeNetwork?.net_name || "airqo",
        user_id: userDetails._id,
      });
      
      // On successful deployment, redirect to devices page
      
    } catch (error) {
      console.error('Deployment failed:', error);
      // Error handling is already done in the useDeployDevice hook
    }
  };

  // Update handleSectionClick to toggle open/close
  const handleSectionClick = (stepIndex: number) => {
    setCurrentStep((prev) => (prev === stepIndex ? -1 : stepIndex));
  };

  // In DeployDevicePage, define steps array and map over it
  const steps = [
    {
      title: "Enter Device Details",
      content: (
        <DeviceDetailsStep
          deviceData={deviceData}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onCheckboxChange={handleCheckboxChange}
          availableDevices={availableDevices}
          onDeviceSelect={handleDeviceSelect}
          onClaimDevice={handleClaimDevice}
          isLoadingDevices={isLoadingDevices}
        />
      ),
      footer: (
        <Button onClick={handleNext} className="w-32">Next</Button>
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
          <Button variant="outline" onClick={handleBack} className="w-32">Back</Button>
          <Button 
            onClick={handleDeploy} 
            className="w-32" 
            disabled={!(validateDeviceDetails() && validateLocation()) || deployDevice.isLoading}
          >
            {deployDevice.isLoading ? "Deploying..." : "Deploy"}
          </Button>
        </>
      ),
    },
  ];

  // In the sidebar summary section:
  const summaryFields = [
    { label: "Device", value: deviceData.deviceName || "-" },
    { label: "Height", value: `${deviceData.height || "-"} m` },
    { label: "Mount", value: deviceData.mountType || "-" },
    { label: "Power", value: deviceData.powerType || "-" },
    { label: "Site Name", value: deviceData.siteName || "-" },
    { label: "Lat", value: deviceData.latitude || "-" },
    { label: "Lng", value: deviceData.longitude || "-" },
    { label: "Primary", value: deviceData.isPrimarySite ? "Yes" : "No" },
    { label: "Network", value: deviceData.network || "-" },
  ];

  return (
    <div className="container mx-auto p-6 flex flex-col md:flex-row gap-8">
      {/* Main Steps Column */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-semibold mb-4">Deploy Device</h1>
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
      {/* Sidebar */}
      <div className="w-full md:w-80 flex-shrink-0">
        <div className="sticky top-8">
          <Card className="p-3 md:p-4">
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer select-none py-0 px-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Summary
                    <span className="ml-2 text-base">▼</span>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent
                  className="space-y-4 px-2 pb-2 pt-2"
                  style={{ maxHeight: '40vh', overflowY: 'auto' }}
                >
                  {summaryFields.map((item) => (
                    <SummaryItem key={item.label} label={item.label} value={item.value} />
                  ))}
                </CardContent>
              </CollapsibleContent>
              <CardFooter className="flex flex-col gap-2 border-t py-2 px-2">
                <Button
                  type="submit"
                  onClick={handleDeploy}
                  className="w-full"
                  disabled={!(validateDeviceDetails() && validateLocation()) || deployDevice.isLoading}
                >
                  {deployDevice.isLoading ? "Deploying..." : "Deploy"}
                </Button>
              </CardFooter>
            </Collapsible>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeployDevicePage;