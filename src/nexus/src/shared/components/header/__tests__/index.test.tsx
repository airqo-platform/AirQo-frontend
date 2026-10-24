import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '..';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ status: 'authenticated' }),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));

jest.mock('framer-motion', () => ({
  motion: {
    header: ({ children }: { children: React.ReactNode }) => (
      <header>{children}</header>
    ),
  },
}));

jest.mock('@/shared/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/shared/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

jest.mock('@airqo/icons-react', () => ({
  AqMenu01: () => <span aria-hidden="true" />,
}));

jest.mock('../hooks', () => ({
  useScrollVisibility: () => true,
  usePageTitle: () => 'AirQo Console',
}));

jest.mock('../components', () => ({
  ProfileDropdown: () => <span data-testid="profile-dropdown" />,
  AppDropdown: () => <span data-testid="app-dropdown" />,
  OrganizationSelector: () => <span data-testid="organization-selector" />,
  LogoComponent: () => <span data-testid="logo" />,
  InfoDropdown: () => <span data-testid="info-dropdown" />,
  WeatherWidget: () => <span data-testid="weather-widget" />,
  NotificationsCenter: () => <span data-testid="notifications-center" />,
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/console');
  });

  it('hides the organization selector throughout the console module', () => {
    const { rerender } = render(<Header />);

    expect(
      screen.queryByTestId('organization-selector')
    ).not.toBeInTheDocument();

    mockUsePathname.mockReturnValue('/console/clients');
    rerender(<Header />);

    expect(
      screen.queryByTestId('organization-selector')
    ).not.toBeInTheDocument();
  });

  it('keeps the organization selector on non-console routes', () => {
    mockUsePathname.mockReturnValue('/org/example/dashboard');

    render(<Header />);

    expect(screen.getByTestId('organization-selector')).toBeInTheDocument();
  });
});
