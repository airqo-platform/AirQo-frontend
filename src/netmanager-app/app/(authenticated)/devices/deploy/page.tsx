"use client";

import * as React from "react";
import { Check, MapPin, QrCode } from "lucide-react";

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
import {
  Stepper,
  Step,
  StepDescription,
  StepTitle,
} from "@/components/ui/stepper";
import { useToast } from "@/components/ui/use-toast";
import QRScanner from "@/components/devices/qrcode";

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
  onScanQRCode: () => void;
}

interface LocationStepProps {
  deviceData: DeviceData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

const DeviceDetailsStep = ({
  deviceData,
  onInputChange,
  onSelectChange,
  onCheckboxChange,
  onScanQRCode
}: DeviceDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Button className="w-full" onClick={onScanQRCode}>
          <QrCode className="mr-2 h-4 w-4" />
          Scan QR Code
        </Button>
      </div>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="deviceName">Device Name</Label>
          <Input
            id="deviceName"
            name="deviceName"
            placeholder="Enter device name"
            value={deviceData.deviceName}
            onChange={onInputChange}
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

const LocationStep = ({ deviceData, onInputChange }: LocationStepProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            placeholder="Enter latitude"
            value={deviceData.latitude}
            onChange={onInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            placeholder="Enter longitude"
            value={deviceData.longitude}
            onChange={onInputChange}
          />
        </div>
      </div>
      <div className="relative aspect-video bg-muted rounded-md">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="search">Search Location</Label>
        <Input id="search" placeholder="Search for a location" />
      </div>
    </div>
  );
};

const PreviewStep = ({ deviceData }: PreviewStepProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-medium">Device Name</Label>
            <p className="text-sm text-muted-foreground">
              {deviceData.deviceName}
            </p>
          </div>
          <div>
            <Label className="font-medium">Power Type</Label>
            <p className="text-sm text-muted-foreground">
              {deviceData.powerType}
            </p>
          </div>
          <div>
            <Label className="font-medium">Mount Type</Label>
            <p className="text-sm text-muted-foreground">
              {deviceData.mountType}
            </p>
          </div>
          <div>
            <Label className="font-medium">Height</Label>
            <p className="text-sm text-muted-foreground">
              {deviceData.height} meters
            </p>
          </div>
          <div>
            <Label className="font-medium">Latitude</Label>
            <p className="text-sm text-muted-foreground">
              {deviceData.latitude}
            </p>
          </div>
          <div>
            <Label className="font-medium">Longitude</Label>
            <p className="text-sm text-muted-foreground">
              {deviceData.longitude}
            </p>
          </div>
          <div>
            <Label className="font-medium">Site Name</Label>
            <p className="text-sm text-muted-foreground">
              {deviceData.siteName || "N/A"}
            </p>
          </div>
          <div>
            <Label className="font-medium">Primary Device</Label>
            <p className="text-sm text-muted-foreground">
              {deviceData.isPrimarySite ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <Label className="font-medium">Network</Label>
            <p className="text-sm text-muted-foreground">
              {deviceData.network}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationStep = () => {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold">Device Successfully Deployed</h3>
      <p className="text-muted-foreground">
        Your device has been successfully deployed and is now active.
      </p>
    </div>
  );
};

const DeployDevicePage = () => {
  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [deviceData, setDeviceData] = React.useState<DeviceData>({
    deviceName: "",
    height: "",
    mountType: "",
    powerType: "",
    isPrimarySite: false,
    latitude: "",
    longitude: "",
    siteName: "",
    network: "Network A", // This comes from Redux state
  });
  const [isQRScannerOpen, setIsQRScannerOpen] = React.useState<boolean>(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setDeviceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange =
    (name: string) =>
    (value: string): void => {
      setDeviceData((prev) => ({ ...prev, [name]: value }));
    };

  const handleCheckboxChange = (checked: boolean): void => {
    setDeviceData((prev) => ({ ...prev, isPrimarySite: checked }));
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
    if (currentStep === 1 && !validateLocation()) {
      toast({
        title: "Invalid Location",
        description: "Please enter valid latitude and longitude.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
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

  const handleScanQRCode = (): void => {
    setIsQRScannerOpen(true);
  };

  const handleQRResult = (result: string): void => {
    try {
      // Assuming QR code contains JSON with device data
      const scannedData = JSON.parse(result);
      toast({
        title: "QR Code Scanned",
        description: "Device information has been loaded.",
      });
      
      // Merge scanned data with existing state
      setDeviceData(prev => ({
        ...prev,
        ...scannedData
      }));
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code doesn't contain valid device data.",
        variant: "destructive",
      });
      console.error("QR parsing error:", error);
    }
  };

  const handleDeploy = (): void => {
    // Add API call to deploy the device
    console.log("Deploying device:", deviceData);
    setCurrentStep(3); // Move to confirmation step
    toast({
      title: "Device Deployed",
      description: "Your device has been successfully deployed.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold">Deploy Device</h1>
      <div className="mb-20 pt-4">
        <Stepper index={currentStep} className="mx-auto">
          <Step>
            <StepTitle>Scan QR Code</StepTitle>
            <StepDescription>Or enter manually</StepDescription>
          </Step>
          <Step>
            <StepTitle>Location</StepTitle>
            <StepDescription>Set deployment location</StepDescription>
          </Step>
          <Step>
            <StepTitle>Review</StepTitle>
            <StepDescription>Preview details</StepDescription>
          </Step>
          <Step>
            <StepTitle>Complete</StepTitle>
            <StepDescription>Deployment done</StepDescription>
          </Step>
        </Stepper>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {currentStep === 0 && "Enter Device Details"}
            {currentStep === 1 && "Set Deployment Location"}
            {currentStep === 2 && "Review Deployment Details"}
            {currentStep === 3 && "Deployment Confirmation"}
          </CardTitle>
          <CardDescription>
            {currentStep === 0 &&
              "Scan the QR code or manually enter device information"}
            {currentStep === 1 && "Choose the location for device deployment"}
            {currentStep === 2 && "Review and confirm the deployment details"}
            {currentStep === 3 && "Your device has been successfully deployed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <DeviceDetailsStep
              deviceData={deviceData}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onCheckboxChange={handleCheckboxChange}
              onScanQRCode={handleScanQRCode}
            />
          )}
          {currentStep === 1 && (
            <LocationStep
              deviceData={deviceData}
              onInputChange={handleInputChange}
            />
          )}
          {currentStep === 2 && <PreviewStep deviceData={deviceData} />}
          {currentStep === 3 && <ConfirmationStep />}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="w-32"
          >
            Back
          </Button>
          {currentStep === 2 ? (
            <Button onClick={handleDeploy} className="w-32">
              Deploy
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep === 3}
              className="w-32"
            >
              Next
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* QR Code Scanner Dialog */}
      <QRScanner 
        onResult={handleQRResult}
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </div>
  );
};

export default DeployDevicePage;
