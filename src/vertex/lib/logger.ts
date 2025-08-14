import log from 'loglevel';
import axios from 'axios';

// Set the level based on the environment
const isProduction = process.env.NODE_ENV === 'production';
log.setLevel(isProduction ? 'silent' : 'debug');

const shouldLogToSlack = () => {
  const env = process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS || process.env.NODE_ENV;
  return env === 'production' || env === 'staging';
};

const logToSlack = (level: string, message: string, context = {}) => {
  if (!shouldLogToSlack()) {
    return;
  }
  
  // Add more detailed debugging
  const payload = {
    level,
    message,
    context,
  };
  
  axios.post('/api/log-to-slack', payload, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  }).then((response) => {
    console.log('✅ Slack log sent successfully:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
  }).catch((error) => {
    // Fail silently to avoid a logging loop but provide detailed info
    console.error('❌ Failed to send log to Slack:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data,
    });
  });
};

const logger = {
  error: (message: string, context = {}) => {
    log.error(message);
    logToSlack('error', message, context);
  },
  warn: (message: string, context = {}) => {
    log.warn(message);
    logToSlack('warn', message, context);
  },
  info: (message: string) => {
    log.info(message);
  },
  debug: (message: string, context = {}) => {
    log.debug(message, context);
  },
};

export default logger;
