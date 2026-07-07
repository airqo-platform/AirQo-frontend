'use client';
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="bg-white border border-[#e4e4e7] rounded-lg p-4 hover:border-[#d4d4d8] transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-[#f4f4f5] rounded-lg flex items-center justify-center text-[#52525b]">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#71717a] mb-0.5">{label}</p>
          <p className="text-[20px] font-semibold tracking-[-0.02em] text-[#18181b] font-variant-numeric:tabular-nums">
            {value}
          </p>
          {description && (
            <p className="text-[12px] text-[#a1a1aa] mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
