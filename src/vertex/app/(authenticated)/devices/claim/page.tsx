"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, CheckCircle, X, Keyboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ClaimDeviceModal, { ClaimedDeviceInfo } from "@/components/features/claim/claim-device-modal";

type ClaimMethod = 'qr-scan' | 'manual-input' | null;

const DeviceClaimingPage = () => {
  const router = useRouter();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<ClaimMethod>(null);
  const [lastClaimedDevice, setLastClaimedDevice] = useState<ClaimedDeviceInfo | null>(null);
  const [showSuccessState, setShowSuccessState] = useState(false);

  const handleClaimSuccess = (deviceInfo: ClaimedDeviceInfo) => {
    setLastClaimedDevice(deviceInfo);
    setShowSuccessState(true);
    setIsClaimModalOpen(false);
  };

  const handleClaimAnotherDevice = () => {
    setShowSuccessState(false);
    setLastClaimedDevice(null);
    setSelectedMethod(null);
    setIsClaimModalOpen(true);
  };

  const handleOpenModal = (method: ClaimMethod) => {
    setSelectedMethod(method);
    setIsClaimModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsClaimModalOpen(false);
    setSelectedMethod(null);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Claim your new device</CardTitle>
          <CardDescription>
            Claiming a device links it to your account, enabling you to manage and deploy it within your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSuccessState && lastClaimedDevice ? (
            // Success State
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-green-700 dark:text-green-400">
                  Device claimed successfully!
                </h2>
                <p className="text-muted-foreground text-center">
                  You can now deploy your device or view all your devices.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push(`/devices/deploy/${lastClaimedDevice}`)}
                  className="w-full sm:w-40"
                >
                  Deploy Device
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/devices/overview")}
                  className="w-full sm:w-40"
                >
                  View All Devices
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClaimAnotherDevice}
                  className="w-full sm:w-40"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Claim Another
                </Button>
              </div>
            </div>
          ) : (
            // Method Selection
            <div className="space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose how you&apos;d like to add your device.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleOpenModal('qr-scan')}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <QrCode className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                  <span className="font-medium text-gray-900 dark:text-white text-lg">
                    Scan QR Code
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Fast & automatic
                  </span>
                </button>

                <button
                  onClick={() => handleOpenModal('manual-input')}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Keyboard className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                  <span className="font-medium text-gray-900 dark:text-white text-lg">
                    Enter Manually
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Type device details
                  </span>
                </button>
              </div>

              {/* Quick Tips */}
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Where to find device details
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li><strong>QR Code:</strong> Located on the device shipping label</li>
                  <li><strong>Device ID:</strong> Printed below the QR code (e.g., aq_g5_001)</li>
                  <li><strong>Claim Token:</strong> Unique code on the shipping label</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Device Modal */}
      <ClaimDeviceModal
        isOpen={isClaimModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleClaimSuccess}
        redirectOnSuccess={false}
        initialStep={selectedMethod || 'method-select'}
      />
    </div>
  );
};

export default DeviceClaimingPage;