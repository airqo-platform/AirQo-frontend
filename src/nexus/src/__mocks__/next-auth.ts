export const getSession = jest.fn(() =>
  Promise.resolve({
    user: {
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
    accessToken: 'mock-access-token',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })
);

export const signIn = jest.fn(() => Promise.resolve({ ok: true }));
export const signOut = jest.fn(() => Promise.resolve({ ok: true }));
export const useSession = jest.fn(() => ({
  data: {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
    accessToken: 'mock-access-token',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  status: 'authenticated',
}));
