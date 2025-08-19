"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDeviceAvailability, useClaimDevice } from "@/core/hooks/useDevices";
import { useAppSelector } from "@/core/redux/hooks";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { QRScanner } from "@/components/features/devices/qr-scanner";
import { PERMISSIONS } from "@/core/permissions/constants";

const DeviceClaimingPage = () => {
  const router = useRouter();
  const { userDetails } = useAppSelector((state) => state.user);
  const [deviceId, setDeviceId] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimedDeviceId, setClaimedDeviceId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

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
    const data = await claimDevice.mutateAsync({
      device_name: deviceId,
      user_id: userDetails._id,
    });
    setClaimSuccess(true);
    setClaimedDeviceId(data.device?.name || deviceId);
  };

  const handleQRScan = (result: string) => {
    try {
      // Try to parse the result as JSON first, trimming whitespace
      const parsedResult = JSON.parse(result.trim());
      const deviceName = parsedResult?.name;
      if (typeof deviceName === "string" && deviceName.length > 0) {
        handleDeviceIdChange(deviceName);
      } else {
        handleDeviceIdChange(result);
      }
    } catch {
      handleDeviceIdChange(result);
    }
    setShowQRScanner(false);
  };

  const isDeviceAvailable = availabilityData?.data?.available;
  const deviceStatus = availabilityData?.data?.status;

  return (
    <RouteGuard permission={PERMISSIONS.DEVICE.UPDATE}>
      <div>
        {/* Dismissible Info Section */}
        {showInfo && (
          <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-6 py-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <QrCode className="h-7 w-7 text-blue-500" />
              <div>
                <h3 className="font-semibold text-base mb-0.5">Claim your new device</h3>
                <p className="text-sm text-gray-700">Claiming a device links it to your account, enabling you to manage and deploy it within your organization.</p>
              </div>
            </div>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowInfo(false)}
              aria-label="Dismiss"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Device Claiming</CardTitle>
            <CardDescription>
              Scan the QR code on your device or enter the device ID manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            {claimSuccess ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-8">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                  <h2 className="text-xl font-semibold text-green-700">Device claimed successfully!</h2>
                  <p className="text-muted-foreground text-center">You can now deploy your device or view all your devices.</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => router.push(`/devices/activate?deviceId=${claimedDeviceId}`)}
                    className="w-40"
                  >
                    Deploy Device
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/devices/overview")}
                    className="w-40"
                  >
                    View All Devices
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Device Name Input with QR Scan Button */}
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceId">Device ID</Label>
                    <div className="relative">
                      <Input
                        id="deviceId"
                        placeholder="Enter device ID (e.g., airqo_g5241)"
                        value={deviceId}
                        onChange={(e) => handleDeviceIdChange(e.target.value)}
                        className="font-mono pr-12"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted focus:bg-muted transition"
                        onClick={() => setShowQRScanner(true)}
                        aria-label="Scan QR Code"
                      >
                        <QrCode className="h-5 w-5 text-blue-500" />
                      </button>
                    </div>
                  </div>

                  {/* QR Scanner Modal/Section */}
                  {showQRScanner && (
                    <div className="my-4">
                      <QRScanner
                        onScan={handleQRScan}
                        onClose={() => setShowQRScanner(false)}
                      />
                    </div>
                  )}

                  {/* Claim Error Message */}
                  {claimDevice.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {((): string => {
                          const error = claimDevice.error;
                          const response = error?.response;
                          const status = response?.status;
                          const data = response?.data;
                          if (status === 500) {
                            return "Something went wrong on our end. Please try again later.";
                          }
                          if (data && typeof data === 'object' && 'errors' in data && data.errors && typeof data.errors === 'object' && 'message' in data.errors && data.errors.message) {
                            return String(data.errors.message);
                          }
                          if (data?.message) {
                            return String(data.message);
                          }
                          if (error?.message) {
                            return String(error.message);
                          }
                          return "An unknown error occurred.";
                        })()}
                      </AlertDescription>
                    </Alert>
                  )}

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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
};

export default DeviceClaimingPage; 