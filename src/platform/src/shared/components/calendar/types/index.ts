import { Locale } from 'date-fns';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface DateTimeRange extends DateRange {
  timeRange?: TimeRange;
}

export interface CalendarPreset {
  label: string;
  value: DateRange;
  shortcut?: string;
}

export interface CalendarProps {
  mode?: 'single' | 'range';
  selected?: Date | DateRange;
  onSelect?: (date: Date | DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  locale?: Locale;
  className?: string;
  showTime?: boolean;
  numberOfMonths?: number;
  showPresets?: boolean;
  onApply?: (value: DateRange) => void;
  initialRange?: DateRange;
}

export interface SingleCalendarProps {
  onApply?: (value: DateRange) => void;
  onCancel?: () => void;
  initialRange?: DateRange;
}

export interface RangeCalendarProps {
  showPresets?: boolean;
  onApply?: (value: DateRange) => void;
  onCancel?: () => void;
  initialRange?: DateRange;
}

export interface DatePickerProps {
  value?: Date | DateRange;
  onChange?: (
    date: Date | DateRange | string | { from: string; to: string } | undefined
  ) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  mode?: 'single' | 'range';
  showTime?: boolean;
  showPresets?: boolean;
  presets?: CalendarPreset[];
  className?: string;
  align?: 'start' | 'end' | 'center';
  showTimeToggle?: boolean;
  maxWidth?: string;
  useDialog?: boolean;
  contentClassName?: string;
  returnFormat?: 'date' | 'datetime' | 'backend-datetime';
}

export interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
  disabled?: boolean;
  format24h?: boolean;
}

export interface DateTimeInputProps {
  date?: Date;
  time?: string;
  onDateChange?: (date: Date | undefined) => void;
  onTimeChange?: (time: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}
