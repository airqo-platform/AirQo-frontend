export type MockRole = 'USER' | 'SUPER_ADMIN' | 'DEVELOPER';

const defaultRoles: MockRole[] = ['USER'];

const parseRoles = (): MockRole[] => {
  if (typeof window === 'undefined') {
    return defaultRoles;
  }
  const raw = window.localStorage.getItem('airqo-mock-roles');
  if (!raw) return defaultRoles;
  return raw
    .split(',')
    .map(role => role.trim().toUpperCase())
    .filter(Boolean)
    .map(role => role as MockRole);
};

export const mockUser = {
  id: 'mock-user-1',
  name: 'Belinda Dev',
  email: 'dev@airqo.net',
  get roles() {
    return parseRoles();
  },
};

export const hasRole = (role: MockRole) => {
  return mockUser.roles.includes(role);
};