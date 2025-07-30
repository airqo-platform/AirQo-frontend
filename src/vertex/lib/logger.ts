import log from 'loglevel';
import axios from 'axios';

// Set the level based on the environment
const isProduction = process.env.NODE_ENV === 'production';
log.setLevel(isProduction ? 'silent' : 'debug');

const shouldLogToSlack = () => {
  const env = process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS || process.env.NODE_ENV;
  return env === 'production' || env === 'staging';
};

const logToSlack = (level, message, context = {}) => {
  if (!shouldLogToSlack()) return;

  axios.post('/api/log-to-slack', {
    level,
    message,
    context,
  }).catch((error) => {
    // Fail silently to avoid a logging loop
    log.error('Failed to send log to Slack', error);
  });
};

const logger = {
  error: (message, context = {}) => {
    log.error(message, context);
    logToSlack('error', message, context);
  },
  warn: (message, context = {}) => {
    log.warn(message, context);
    logToSlack('warn', message, context);
  },
  info: (message, context = {}) => {
    log.info(message, context);
  },
  debug: (message, context = {}) => {
    log.debug(message, context);
  },
};

export default logger;
