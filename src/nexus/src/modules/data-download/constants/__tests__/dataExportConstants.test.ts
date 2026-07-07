import {
  DEVICE_CATEGORY_OPTIONS,
  DATA_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  FILE_TYPE_OPTIONS,
  POLLUTANT_OPTIONS,
} from '../dataExportConstants';

const optionLists = [
  { name: 'DEVICE_CATEGORY_OPTIONS', options: DEVICE_CATEGORY_OPTIONS },
  { name: 'DATA_TYPE_OPTIONS', options: DATA_TYPE_OPTIONS },
  { name: 'FREQUENCY_OPTIONS', options: FREQUENCY_OPTIONS },
  { name: 'FILE_TYPE_OPTIONS', options: FILE_TYPE_OPTIONS },
  { name: 'POLLUTANT_OPTIONS', options: POLLUTANT_OPTIONS },
];

describe('dataExportConstants', () => {
  optionLists.forEach(({ name, options }) => {
    describe(name, () => {
      it('is a non-empty array', () => {
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(0);
      });

      it('all options have both value and label properties', () => {
        options.forEach(option => {
          expect(option).toHaveProperty('value');
          expect(option).toHaveProperty('label');
          expect(typeof option.value).toBe('string');
          expect(typeof option.label).toBe('string');
        });
      });

      it('has no duplicate values', () => {
        const values = options.map(o => o.value);
        expect(new Set(values).size).toBe(values.length);
      });
    });
  });

  it('DEVICE_CATEGORY_OPTIONS has expected values', () => {
    const values = DEVICE_CATEGORY_OPTIONS.map(o => o.value);
    expect(values).toContain('lowcost');
    expect(values).toContain('bam');
  });

  it('DATA_TYPE_OPTIONS has expected values', () => {
    const values = DATA_TYPE_OPTIONS.map(o => o.value);
    expect(values).toContain('raw');
    expect(values).toContain('calibrated');
  });

  it('FREQUENCY_OPTIONS has expected values', () => {
    const values = FREQUENCY_OPTIONS.map(o => o.value);
    expect(values).toContain('hourly');
    expect(values).toContain('daily');
  });

  it('FILE_TYPE_OPTIONS has expected values', () => {
    const values = FILE_TYPE_OPTIONS.map(o => o.value);
    expect(values).toContain('csv');
    expect(values).toContain('json');
  });

  it('POLLUTANT_OPTIONS has expected pollutant values', () => {
    const values = POLLUTANT_OPTIONS.map(o => o.value);
    expect(values).toContain('pm2_5');
    expect(values).toContain('pm10');
  });
});
