type SanitizedErrorLog = {
  code?: string | number;
  message?: string;
  method?: string;
  name?: string;
  status?: number;
  statusText?: string;
};

export const sanitizeErrorForLogging = (error: unknown): SanitizedErrorLog => {
  if (!error || typeof error !== 'object') {
    return {
      message: String(error),
    };
  }

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
    response?: {
      status?: unknown;
      statusText?: unknown;
    };
    config?: {
      method?: unknown;
    };
    status?: unknown;
  };

  const status =
    typeof candidate.status === 'number'
      ? candidate.status
      : typeof candidate.response?.status === 'number'
        ? candidate.response.status
        : undefined;

  return {
    code:
      typeof candidate.code === 'string' || typeof candidate.code === 'number'
        ? candidate.code
        : undefined,
    message:
      typeof candidate.message === 'string' ? candidate.message : undefined,
    method:
      typeof candidate.config?.method === 'string'
        ? candidate.config.method.toUpperCase()
        : undefined,
    name: typeof candidate.name === 'string' ? candidate.name : undefined,
    status,
    statusText:
      typeof candidate.response?.statusText === 'string'
        ? candidate.response.statusText
        : undefined,
  };
};
