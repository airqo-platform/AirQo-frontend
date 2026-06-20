'use client';

import React, { useState, useEffect } from 'react';
import { useIotStore } from '@/store/useIotStore';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { FirmwareVersion } from '@/types/firmware.types';
import firmwareService from '@/services/firmware.service';

interface FlashingPanelProps {
  firmwareVersions?: FirmwareVersion[];
}

export const FlashingPanel: React.FC<FlashingPanelProps> = ({ firmwareVersions = [] }) => {
  const { adapter, status, flashProgress, deviceInfo } = useIotStore();
  const [isFlashing, setIsFlashing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectedFirmware, setSelectedFirmware] = useState('');

  useEffect(() => {
    if (firmwareVersions.length > 0 && !selectedFirmware) {
      setSelectedFirmware(firmwareVersions[0].id || '');
    }
  }, [firmwareVersions, selectedFirmware]);

  const selectedFw = firmwareVersions.find(fw => fw.id === selectedFirmware);

  // Check compatibility
  const isArduino = deviceInfo?.chipType === 'Arduino';
  const isCompatible = selectedFw ? (isArduino ? !!selectedFw.firmware_string_hex : !!selectedFw.firmware_string) : false;

  const handleFlashRequest = () => {
    if (!isCompatible) {
      setError("Selected firmware is not compatible with the connected device.");
      return;
    }
    setShowConfirmModal(true);
  };

  const executeFlash = async () => {
    setShowConfirmModal(false);
    if (!adapter || !selectedFirmware) return;
    
    setIsFlashing(true);
    setError(null);
    
    try {
      if (!selectedFw) throw new Error("Selected firmware not found in list.");
      
      const isArduino = deviceInfo?.chipType === 'Arduino';
      if (isArduino && !selectedFw.firmware_string_hex) {
        throw new Error("This firmware version does not have a HEX file available for Arduino.");
      } else if (!isArduino && !selectedFw.firmware_string) {
        throw new Error("This firmware version does not have a BIN file available for ESP.");
      }

      useIotStore.getState().setFlashProgress({ phase: 'preparing', percentage: 5, message: 'Downloading firmware...' });
      
      const fileType = isArduino ? 'hex' : 'bin';
      const firmwareUrl = firmwareService.getDownloadUrl({
        firmware_id: selectedFw.id,
        file_type: fileType,
      });
      
      await adapter.flash(firmwareUrl, (progress) => {
        useIotStore.getState().setFlashProgress(progress);
      });
      
      await adapter.reboot();
      
    } catch (err) {
      console.error(err);
      const msg = (err as Error).message || 'Flashing failed';
      setError(msg);
      useIotStore.getState().setFlashProgress({ phase: 'error', percentage: 100, message: msg });
    } finally {
      setIsFlashing(false);
      // Removed the timeout so progress stays visible
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <UploadCloud className="text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Firmware Flashing</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Firmware Version
          </label>
          <select 
            value={selectedFirmware}
            onChange={(e) => setSelectedFirmware(e.target.value)}
            disabled={isFlashing || status !== 'connected'}
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            {firmwareVersions.length === 0 && <option value="">No firmware available</option>}
            {firmwareVersions.map((fw) => (
              <option key={fw.id} value={fw.id}>
                {fw.firmware_version} ({fw.firmware_type || 'unknown'})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFlashRequest}
          disabled={isFlashing || status !== 'connected' || !isCompatible}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !isCompatible ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
        >
          {isFlashing ? 'Flashing...' : (!isCompatible ? 'Incompatible Firmware' : 'Flash to Device')}
        </button>

        {/* Progress UI */}
        {flashProgress && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{flashProgress.phase}</span>
              <span className="text-gray-500">{Math.round(flashProgress.percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  flashProgress.phase === 'error' ? 'bg-red-600' : 'bg-blue-600'
                }`}
                style={{ width: `${flashProgress.percentage}%` }}
              ></div>
            </div>
            {flashProgress.message && (
              <p className="text-xs text-gray-500 mt-2">{flashProgress.message}</p>
            )}
          </div>
        )}

        {/* Success / Error States */}
        {error && !flashProgress && (
          <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {flashProgress?.phase === 'completed' && !error && (
          <div className="flex items-center space-x-2 text-green-600 text-sm mt-2">
            <CheckCircle2 size={16} />
            <span>Flashing completed successfully!</span>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative w-auto max-w-md mx-auto my-6 z-50">
            <div className="relative flex flex-col w-full bg-white dark:bg-gray-800 border-0 rounded-lg shadow-lg outline-none focus:outline-none">
              <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <AlertCircle className="text-yellow-500 mr-2" />
                  Confirm Flashing
                </h3>
              </div>
              <div className="relative p-6 flex-auto">
                <p className="my-4 text-gray-500 dark:text-gray-300 text-sm leading-relaxed">
                  You are about to flash firmware version <strong className="text-gray-900 dark:text-white">{selectedFw?.firmware_version}</strong> to the connected device.
                  This will completely overwrite the existing firmware.
                </p>
                <p className="mb-4 text-gray-500 dark:text-gray-300 text-sm leading-relaxed">
                  Do not unplug the device during this process. Are you sure you want to proceed?
                </p>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200 dark:border-gray-700">
                <button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={executeFlash}
                >
                  Confirm Flash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
