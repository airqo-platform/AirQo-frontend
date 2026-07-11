import { sanitizeErrorForLogging } from '../sanitizeErrorForLogging';

describe('sanitizeErrorForLogging', () => {
  describe('primitive / falsy inputs', () => {
    it('null returns { message: "null" }', () => {
      const result = sanitizeErrorForLogging(null);
      expect(result).toEqual({ message: 'null' });
    });

    it('undefined returns { message: "undefined" }', () => {
      const result = sanitizeErrorForLogging(undefined);
      expect(result).toEqual({ message: 'undefined' });
    });

    it('false returns { message: "false" }', () => {
      const result = sanitizeErrorForLogging(false);
      expect(result).toEqual({ message: 'false' });
    });

    it('0 returns { message: "0" }', () => {
      const result = sanitizeErrorForLogging(0);
      expect(result).toEqual({ message: '0' });
    });

    it('string returns { message: the string }', () => {
      const result = sanitizeErrorForLogging('something went wrong');
      expect(result).toEqual({ message: 'something went wrong' });
    });

    it('number returns { message: stringified number }', () => {
      const result = sanitizeErrorForLogging(404);
      expect(result).toEqual({ message: '404' });
    });
  });

  describe('empty object', () => {
    it('returns all undefined for {}', () => {
      const result = sanitizeErrorForLogging({});
      expect(result.code).toBeUndefined();
      expect(result.message).toBeUndefined();
      expect(result.name).toBeUndefined();
      expect(result.status).toBeUndefined();
      expect(result.method).toBeUndefined();
      expect(result.statusText).toBeUndefined();
    });
  });

  describe('full object extraction', () => {
    it('extracts code, message, name, status, response.status, response.statusText, config.method', () => {
      const result = sanitizeErrorForLogging({
        code: 'ERR_NETWORK',
        message: 'Network Error',
        name: 'AxiosError',
        status: 503,
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
        config: {
          method: 'post',
        },
      });
      expect(result.code).toBe('ERR_NETWORK');
      expect(result.message).toBe('Network Error');
      expect(result.name).toBe('AxiosError');
      expect(result.status).toBe(503);
      expect(result.statusText).toBe('Internal Server Error');
      expect(result.method).toBe('POST');
    });
  });

  describe('code as number', () => {
    it('extracts numeric code', () => {
      const result = sanitizeErrorForLogging({ code: 500 });
      expect(result.code).toBe(500);
    });
  });

  describe('status fallback logic', () => {
    it('prefers candidate.status over response.status', () => {
      const result = sanitizeErrorForLogging({
        status: 400,
        response: { status: 500 },
      });
      expect(result.status).toBe(400);
    });

    it('falls back to response.status when candidate.status is not a number', () => {
      const result = sanitizeErrorForLogging({
        status: 'not-a-number',
        response: { status: 502 },
      });
      expect(result.status).toBe(502);
    });

    it('response.status as non-number falls through to undefined', () => {
      const result = sanitizeErrorForLogging({
        response: { status: 'bad' },
      });
      expect(result.status).toBeUndefined();
    });
  });

  describe('config.method', () => {
    it('uppercases string method', () => {
      const result = sanitizeErrorForLogging({ config: { method: 'get' } });
      expect(result.method).toBe('GET');
    });

    it('non-string method falls through to undefined', () => {
      const result = sanitizeErrorForLogging({ config: { method: 123 } });
      expect(result.method).toBeUndefined();
    });

    it('missing config produces undefined method', () => {
      const result = sanitizeErrorForLogging({ config: {} });
      expect(result.method).toBeUndefined();
    });
  });

  describe('message as non-string', () => {
    it('non-string message falls through to undefined', () => {
      const result = sanitizeErrorForLogging({ message: 42 });
      expect(result.message).toBeUndefined();
    });

    it('object message falls through to undefined', () => {
      const result = sanitizeErrorForLogging({ message: { detail: 'fail' } });
      expect(result.message).toBeUndefined();
    });
  });

  describe('response.statusText', () => {
    it('extracts string statusText', () => {
      const result = sanitizeErrorForLogging({
        response: { statusText: 'Not Found' },
      });
      expect(result.statusText).toBe('Not Found');
    });

    it('non-string statusText falls through to undefined', () => {
      const result = sanitizeErrorForLogging({
        response: { statusText: 404 },
      });
      expect(result.statusText).toBeUndefined();
    });
  });

  describe('name as non-string', () => {
    it('non-string name falls through to undefined', () => {
      const result = sanitizeErrorForLogging({ name: 123 });
      expect(result.name).toBeUndefined();
    });
  });
});
