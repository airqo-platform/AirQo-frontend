'use client';

import React, { useState, useRef, useEffect } from 'react';
import { addYears, subYears } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { AqChevronDown } from '@airqo/icons-react';

interface YearSelectorProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

export function YearSelector({ currentYear, onYearChange }: YearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate years from current year - 10 to current year + 10 using date-fns
  const baseDate = new Date(currentYear, 0, 1);
  const years = Array.from({ length: 21 }, (_, i) => {
    const yearDate = addYears(subYears(baseDate, 10), i);
    return yearDate.getFullYear();
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleYearSelect = (year: number) => {
    onYearChange(year);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-sm font-semibold hover:bg-accent"
        Icon={AqChevronDown}
        iconPosition="end"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentYear}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-36 rounded-md border bg-popover p-3 shadow-md max-h-48 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`flex h-9 w-9 items-center justify-center rounded-sm text-sm transition-colors ${
                  year === currentYear
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-accent'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
