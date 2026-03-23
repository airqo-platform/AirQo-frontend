import React from 'react';

import { type ViewMode } from '../networkCoverageTypes';

interface NetworkCoverageLegendProps {
  viewMode: ViewMode;
}

const NetworkCoverageLegend: React.FC<NetworkCoverageLegendProps> = ({
  viewMode,
}) => {
  const [collapsed, setCollapsed] = React.useState<boolean>(true);

  const toggle = () => setCollapsed((s) => !s);

  const MonitorTypesPanel = (
    <div className="w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600 shadow-lg">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        Monitor types
      </p>
      <div className="flex flex-col gap-1.5">
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Low Cost
          Sensor (LCS)
        </div>
        <div className="flex w-full items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: '#12A86B' }}
          />
          Reference
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
          Inactive
        </div>
      </div>
    </div>
  );

  const CoveragePanel = (
    <div className="w-[196px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600 shadow-lg">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        Monitor coverage
      </p>
      <div className="flex flex-col gap-1.5">
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ECEFF4]" /> 0 monitors
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFE7A3]" /> 1-9
          monitors
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFC95D]" /> 10-49
          monitors
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F39C4A]" /> 50-199
          monitors
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D65A31]" /> 200-999
          monitors
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#8A2D14]" /> 1000+
          monitors
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-start">
      {!collapsed &&
        (viewMode === 'monitors' ? MonitorTypesPanel : CoveragePanel)}

      <button
        aria-expanded={!collapsed}
        onClick={toggle}
        className="mt-2 inline-flex items-center gap-3 rounded-full bg-white px-3 py-1.5 text-[13px] text-slate-600 shadow-lg border border-slate-200"
      >
        {/* small dots - vary by viewMode */}
        <span className="flex items-center gap-1">
          {viewMode === 'monitors' ? (
            <>
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: '#12A86B' }}
              />
              <span className="h-2 w-2 rounded-full bg-slate-400" />
            </>
          ) : (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-[#ECEFF4]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFE7A3]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFC95D]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F39C4A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#D65A31]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#8A2D14]" />
            </>
          )}
        </span>
        <span className="hidden sm:inline">Legend</span>
        <svg
          className={`h-3 w-3 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 8l5 5 5-5"
            stroke="#475569"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default NetworkCoverageLegend;
