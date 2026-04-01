import log from 'loglevel';

const isProduction = process.env.NODE_ENV === 'production';
log.setLevel(isProduction ? 'silent' : 'debug');

const logger = {
  error: (message: string, context = {}) => {
    log.error(message, context);
  },
  warn: (message: string, context = {}) => {
    log.warn(message, context);
  },
  info: (message: string) => {
    log.info(message);
  },
  debug: (message: string, context = {}) => {
    log.debug(message, context);
  },
};

export default logger;