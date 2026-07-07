jest.mock('loglevel', () => {
  const levels = { TRACE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4, SILENT: 5 };
  return {
    levels,
    setLevel: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
});

jest.mock('@/lib/utils/logger', () => {
  const actual = jest.requireActual('@/lib/utils/logger');
  return actual;
});

import log from 'loglevel';

import logger from '@/lib/utils/logger';

describe('Logger', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  describe('error method', () => {
    it('calls log.error with message', () => {
      logger.error('test error');
      expect(log.error).toHaveBeenCalledWith('test error', undefined);
    });

    it('calls log.error with message and error', () => {
      const error = new Error('something broke');
      logger.error('test error', error);
      expect(log.error).toHaveBeenCalledWith('test error', error, undefined);
    });

    it('calls log.error with message, error, and context', () => {
      const error = new Error('something broke');
      const context = { userId: '123', action: 'click' };
      logger.error('test error', error, context);
      expect(log.error).toHaveBeenCalledWith('test error', error, context);
    });
  });

  describe('warn method', () => {
    it('calls log.warn with message', () => {
      logger.warn('test warning');
      expect(log.warn).toHaveBeenCalledWith('test warning', undefined);
    });

    it('calls log.warn with message and context', () => {
      const context = { component: 'Button' };
      logger.warn('test warning', context);
      expect(log.warn).toHaveBeenCalledWith('test warning', context);
    });
  });

  describe('info method', () => {
    it('calls log.info with message', () => {
      logger.info('test info');
      expect(log.info).toHaveBeenCalledWith('test info', undefined);
    });

    it('calls log.info with message and context', () => {
      const context = { feature: 'darkMode' };
      logger.info('test info', context);
      expect(log.info).toHaveBeenCalledWith('test info', context);
    });
  });

  describe('debug method', () => {
    it('calls log.debug with message', () => {
      logger.debug('test debug');
      expect(log.debug).toHaveBeenCalledWith('test debug', undefined);
    });

    it('calls log.debug with message and context', () => {
      const context = { state: 'loading' };
      logger.debug('test debug', context);
      expect(log.debug).toHaveBeenCalledWith('test debug', context);
    });
  });

  describe('sendToSlack behavior', () => {
    it('does not call fetch in non-production environment', async () => {
      process.env.NODE_ENV = 'development';

      logger.error('test error');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('calls fetch in production for error level', async () => {
      process.env.NODE_ENV = 'production';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        statusText: '',
      });

      logger.error('production error');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"level":"error"'),
      });
    });

    it('calls fetch in production for warn level', async () => {
      process.env.NODE_ENV = 'production';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        statusText: '',
      });

      logger.warn('production warning');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/log',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('does not call fetch in production for info level', async () => {
      process.env.NODE_ENV = 'production';

      logger.info('production info');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('does not call fetch in production for debug level', async () => {
      process.env.NODE_ENV = 'production';

      logger.debug('production debug');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('includes error message and stack in payload', async () => {
      process.env.NODE_ENV = 'production';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        statusText: '',
      });

      const error = new Error('test error message');
      logger.error('something failed', error);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1]?.body as string,
      );
      expect(body.errorMessage).toBe('test error message');
      expect(body.errorStack).toBeDefined();
    });

    it('handles fetch failure gracefully', async () => {
      process.env.NODE_ENV = 'production';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('network error'));

      logger.error('test error');
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error sending log to Slack:',
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });

    it('handles non-ok response gracefully', async () => {
      process.env.NODE_ENV = 'production';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      logger.error('test error');
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send log to Slack:',
        'Internal Server Error',
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('safeJson helper behavior', () => {
    it('serializes normal context objects', async () => {
      process.env.NODE_ENV = 'production';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        statusText: '',
      });

      const context = { key: 'value', nested: { a: 1 } };
      logger.error('test', undefined, context);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1]?.body as string,
      );
      expect(body.context).toEqual(context);
    });

    it('handles non-serializable context gracefully', async () => {
      process.env.NODE_ENV = 'production';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        statusText: '',
      });

      const circular: Record<string, any> = {};
      circular.self = circular;
      logger.error('test', undefined, circular);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1]?.body as string,
      );
      expect(body.context).toEqual({ warning: 'non-serializable context' });
    });
  });

  describe('window-dependent fields', () => {
    it('includes url and userAgent when window is defined', async () => {
      process.env.NODE_ENV = 'production';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        statusText: '',
      });

      logger.error('test error');
      await new Promise((resolve) => setTimeout(resolve, 100));

      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1]?.body as string,
      );
      expect(body).toHaveProperty('url');
      expect(body).toHaveProperty('userAgent');
    });
  });
});
