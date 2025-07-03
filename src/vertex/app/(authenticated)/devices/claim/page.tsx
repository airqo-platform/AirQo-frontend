"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Camera, Keyboard, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDeviceAvailability, useClaimDevice } from "@/core/hooks/useDevices";
import { useAppSelector } from "@/core/redux/hooks";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { QRScanner } from "@/components/features/devices/qr-scanner";

const DeviceClaimingPage = () => {
  const router = useRouter();
  const { userDetails } = useAppSelector((state) => state.user);
  const [deviceId, setDeviceId] = useState("");
  const [activeTab, setActiveTab] = useState("manual");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { data: availabilityData, isLoading: checkingAvailability } = useDeviceAvailability(deviceId);
  const claimDevice = useClaimDevice();

  const handleDeviceIdChange = (value: string) => {
    // Strip whitespace and convert to lowercase
    const cleanedValue = value.trim().toLowerCase();
    setDeviceId(cleanedValue);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !userDetails?._id) return;

    await claimDevice.mutateAsync({
      device_name: deviceId,
      user_id: userDetails._id,
    });
  };

  const handleQRScan = (result: string) => {
    handleDeviceIdChange(result);
    setShowQRScanner(false);
    setActiveTab("manual");
  };

  const isDeviceAvailable = availabilityData?.data?.available;
  const deviceStatus = availabilityData?.data?.status;

  return (
    <RouteGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES">
      <div className="container mx-auto p-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/devices/my-devices")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Claim Your Device</h1>
            <p className="text-muted-foreground">
              Add a new AirQo device to your account
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Device Claiming</CardTitle>
            <CardDescription>
              Scan the QR code on your device or enter the device ID manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="qr" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Scanner
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceId">Device ID</Label>
                    <Input
                      id="deviceId"
                      placeholder="Enter device ID (e.g., airqo_g5241)"
                      value={deviceId}
                      onChange={(e) => handleDeviceIdChange(e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  {/* Device Availability Status */}
                  {deviceId && (
                    <div className="space-y-2">
                      {checkingAvailability ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Checking device availability...
                        </div>
                      ) : availabilityData && (
                        <Alert variant={isDeviceAvailable ? "default" : "destructive"}>
                          <div className="flex items-center gap-2">
                            {isDeviceAvailable ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <AlertDescription>
                              {isDeviceAvailable 
                                ? `Device is available for claiming (Status: ${deviceStatus})`
                                : `Device is not available (Status: ${deviceStatus})`
                              }
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!deviceId || !isDeviceAvailable || claimDevice.isPending}
                  >
                    {claimDevice.isPending ? "Claiming Device..." : "Claim Device"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="qr" className="space-y-4">
                <div className="space-y-4">
                  {!showQRScanner ? (
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Click the button below to start scanning the QR code on your device
                      </p>
                      <Button onClick={() => setShowQRScanner(true)} className="w-full">
                        <Camera className="mr-2 h-4 w-4" />
                        Start QR Scanner
                      </Button>
                    </div>
                  ) : (
                    <QRScanner
                      onScan={handleQRScan}
                      onClose={() => setShowQRScanner(false)}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to claim your device:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Locate the QR code or device ID on your AirQo device</li>
                <li>Scan the QR code or manually enter the device ID</li>
                <li>Verify the device is available for claiming</li>
                <li>Click "Claim Device" to add it to your account</li>
                <li>Your device will appear in "My Devices" once claimed</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
};

export default DeviceClaimingPage; 