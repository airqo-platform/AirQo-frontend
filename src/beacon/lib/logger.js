const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message, data = {}) => {
    const logEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      service: 'airqo-frontend',
      ...data
    };
    
    if (isDevelopment) {
      console.log('ℹ️', message, data);
    } else {
      console.log(JSON.stringify(logEntry));
    }
  },
  
  error: (message, error = {}) => {
    const logEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      service: 'airqo-frontend',
      error: error.message || error,
      stack: error.stack
    };
    
    if (isDevelopment) {
      console.error('❌', message, error);
    } else {
      console.error(JSON.stringify(logEntry));
    }
  },
  
  warn: (message, data = {}) => {
    const logEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      service: 'airqo-frontend',
      ...data
    };
    
    if (isDevelopment) {
      console.warn('⚠️', message, data);
    } else {
      console.warn(JSON.stringify(logEntry));
    }
  }
};