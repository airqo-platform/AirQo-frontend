import React from 'react';
import { render, screen } from '@testing-library/react';

let mockActiveGroup: { id: string; title?: string } | null = {
  id: 'org-group-1',
  title: 'Acme Org',
};
let mockUserLoading = false;
let mockOrganizationGroup: { id: string; title: string } | null = {
  id: 'org-group-1',
  title: 'Acme Org',
};
let mockOrganizationGroupId = 'org-group-1';
let mockOrgGroupLoading = false;
const mockReport = jest.fn((props: { organizationTitle: string }) => {
  void props;
  return <div data-testid="organization-report" />;
});

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => ({
    activeGroup: mockActiveGroup,
    isLoading: mockUserLoading,
  }),
}));

jest.mock('@/shared/hooks/useOrgGroup', () => ({
  useOrgGroup: () => ({
    organizationGroup: mockOrganizationGroup,
    organizationGroupId: mockOrganizationGroupId,
    isInitialLoading: mockOrgGroupLoading,
  }),
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: jest.fn() }),
}));

jest.mock('@/shared/components/AccessDenied', () => ({
  AccessDenied: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('../components/DashboardHeader', () => ({
  DashboardHeader: ({ organizationTitle }: { organizationTitle: string }) => (
    <h1>{organizationTitle}</h1>
  ),
}));

jest.mock('@/shared/components/ui/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="dashboard-skeleton" />,
}));

jest.mock('../components/OrganizationReportDashboard', () => ({
  OrganizationReportDashboard: (props: {
    groupId: string;
    organizationTitle: string;
  }) => {
    mockReport(props);
    return <div data-testid="organization-report" />;
  },
}));

import { OrgDashboard } from '../OrgDashboard';

describe('OrgDashboard', () => {
  beforeEach(() => {
    mockActiveGroup = { id: 'org-group-1', title: 'Acme Org' };
    mockUserLoading = false;
    mockOrganizationGroup = { id: 'org-group-1', title: 'Acme Org' };
    mockOrganizationGroupId = 'org-group-1';
    mockOrgGroupLoading = false;
    mockReport.mockClear();
  });

  it('renders the organization report with the resolved group', () => {
    render(<OrgDashboard organizationSlug="acme" />);

    expect(
      screen.getByRole('heading', { name: 'Acme Org' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('organization-report')).toBeInTheDocument();
    expect(mockReport).toHaveBeenCalledWith({
      organizationTitle: 'Acme Org',
    });
  });

  it('shows the dashboard skeleton while the organization group is syncing', () => {
    mockActiveGroup = { id: 'different-group', title: 'Different Group' };

    render(<OrgDashboard organizationSlug="acme" />);

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('organization-report')).not.toBeInTheDocument();
  });

  it('shows access denied when the organization slug cannot be resolved', () => {
    mockOrganizationGroup = null;
    mockOrganizationGroupId = '';

    render(<OrgDashboard organizationSlug="missing" />);

    expect(screen.getByText('Organization not found')).toBeInTheDocument();
    expect(screen.queryByTestId('organization-report')).not.toBeInTheDocument();
  });
});
