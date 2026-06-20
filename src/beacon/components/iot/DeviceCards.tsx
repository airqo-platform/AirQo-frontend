'use client';

import React, { useState } from 'react';
import { useIotStore } from '@/store/useIotStore';
import { useDeviceConnection } from '@/hooks/iot/useDeviceConnection';
import { Cpu, Usb, Unplug, Wifi, AlertTriangle, Download } from 'lucide-react';
import { useLocalAgentWatcher } from '@/hooks/iot/useLocalAgentWatcher';

export const DeviceCards: React.FC = () => {
  useLocalAgentWatcher();
  const { status, deviceInfo, isLocalAgentRunning, availablePorts } = useIotStore();
  const { connectESP, connectArduino, disconnect } = useDeviceConnection();
  
  const [comPort, setComPort] = useState('');

  // Auto-select the first port if available and none selected
  React.useEffect(() => {
    if (availablePorts.length > 0 && !comPort) {
      setComPort(availablePorts[0].path);
    }
  }, [availablePorts, comPort]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Cpu className="text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Device Connection</h2>
          
          <div className="ml-4 flex items-center">
            {isLocalAgentRunning ? (
              <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Agent Online
              </span>
            ) : (
              <span className="flex items-center text-xs font-medium text-red-600 dark:text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
                Agent Offline
              </span>
            )}
          </div>
        </div>
        <div>
          {status === 'connected' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Connected
            </span>
          ) : status === 'connecting' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Connecting...
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              Disconnected
            </span>
          )}
        </div>
      </div>

      {status === 'connected' && deviceInfo ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Chip Type</p>
              <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.chipType}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Port</p>
              <p className="font-medium text-gray-900 dark:text-white truncate">{deviceInfo.portName || 'Unknown'}</p>
            </div>
          </div>
          
          <button
            onClick={disconnect}
            className="w-full flex justify-center items-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors dark:bg-gray-800 dark:text-red-400 dark:border-red-800 dark:hover:bg-gray-700"
          >
            <Unplug size={16} className="mr-2" />
            Disconnect Device
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connect to an ESP via native Web Serial, or an Arduino via the Local Agent.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={connectESP}
              disabled={status === 'connecting'}
              className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <Usb size={16} className="mr-2 text-blue-500" />
              Connect ESP (Browser)
            </button>
            
            {isLocalAgentRunning ? (
              <div className="flex flex-col space-y-2">
                {availablePorts.length > 0 ? (
                  <select
                    value={comPort}
                    onChange={(e) => setComPort(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white px-3 py-2"
                  >
                    {availablePorts.map((p) => (
                      <option key={p.path} value={p.path}>
                        {p.path} {p.manufacturer ? `(${p.manufacturer})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="block w-full border border-gray-300 rounded-md bg-gray-100 text-gray-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 px-3 py-2 text-center">
                    No devices detected
                  </div>
                )}
                <button
                  onClick={() => connectArduino(comPort)}
                  disabled={status === 'connecting' || !comPort || availablePorts.length === 0}
                  className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
                >
                  <Wifi size={16} className="mr-2" />
                  Connect Arduino (Agent)
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  The Local Agent is required to connect to Arduino devices.
                </p>
                <div className="flex space-x-2">
                  <a href="#" className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    <Download size={12} className="mr-1" /> Mac
                  </a>
                  <a href="#" className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    <Download size={12} className="mr-1" /> Windows
                  </a>
                </div>
              </div>
            )}
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-start text-sm dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle size={16} className="mr-2 mt-0.5 shrink-0" />
              <p>Connection failed. Make sure the Local Agent is running if connecting to Arduino, or that you granted browser permissions for ESP.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
