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

import log from 'loglevel';

import logger from '@/lib/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
