const logger = {
  debug: (message, context = {}) => {
    console.log(message, context);
  },
  info: (message, context = {}) => {
    console.info(message, context);
  },
  warn: (message, context = {}) => {
    console.warn(message, context);
  },
  error: (message, context = {}) => {
    console.error(message, context);
  },
};

export default logger;
