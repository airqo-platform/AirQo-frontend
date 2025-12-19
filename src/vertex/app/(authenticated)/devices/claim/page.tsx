"use client";

import React, { useState } from "react";
import {
  Smartphone,
  FileSpreadsheet,
  Wifi,
  QrCode,
  HelpCircle,
  CheckCircle2,
  Database
} from "lucide-react";
import ClaimDeviceModal, { FlowStep } from "@/components/features/claim/claim-device-modal";
import { useUserContext } from "@/core/hooks/useUserContext";

const DeviceClaimingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialStep, setInitialStep] = useState<FlowStep>('method-select');
  const { isPersonalContext, activeGroup } = useUserContext();

  const handleOpenModal = (step: FlowStep) => {
    setInitialStep(step);
    setIsModalOpen(true);
  };

  const getDescriptionText = () => {
    if (isPersonalContext) {
      return "Add devices to your personal account. Once added, you can easily transfer them to your organization's workspace.";
    }

    const groupName = activeGroup?.grp_title || "your organization";
    return `Add devices to ${groupName} organization. You will be able to deploy, monitor online status and more.`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Claim Your Devices
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            {getDescriptionText()}
          </p>
        </div>

        {/* Main Action Cards - The "Intent" Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Option A: Single Device (Smartphone/QR Context) */}
          <button
            onClick={() => handleOpenModal('qr-scan')}
            className="flex flex-col text-left p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Add Single Device
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Best for setting up a new monitor at home or a specific site.
              Scan the QR code or enter the ID manually.
            </p>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline mt-auto">
              Start Setup &rarr;
            </span>
          </button>

          {/* Option B: Bulk Import (File/Office Context) */}
          <button
            onClick={() => handleOpenModal('bulk-input')}
            className="flex flex-col text-left p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Bulk Import
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Ideal for organizations deploying a fleet.
              Upload a CSV file or enter multiple IDs at once.
            </p>
            <span className="text-sm font-medium text-green-600 dark:text-green-400 group-hover:underline mt-auto">
              Import Batch &rarr;
            </span>
          </button>

          {/* Option C: Import from Cohort */}
          <button
            onClick={() => handleOpenModal('cohort-import')}
            className="flex flex-col text-left p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Import from Cohort
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Connect pre-provisioned device groups.
              Enter a Cohort ID to setup multiple devices instantly.
            </p>
            <span className="text-sm font-medium text-violet-600 dark:text-violet-400 group-hover:underline mt-auto">
              Verify & Import &rarr;
            </span>
          </button>
        </div>

        {/* Onboarding / Preparation Section */}
        <div className="grid md:grid-cols-3 gap-8 pt-4">

          {/* Checklist */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-500" />
              Before you start
            </h4>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <Wifi className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white block mb-1">Check WiFi Connectivity</span>
                  <span className="text-gray-500 dark:text-gray-400">Ensure the installation site has reliable 2.4GHz WiFi coverage.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <QrCode className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white block mb-1">Locate Device Label</span>
                  <span className="text-gray-500 dark:text-gray-400">Have the physical device or the box ready to scan the QR code.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Support Links */}
          {/* TODO: Create documentation pages for device claiming help resources */}
          <div className="pl-4 border-l border-gray-200 dark:border-gray-700 hidden md:block">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-500" />
              Need Help?
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                {/* TODO: Add link to Device ID location guide */}
                <button
                  type="button"
                  disabled
                  className="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  title="Documentation coming soon"
                >
                  Where do I find the Device ID?
                </button>
              </li>
              <li>
                {/* TODO: Add link to CSV template download */}
                <button
                  type="button"
                  disabled
                  className="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  title="Template coming soon"
                >
                  Download Bulk Import Template
                </button>
              </li>
              <li>
                {/* TODO: Add link to support contact form or email */}
                <button
                  type="button"
                  disabled
                  className="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  title="Support link coming soon"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* The Modal handles the actual logic */}
      <ClaimDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialStep={initialStep}
      />
    </div>
  );
};

export default DeviceClaimingPage;