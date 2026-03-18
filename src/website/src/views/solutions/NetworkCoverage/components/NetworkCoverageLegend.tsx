import React from 'react';

import { ViewMode } from '../mockup';

interface NetworkCoverageLegendProps {
  viewMode: ViewMode;
}

const NetworkCoverageLegend: React.FC<NetworkCoverageLegendProps> = ({
  viewMode,
}) => {
  if (viewMode === 'monitors') {
    return (
      <div className="w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600 shadow-lg">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          Monitor types
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex w-full items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> LCS
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            Reference
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            Inactive
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[170px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600 shadow-lg">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        Monitor coverage
      </p>
      <div className="flex flex-col gap-1.5">
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8ECF3]" /> No monitors
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#CCD9FF]" /> 1 monitor
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#8EADFF]" /> 2-3
          monitors
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4D79F2]" /> 4-6
          monitors
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1C56E3]" /> +7 monitors
        </div>
      </div>
    </div>
  );
};

export default NetworkCoverageLegend;
