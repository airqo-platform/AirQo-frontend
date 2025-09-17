// statusText.js — human toast messages for every HTTP code
export const statusText = {
  // 1×× Informational (rarely seen by browsers, but covered)
  100: 'Hold on…',
  101: 'Switching protocols…',
  102: 'Still working…',
  103: 'Getting ready…',

  // 2×× Success
  200: 'All good!',
  201: 'Created successfully.',
  202: 'Request accepted.',
  203: 'Info updated.',
  204: 'Saved.',
  205: 'Content reset.',
  206: 'Partial content loaded.',
  207: 'Batch complete.',
  208: 'Already reported.',
  226: 'Cache used.',

  // 3×× Redirection (browsers handle silently; shown only if you intercept)
  300: 'Choose an option.',
  301: 'Moved permanently.',
  302: 'Taking you there…',
  303: 'See other page.',
  304: 'Nothing changed.',
  305: 'Use proxy.',
  307: 'Redirecting…',
  308: 'Permanent redirect.',

  // 4×× Client errors
  400: "We couldn't understand that request.",
  401: 'Please sign in to continue.',
  402: 'Payment required.',
  403: "You don't have permission to do that.",
  404: "We can't find what you're looking for.",
  405: "That action isn't allowed.",
  406: 'Not acceptable.',
  407: 'Proxy authentication needed.',
  408: 'Request timed out—try again.',
  409: 'That already exists—try something different.',
  410: "That's gone.",
  411: 'Missing required info.',
  412: 'Pre-condition failed.',
  413: 'Too large.',
  414: 'Link too long.',
  415: 'Unsupported file type.',
  416: 'Range not available.',
  417: 'Expectation failed.',
  418: "I'm a teapot 🫖",
  421: 'Misdirected request.',
  422: 'One or more fields need attention.',
  423: 'Locked.',
  424: 'Failed dependency.',
  425: 'Too early.',
  426: 'Please upgrade.',
  428: 'Pre-condition required.',
  429: 'Whoa, slow down—try again shortly.',
  431: 'Headers too large.',
  451: 'Unavailable for legal reasons.',

  // 5×× Server errors
  500: "Something went wrong on our side. We're on it.",
  501: 'Not implemented yet.',
  502: "A connected service is down. We're working to restore it.",
  503: "Service temporarily unavailable due to maintenance or heavy load. We're working to restore it — please try again in a few minutes.",
  504: 'Gateway timed out.',
  505: 'Version not supported.',
  506: 'Variant also negotiates.',
  507: 'Storage full.',
  508: 'Loop detected.',
  510: 'Extension missing.',
  511: 'Network authentication required.',
};

/**
 * Gets a user-friendly message for a given HTTP status code
 * @param {number|string} code - The HTTP status code
 * @returns {string} User-friendly message
 */
export const getStatusMessage = (code) => {
  const numericCode = typeof code === 'string' ? parseInt(code, 10) : code;
  return statusText[numericCode] || statusText[500];
};

/**
 * Enhanced toast message function with custom message override capability
 * @param {number|string} statusCode - HTTP status code
 * @param {string} [customMessage] - Optional custom message to override default
 * @returns {string} Message to display
 */
export const toastMessage = (statusCode, customMessage = null) => {
  // If custom message is provided, use it
  if (
    customMessage &&
    typeof customMessage === 'string' &&
    customMessage.trim()
  ) {
    return customMessage.trim();
  }

  // Otherwise, fall back to status-based message
  return getStatusMessage(statusCode);
};

/**
 * Determines toast type based on HTTP status code
 * @param {number|string} statusCode - HTTP status code
 * @returns {string} Toast type: 'success', 'error', 'warning', or 'info'
 */
export const getToastType = (statusCode) => {
  const numericCode =
    typeof statusCode === 'string' ? parseInt(statusCode, 10) : statusCode;

  if (numericCode >= 200 && numericCode < 300) {
    return 'success';
  } else if (numericCode >= 400 && numericCode < 500) {
    return 'error';
  } else if (numericCode >= 500) {
    return 'error';
  } else if (numericCode >= 300 && numericCode < 400) {
    return 'info';
  } else {
    return 'info';
  }
};

/**
 * Comprehensive utility for showing status-based notifications
 * @param {number|string} statusCode - HTTP status code
 * @param {string} [customMessage] - Optional custom message override
 * @returns {Object} Object with message and type for toast display
 */
export const getNotificationConfig = (statusCode, customMessage = null) => {
  return {
    message: toastMessage(statusCode, customMessage),
    type: getToastType(statusCode),
  };
};
