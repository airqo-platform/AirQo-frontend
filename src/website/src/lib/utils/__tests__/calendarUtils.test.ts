import {
  CalendarEvent,
  combineDateAndTime,
  generateIcsFile,
  getGoogleCalendarUrl,
  getOfficeCalendarUrl,
  getOutlookCalendarUrl,
  getYahooCalendarUrl,
  stripHtml,
} from '../calendarUtils';

const baseEvent: CalendarEvent = {
  title: 'AirQo Forum 2025',
  description: 'Annual air quality conference',
  location: 'Kampala, Uganda',
  startDate: new Date('2025-06-15T10:00:00Z'),
  endDate: new Date('2025-06-15T17:00:00Z'),
  url: 'https://airqo.events/forum2025',
};

describe('calendarUtils', () => {
  describe('stripHtml', () => {
    it('strips simple HTML tags', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello');
    });

    it('strips nested tags', () => {
      expect(stripHtml('<div><span><b>Bold text</b></span></div>')).toBe(
        'Bold text',
      );
    });

    it('collapses whitespace', () => {
      expect(stripHtml('<p>  Hello   world  </p>')).toBe('Hello world');
    });

    it('handles self-closing tags', () => {
      expect(stripHtml('Line 1<br/>Line 2')).toBe('Line 1Line 2');
    });

    it('does not decode HTML entities', () => {
      expect(stripHtml('<p>&amp; &lt; &gt;</p>')).toBe('&amp; &lt; &gt;');
    });

    it('returns empty string for empty tags', () => {
      expect(stripHtml('<p></p>')).toBe('');
    });

    it('handles plain text without tags', () => {
      expect(stripHtml('No tags here')).toBe('No tags here');
    });

    it('handles mixed content', () => {
      expect(stripHtml('Hello <b>world</b> how <i>are</i> you')).toBe(
        'Hello world how are you',
      );
    });

    it('handles multiple adjacent tags', () => {
      expect(stripHtml('<a><b><i>text</i></b></a>')).toBe('text');
    });

    it('handles attributes in tags', () => {
      expect(stripHtml('<p class="test" id="main">Content</p>')).toBe(
        'Content',
      );
    });
  });

  describe('getGoogleCalendarUrl', () => {
    it('generates correct URL with all params', () => {
      const url = getGoogleCalendarUrl(baseEvent);
      expect(url).toContain('https://calendar.google.com/calendar/render?');
      expect(url).toContain('action=TEMPLATE');
      expect(url).toContain('text=AirQo+Forum+2025');
      expect(url).toContain('location=Kampala');
      expect(url).toContain('details=Annual+air+quality+conference');
    });

    it('generates URL with empty optional fields', () => {
      const event: CalendarEvent = {
        title: 'Test',
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-01-01T01:00:00Z'),
      };
      const url = getGoogleCalendarUrl(event);
      expect(url).toContain('details=');
      expect(url).toContain('location=');
    });

    it('contains correct date format in dates param', () => {
      const url = getGoogleCalendarUrl(baseEvent);
      expect(url).toContain('dates=');
      expect(url).toContain('20250615');
    });
  });

  describe('getYahooCalendarUrl', () => {
    it('generates correct URL with duration', () => {
      const url = getYahooCalendarUrl(baseEvent);
      expect(url).toContain('https://calendar.yahoo.com/?');
      expect(url).toContain('v=60');
      expect(url).toContain('title=AirQo+Forum+2025');
      expect(url).toContain('dur=420');
    });

    it('sets duration to 0 for zero-length events', () => {
      const event: CalendarEvent = {
        title: 'Instant',
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-01-01T00:00:00Z'),
      };
      const url = getYahooCalendarUrl(event);
      expect(url).toContain('dur=0');
    });

    it('does not produce negative duration', () => {
      const event: CalendarEvent = {
        title: 'Backwards',
        startDate: new Date('2025-01-02T00:00:00Z'),
        endDate: new Date('2025-01-01T00:00:00Z'),
      };
      const url = getYahooCalendarUrl(event);
      expect(url).toContain('dur=0');
    });

    it('includes location and description', () => {
      const url = getYahooCalendarUrl(baseEvent);
      expect(url).toContain('in_loc=Kampala');
      expect(url).toContain('desc=Annual+air+quality+conference');
    });
  });

  describe('getOutlookCalendarUrl', () => {
    it('generates correct URL', () => {
      const url = getOutlookCalendarUrl(baseEvent);
      expect(url).toContain(
        'https://outlook.live.com/calendar/0/deeplink/compose?',
      );
      expect(url).toContain('path=%2Fcalendar%2Faction%2Fcompose');
      expect(url).toContain('rru=addevent');
      expect(url).toContain('subject=AirQo+Forum+2025');
      expect(url).toContain('body=Annual+air+quality+conference');
      expect(url).toContain('location=Kampala');
    });

    it('includes ISO date strings', () => {
      const url = getOutlookCalendarUrl(baseEvent);
      expect(url).toContain('startdt=');
      expect(url).toContain('enddt=');
      expect(url).toContain('2025-06-15');
    });
  });

  describe('getOfficeCalendarUrl', () => {
    it('generates correct URL', () => {
      const url = getOfficeCalendarUrl(baseEvent);
      expect(url).toContain(
        'https://outlook.office.com/calendar/0/deeplink/compose?',
      );
      expect(url).toContain('path=%2Fcalendar%2Faction%2Fcompose');
      expect(url).toContain('rru=addevent');
      expect(url).toContain('subject=AirQo+Forum+2025');
    });

    it('has same structure as Outlook URL but different base', () => {
      const outlookUrl = getOutlookCalendarUrl(baseEvent);
      const officeUrl = getOfficeCalendarUrl(baseEvent);
      expect(outlookUrl).toContain('outlook.live.com');
      expect(officeUrl).toContain('outlook.office.com');
      const outlookParams = new URL(outlookUrl).searchParams;
      const officeParams = new URL(officeUrl).searchParams;
      expect(outlookParams.get('subject')).toBe(officeParams.get('subject'));
      expect(outlookParams.get('startdt')).toBe(officeParams.get('startdt'));
    });
  });

  describe('generateIcsFile', () => {
    it('generates valid ICS with VCALENDAR structure', () => {
      const ics = generateIcsFile(baseEvent);
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//AirQo//Events//EN');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('STATUS:CONFIRMED');
      expect(ics).toContain('TRANSP:OPAQUE');
    });

    it('includes event details', () => {
      const ics = generateIcsFile(baseEvent);
      expect(ics).toContain('SUMMARY:AirQo Forum 2025');
      expect(ics).toContain('DESCRIPTION:Annual air quality conference');
      expect(ics).toContain('LOCATION:Kampala\\, Uganda');
      expect(ics).toContain('URL:https://airqo.events/forum2025');
    });

    it('contains DTSTART and DTEND', () => {
      const ics = generateIcsFile(baseEvent);
      expect(ics).toContain('DTSTART:');
      expect(ics).toContain('DTEND:');
    });

    it('includes UID with @airqo.events', () => {
      const ics = generateIcsFile(baseEvent);
      expect(ics).toMatch(/UID:\d+@airqo\.events/);
    });

    it('uses \\r\\n line endings', () => {
      const ics = generateIcsFile(baseEvent);
      expect(ics).toContain('\r\n');
    });

    it('escapes special ICS characters in title', () => {
      const event: CalendarEvent = {
        ...baseEvent,
        title: 'Event with, commas; and \\ backslashes',
        startDate: baseEvent.startDate,
        endDate: baseEvent.endDate,
      };
      const ics = generateIcsFile(event);
      expect(ics).toContain(
        'SUMMARY:Event with\\, commas\\; and \\\\ backslashes',
      );
    });

    it('handles empty optional fields', () => {
      const event: CalendarEvent = {
        title: 'Minimal',
        startDate: baseEvent.startDate,
        endDate: baseEvent.endDate,
      };
      const ics = generateIcsFile(event);
      expect(ics).toContain('SUMMARY:Minimal');
      expect(ics).toContain('DESCRIPTION:');
      expect(ics).toContain('LOCATION:');
      expect(ics).toContain('URL:');
    });
  });

  describe('combineDateAndTime', () => {
    it('combines date and time strings', () => {
      const result = combineDateAndTime('2025-06-15', '14:30');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(0);
    });

    it('defaults to 9:00 when no time provided', () => {
      const result = combineDateAndTime('2025-06-15');
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(0);
    });

    it('handles time with seconds', () => {
      const result = combineDateAndTime('2025-06-15', '14:30:45');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
    });

    it('handles time string with only hours', () => {
      const result = combineDateAndTime('2025-06-15', '14');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('treats undefined time as no time', () => {
      const result = combineDateAndTime('2025-06-15', undefined);
      expect(result.getHours()).toBe(9);
    });

    it('handles empty string time as no time', () => {
      const result = combineDateAndTime('2025-06-15', '');
      expect(result.getHours()).toBe(9);
    });
  });
});
