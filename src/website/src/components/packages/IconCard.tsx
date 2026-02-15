'use client';
import type { ComponentType, SVGProps } from 'react';
import React from 'react';

interface IconCardProps {
  name: string;
  component: ComponentType<SVGProps<SVGSVGElement>>;
  onClick: () => void;
}

export default function IconCard({
  name,
  component: Icon,
  onClick,
}: IconCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-500 transition-all duration-200 flex flex-col items-center gap-2"
    >
      <div className="w-8 h-8 flex items-center justify-center text-gray-700 group-hover:text-blue-600 transition-colors">
        <Icon className="w-full h-full" />
      </div>
      <p className="text-xs text-gray-600 text-center truncate w-full group-hover:text-gray-900">
        {name}
      </p>
    </button>
  );
}
