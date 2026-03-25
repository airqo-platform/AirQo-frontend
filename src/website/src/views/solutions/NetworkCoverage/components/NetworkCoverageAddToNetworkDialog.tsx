'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NetworkProviderOption {
  id: string;
  name: string;
  badge: string;
  summary: string;
  note: string;
}

const providers: NetworkProviderOption[] = [
  {
    id: 'airqo',
    name: 'AirQo',
    badge: 'African city network',
    summary:
      'Built for African cities with a strong focus on public monitoring, analytics, and device-to-platform connectivity.',
    note: 'Recommended for AirQo-compatible network deployments.',
  },
  {
    id: 'miri',
    name: 'Miri Air',
    badge: 'West and East Africa deployments',
    summary:
      'A growing environmental intelligence network with active deployments across Nigeria, Ghana, and Kenya.',
    note: 'Good fit for Miri Air devices and related monitoring stations.',
  },
  {
    id: 'iqair',
    name: 'IQAir AirVisual',
    badge: 'Global public network',
    summary:
      'Widely used for independent PM2.5 visibility across Africa, including institutional and embassy deployments.',
    note: 'Use when your hardware is managed through the IQAir ecosystem.',
  },
  {
    id: 'purpleair',
    name: 'PurpleAir',
    badge: 'Low-cost sensor network',
    summary:
      'Frequently used in African research studies and community monitoring projects across multiple countries.',
    note: 'Suitable for PurpleAir sensor owners and research-led networks.',
  },
  {
    id: 'plume',
    name: 'Plume Labs',
    badge: 'Portable and fleet monitoring',
    summary:
      'Useful for personal exposure tracking and sensor fleet management with live air quality insights.',
    note: 'Best for Plume Labs Flow users and similar portable monitors.',
  },
];

interface NetworkCoverageAddToNetworkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const vertexUrl = 'https://vertex.airqo.net';

const NetworkCoverageAddToNetworkDialog = ({
  isOpen,
  onOpenChange,
}: NetworkCoverageAddToNetworkDialogProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedProvider(null);
    }
  }, [isOpen]);

  const handleContinue = () => {
    window.open(vertexUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-slate-200 bg-white p-0 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            Add your monitor network
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Select the monitor manufacturer or platform that best matches your
            devices. This is a curated list of widely used air quality monitor
            families across Africa and related research or institutional
            deployments. After selecting a provider, continue to Vertex to link
            devices and stream your data.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 sm:px-6">
          <div className="grid gap-3">
            {providers.map((provider) => {
              const isSelected = selectedProvider === provider.id;

              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`rounded-2xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {provider.name}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {provider.badge}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {provider.summary}
                      </p>
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {provider.note}
                      </p>
                    </div>
                    <span
                      className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 text-transparent'
                      }`}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            If you do not see your device listed, use Vertex anyway and choose
            the closest compatible hardware profile during setup.
          </div>
        </div>

        <DialogFooter className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Your selection helps us guide you to the right linking flow in
              Vertex.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!selectedProvider}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Continue to Vertex
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkCoverageAddToNetworkDialog;
