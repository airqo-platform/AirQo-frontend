/**
 * Calendar utility functions for generating URLs and ICS files
 * for adding events to various calendar services.
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  url?: string;
}

/**
 * Strip HTML tags from a string, returning plain text.
 */
export const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Format a date for calendar URLs (YYYYMMDDTHHmmssZ format)
 */
const formatDateForUrl = (date: Date): string => {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
};

/**
 * Format a date for ICS file (YYYYMMDDTHHmmssZ format)
 */
const formatDateForIcs = (date: Date): string => {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
};

/**
 * Escape special characters for ICS file
 */
const escapeIcsText = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
};

/**
 * Generate Google Calendar URL
 */
export const getGoogleCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForUrl(event.startDate)}/${formatDateForUrl(event.endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Yahoo Calendar URL
 */
export const getYahooCalendarUrl = (event: CalendarEvent): string => {
  const duration =
    (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60);
  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatDateForUrl(event.startDate),
    et: formatDateForUrl(event.endDate),
    dur: String(Math.max(duration, 0)),
    desc: event.description || '',
    in_loc: event.location || '',
  });
  return `https://calendar.yahoo.com/?${params.toString()}`;
};

/**
 * Generate Outlook.com Calendar URL
 */
export const getOutlookCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
    body: event.description || '',
    location: event.location || '',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Generate Office.com Calendar URL
 */
export const getOfficeCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
    body: event.description || '',
    location: event.location || '',
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Generate ICS file content
 */
export const generateIcsFile = (event: CalendarEvent): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AirQo//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDateForIcs(event.startDate)}`,
    `DTEND:${formatDateForIcs(event.endDate)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description || '')}`,
    `LOCATION:${escapeIcsText(event.location || '')}`,
    `URL:${escapeIcsText(event.url || '')}`,
    `UID:${Date.now()}@airqo.events`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
};

/**
 * Download ICS file for iCal / MS Outlook
 */
export const downloadIcsFile = (event: CalendarEvent): void => {
  const icsContent = generateIcsFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Combine start date and time into a Date object
 */
export const combineDateAndTime = (dateStr: string, timeStr?: string): Date => {
  const date = new Date(dateStr);
  if (timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
  } else {
    date.setHours(9, 0, 0, 0);
  }
  return date;
};
