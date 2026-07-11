import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  differenceInDays,
  eachDayOfInterval,
  isValid,
} from 'date-fns';
import { DateRange, CalendarPreset } from '../types';

export class DateUtils {
  static formatDate(date: Date, formatString: string = 'PPP'): string {
    if (!isValid(date)) return '';
    return format(date, formatString);
  }

  static formatDateRange(range: DateRange): string {
    if (!range.from) return '';
    if (!range.to) return DateUtils.formatDate(range.from, 'MMM d, yyyy');

    if (isSameDay(range.from, range.to)) {
      return DateUtils.formatDate(range.from, 'MMM d, yyyy');
    }

    return `${DateUtils.formatDate(range.from, 'MMM d')} - ${DateUtils.formatDate(range.to, 'MMM d, yyyy')}`;
  }

  static isDateDisabled(
    date: Date,
    disabled?: (date: Date) => boolean,
    minDate?: Date,
    maxDate?: Date
  ): boolean {
    if (!isValid(date)) return true;
    if (disabled && disabled(date)) return true;
    if (minDate && isBefore(date, startOfDay(minDate))) return true;
    if (maxDate && isAfter(date, endOfDay(maxDate))) return true;
    return false;
  }

  static isDateSelected(date: Date, selected?: Date | DateRange): boolean {
    if (!selected || !isValid(date)) return false;

    if (selected instanceof Date) {
      return isSameDay(date, selected);
    }

    const range = selected as DateRange;
    if (!range.from) return false;

    if (range.to) {
      return isWithinInterval(date, { start: range.from, end: range.to });
    }

    return isSameDay(date, range.from);
  }

  static isDateInRange(date: Date, range: DateRange): boolean {
    if (!range.from || !range.to || !isValid(date)) return false;
    return isWithinInterval(date, { start: range.from, end: range.to });
  }

  static getCalendarDays(displayMonth: Date): Date[] {
    const start = startOfWeek(startOfMonth(displayMonth));
    const end = endOfWeek(endOfMonth(displayMonth));

    return eachDayOfInterval({ start, end });
  }

  static getDefaultPresets(): CalendarPreset[] {
    const today = new Date();

    return [
      {
        label: 'Today',
        value: { from: today, to: today },
      },
      {
        label: 'Yesterday',
        value: { from: subDays(today, 1), to: subDays(today, 1) },
      },
      {
        label: 'Last 7 days',
        value: { from: subDays(today, 6), to: today },
      },
      {
        label: 'Last 30 days',
        value: { from: subDays(today, 29), to: today },
      },
      {
        label: 'This month',
        value: { from: startOfMonth(today), to: endOfMonth(today) },
      },
      {
        label: 'Last month',
        value: {
          from: startOfMonth(subMonths(today, 1)),
          to: endOfMonth(subMonths(today, 1)),
        },
      },
      {
        label: 'This year',
        value: { from: startOfYear(today), to: endOfYear(today) },
      },
    ];
  }

  static getDaysInMonth(date: Date): number {
    return differenceInDays(endOfMonth(date), startOfMonth(date)) + 1;
  }

  static getWeekdays(): string[] {
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  }

  static getMonthNames(): string[] {
    return [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
  }

  static createTimeString(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  static parseTimeString(timeStr: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  }

  static combineDateTime(date: Date, timeStr: string): Date {
    const { hours, minutes } = DateUtils.parseTimeString(timeStr);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  static isRangeEqual(range1: DateRange, range2: DateRange): boolean {
    if (!range1.from && !range2.from && !range1.to && !range2.to) return true;
    if (!range1.from || !range2.from || !range1.to || !range2.to) return false;

    return (
      isSameDay(range1.from, range2.from) && isSameDay(range1.to, range2.to)
    );
  }

  /**
   * Formats a date to timezone-aware ISO string for backend compatibility
   * Returns format: "2025-07-20T00:00:00.000Z"
   */
  static toBackendDateTime(date: Date, isEndOfDay = false): string {
    if (!isValid(date)) {
      throw new Error('Invalid date provided to toBackendDateTime');
    }

    const dateTime = new Date(date);

    if (isEndOfDay) {
      // Set to end of day: 23:59:59.999
      dateTime.setHours(23, 59, 59, 999);
    } else {
      // Set to start of day: 00:00:00.000
      dateTime.setHours(0, 0, 0, 0);
    }

    // Convert to UTC and format with timezone info
    return dateTime.toISOString();
  }

  /**
   * Formats a DateRange to backend-compatible datetime strings
   */
  static formatRangeForBackend(range: DateRange): {
    startDateTime: string;
    endDateTime: string;
  } {
    if (!range.from) {
      throw new Error('DateRange must have a from date');
    }

    const startDateTime = DateUtils.toBackendDateTime(range.from, false);
    const endDateTime = DateUtils.toBackendDateTime(
      range.to || range.from,
      true
    );

    return { startDateTime, endDateTime };
  }

  /**
   * Creates a DateRange from string dates
   */
  static createRangeFromStrings(fromStr: string, toStr: string): DateRange {
    const from = new Date(fromStr);
    const to = new Date(toStr);

    if (!isValid(from) || !isValid(to)) {
      throw new Error('Invalid date strings provided');
    }

    return { from, to };
  }
}
