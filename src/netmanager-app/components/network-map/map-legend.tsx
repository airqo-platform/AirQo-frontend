"use client";

interface LegendItemProps {
  title: string;
  children: React.ReactNode;
}

const LegendItem = ({ title, children }: LegendItemProps) => (
  <div className="flex items-center gap-2">
    {children}
    <span className="text-sm">{title}</span>
  </div>
);

export function MapLegend() {
  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
      <div className="flex items-center gap-6">
        <LegendItem title="Good">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#22c55e" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" fill="#94a3b8"/>
          </svg>
        </LegendItem>
        <LegendItem title="Due">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#eab308" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" fill="#94a3b8"/>
          </svg>
        </LegendItem>
        <LegendItem title="Overdue">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#ef4444" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" fill="#94a3b8"/>
          </svg>
        </LegendItem>
        <div className="w-px h-4 bg-border mx-2" /> {/* Vertical divider */}
        <LegendItem title="Online">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#94a3b8" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" fill="#22c55e"/>
          </svg>
        </LegendItem>
        <LegendItem title="Offline">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#94a3b8" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" fill="#ef4444"/>
          </svg>
        </LegendItem>
      </div>
    </div>
  );
} 