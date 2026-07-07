const axiosInstance = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
};

const axios = {
  ...axiosInstance,
  create: jest.fn(() => axiosInstance),
  isAxiosError: jest.fn(
    (obj: unknown) => obj && typeof obj === 'object' && 'isAxiosError' in obj
  ),
};

export default axios;
export { axiosInstance };
