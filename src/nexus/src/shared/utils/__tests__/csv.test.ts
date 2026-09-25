import {
  buildCsv,
  buildCsvFilename,
  downloadCsv,
  escapeCsvCell,
  sanitizeCsvCell,
} from '../csv';

describe('csv utils', () => {
  describe('sanitizeCsvCell', () => {
    it.each([
      ['=SUM(A1:A5)', "'=SUM(A1:A5)"],
      ['+1|cmd', "'+1|cmd"],
      ['-2+3|cmd', "'-2+3|cmd"],
      ['@import(x)', "'@import(x)"],
    ])('neutralises a leading formula character (%s)', (input, expected) => {
      expect(sanitizeCsvCell(input)).toBe(expected);
    });

    it('neutralises a leading tab', () => {
      expect(sanitizeCsvCell('\t=cmd')).toBe("'\t=cmd");
    });

    it('neutralises a leading carriage return', () => {
      expect(sanitizeCsvCell('\r=cmd')).toBe("'\r=cmd");
    });

    it('neutralises leading whitespace followed by a dangerous char', () => {
      expect(sanitizeCsvCell('   =cmd')).toBe("'   =cmd");
      expect(sanitizeCsvCell(' @cmd')).toBe("' @cmd");
    });

    it('leaves safe values untouched', () => {
      expect(sanitizeCsvCell('Jane Doe')).toBe('Jane Doe');
      expect(sanitizeCsvCell('jane@airqo example')).toBe('jane@airqo example');
      expect(sanitizeCsvCell('5 - 3')).toBe('5 - 3');
      expect(sanitizeCsvCell('')).toBe('');
    });
  });

  describe('escapeCsvCell', () => {
    it('wraps every cell in double quotes', () => {
      expect(escapeCsvCell('plain')).toBe('"plain"');
      expect(escapeCsvCell('')).toBe('""');
    });

    it('doubles inner double quotes per RFC 4180', () => {
      expect(escapeCsvCell('said "hi"')).toBe('"said ""hi"""');
    });

    it('sanitizes before quoting', () => {
      expect(escapeCsvCell('=cmd')).toBe('"\'=cmd"');
    });
  });

  describe('buildCsv', () => {
    it('prefixes the UTF-8 BOM and joins lines with CRLF', () => {
      const csv = buildCsv(
        ['A', 'B'],
        [
          ['1', '2'],
          ['3', '4'],
        ]
      );
      expect(csv).toBe('\uFEFF"A","B"\r\n"1","2"\r\n"3","4"');
    });

    it('quotes every field, headers included', () => {
      const csv = buildCsv(['First Name', 'Email'], [['Jane', 'j@x.io']]);
      const lines = csv.split('\r\n');
      expect(lines[0]).toBe('\uFEFF"First Name","Email"');
      expect(lines[1]).toBe('"Jane","j@x.io"');
    });

    it('keeps commas and newlines inside the quoted field', () => {
      const csv = buildCsv(['Name'], [['Doe, Jane\nline two']]);
      expect(csv).toBe('\uFEFF"Name"\r\n"Doe, Jane\nline two"');
    });

    it('escapes quotes inside fields', () => {
      const csv = buildCsv(['Name'], [['say "yes"']]);
      expect(csv).toBe('\uFEFF"Name"\r\n"say ""yes"""');
    });

    it('neutralises formula payloads in cells', () => {
      const csv = buildCsv(['Name'], [['=HYPERLINK("http://evil")']]);
      expect(csv).toBe('\uFEFF"Name"\r\n"\'=HYPERLINK(""http://evil"")"');
    });

    it('builds a header-only CSV when there are no rows', () => {
      expect(buildCsv(['A'], [])).toBe('\uFEFF"A"');
    });
  });

  describe('buildCsvFilename', () => {
    it('uses the local date with zero-padded month and day', () => {
      expect(buildCsvFilename('users', new Date(2026, 8, 9))).toBe(
        'users-2026-09-09.csv'
      );
    });

    it('zero-pads single-digit months and days', () => {
      expect(buildCsvFilename('total-users', new Date(2026, 0, 5))).toBe(
        'total-users-2026-01-05.csv'
      );
    });

    it('defaults to the current date when none is given', () => {
      expect(buildCsvFilename('x')).toMatch(/^x-\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });

  describe('downloadCsv', () => {
    it('creates an object URL, clicks a hidden anchor and revokes the URL', () => {
      const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURL = jest.fn();
      Object.defineProperty(URL, 'createObjectURL', {
        value: createObjectURL,
        configurable: true,
      });
      Object.defineProperty(URL, 'revokeObjectURL', {
        value: revokeObjectURL,
        configurable: true,
      });
      const clickSpy = jest
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {});

      try {
        downloadCsv('users-export.csv', '\uFEFF"A"');

        expect(createObjectURL).toHaveBeenCalledTimes(1);
        const blob = createObjectURL.mock.calls[0][0] as Blob;
        expect(blob.type).toBe('text/csv;charset=utf-8;');
        expect(clickSpy).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
        // The hidden anchor must not linger in the document.
        expect(document.querySelectorAll('a[download]').length).toBe(0);
      } finally {
        clickSpy.mockRestore();
        Object.defineProperty(URL, 'createObjectURL', {
          value: undefined,
          configurable: true,
        });
        Object.defineProperty(URL, 'revokeObjectURL', {
          value: undefined,
          configurable: true,
        });
      }
    });
  });
});
