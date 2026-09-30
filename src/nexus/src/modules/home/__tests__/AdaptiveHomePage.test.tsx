import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { HomeExperienceData } from '../types';

const mockPush = jest.fn();
const mockCapture = jest.fn();
const mockOpenWithPrompt = jest.fn();
const mockOpenAi = jest.fn();
let mockAiEnabled = true;

const mockExperience: HomeExperienceData = {
  mode: 'new',
  continueItems: [],
  locationUpdates: [],
  counts: { savedLocations: 0, charts: 0, comparisons: 0, drafts: 0 },
  isLoading: false,
  updatesLoading: false,
  hasPartialError: false,
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { firstName: 'Amina' } } }),
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: mockCapture }),
}));

jest.mock('@/modules/ai/context/ai-assistant-provider', () => ({
  useAiAssistantContext: () => ({
    isEnabled: mockAiEnabled,
    open: mockOpenAi,
    openWithPrompt: mockOpenWithPrompt,
  }),
}));

jest.mock('../hooks/useHomeExperience', () => ({
  useHomeExperience: () => mockExperience,
}));

jest.mock('@/shared/hooks', () => ({
  useEnvironmentAwareUrl: (url: string) => url,
}));

jest.mock('@/shared/components/ui/card', () => ({
  Card: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@/modules/user-checklist/components/VideoModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/shared/components/ui/dialog', () => ({
  __esModule: true,
  default: () => null,
}));

import AdaptiveHomePage from '../AdaptiveHomePage';

const renderHome = () =>
  render(
    <div className="dark" data-testid="theme-root">
      <div className="max-w-3xl lg:max-w-6xl">
        <AdaptiveHomePage />
      </div>
    </div>
  );

describe('AdaptiveHomePage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockCapture.mockReset();
    mockOpenWithPrompt.mockReset();
    mockOpenAi.mockReset();
    mockAiEnabled = true;
    Object.assign(mockExperience, {
      mode: 'new',
      continueItems: [],
      locationUpdates: [],
      counts: { savedLocations: 0, charts: 0, comparisons: 0, drafts: 0 },
      isLoading: false,
      updatesLoading: false,
      hasPartialError: false,
    });
  });

  it('renders the discovery homepage without empty resume sections', () => {
    renderHome();

    expect(
      screen.getByRole('heading', {
        name: 'What would you like to look at?',
      })
    ).toHaveClass('text-3xl', 'font-bold', 'text-foreground');
    expect(screen.getByText('Welcome, Amina')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Continue your work' })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', { name: 'Updates from your places' })
    ).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Jump right in' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('home-hint')).toHaveTextContent(
      'Compare a few places in one table.'
    );
    expect(
      screen.getByRole('button', { name: 'Open Ask AirQo' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Ask AirQo' })).toBeNull();
  });

  it('uses theme tokens and responsive grids for compact and wide layouts', () => {
    renderHome();

    const outcomes = screen.getByRole('button', { name: /Compare places/ });
    expect(outcomes.className).toContain('focus-visible:ring-primary');
    expect(
      document.querySelector('.sm\\:grid-cols-2.xl\\:grid-cols-3')
    ).toBeTruthy();
    expect(document.querySelector('.md\\:grid-cols-3')).toBeTruthy();
    expect(screen.getByTestId('theme-root')).toHaveClass('dark');
    expect(document.body.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });

  it('routes every outcome card to an existing Nexus workflow', async () => {
    const user = userEvent.setup();
    renderHome();

    const routes: Array<[string, string]> = [
      [
        'Compare places',
        '/user/air-quality/analytics?view=comparison&homeStart=compare-places',
      ],
      [
        'Analyze trends',
        '/user/air-quality/analytics?view=trends&homeStart=analyze-trends',
      ],
      ['Explore a location', '/user/map?homeStart=explore-location'],
      ['Visualize my data', '/user/data-visualizer?homeStart=visualize-data'],
      ['Export data', '/user/data-export?homeStart=export-data'],
      [
        'Compare cities and countries',
        '/user/air-quality/rankings?homeStart=view-rankings',
      ],
    ];

    for (const [label, href] of routes) {
      await user.click(screen.getByRole('button', { name: new RegExp(label) }));
      expect(mockPush).toHaveBeenCalledWith(href);
    }
  });

  it('shows resumable artifacts and place updates for returning users', async () => {
    mockExperience.mode = 'returning';
    mockExperience.counts = {
      savedLocations: 2,
      charts: 1,
      comparisons: 1,
      drafts: 0,
    };
    mockExperience.continueItems = [
      {
        type: 'comparison',
        title: 'Kampala and Nairobi',
        description: 'Continue comparing 2 locations.',
        href: '/user/air-quality/analytics',
        timestamp: new Date().toISOString(),
      },
    ];
    mockExperience.locationUpdates = [
      {
        name: 'Makerere University',
        href: '/user/air-quality/analytics/sites/makerere-university?site_id=site-1',
        aqiIndex: 42,
        aqiCategory: 'Good',
      },
    ];

    renderHome();

    expect(screen.getByText('Welcome back, Amina')).toBeInTheDocument();
    expect(screen.getByTestId('home-continue-comparison')).toBeInTheDocument();
    expect(screen.getByTestId('home-place-update')).toHaveTextContent(
      'Makerere University'
    );
    expect(screen.getByTestId('home-place-update')).toHaveTextContent('Good');
    expect(
      screen.getByRole('button', { name: 'See readings' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View map' })).toBeNull();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'See readings' }));
    expect(mockPush).toHaveBeenCalledWith(
      '/user/air-quality/analytics/sites/makerere-university?site_id=site-1'
    );
  });

  it('stays usable when a data source fails without showing a raw error', () => {
    mockExperience.hasPartialError = true;

    renderHome();

    expect(
      screen.queryByText(/personalized updates are unavailable/i)
    ).toBeNull();
    expect(screen.queryByText(/TypeError|token|stack/i)).toBeNull();
    expect(
      screen.getByRole('button', { name: /Compare places/ })
    ).toBeEnabled();
  });

  it('puts recent work ahead of the shortcuts', () => {
    mockExperience.continueItems = [
      {
        type: 'comparison',
        title: 'Kampala and Nairobi',
        description: 'Continue comparing 2 locations.',
        href: '/user/air-quality/analytics?view=comparison',
      },
    ];

    renderHome();

    const resume = screen.getByRole('heading', { name: 'Continue your work' });
    const shortcuts = screen.getByRole('heading', { name: 'Jump right in' });
    expect(
      resume.compareDocumentPosition(shortcuts) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('places the Ask AirQo widget beside a rotating discovery hint', async () => {
    renderHome();

    const exploration = screen.getByRole('region', {
      name: 'Explore with Ask AirQo and ideas',
    });
    expect(exploration).toContainElement(
      screen.getByRole('button', { name: 'Open Ask AirQo' })
    );
    expect(exploration).toContainElement(screen.getByTestId('home-hint'));
    expect(exploration).toHaveTextContent('BETA');

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Open Ask AirQo' }));
    expect(mockOpenAi).toHaveBeenCalledTimes(1);
  });

  it('keeps the discovery hint full width when Ask AirQo is disabled', () => {
    mockAiEnabled = false;
    renderHome();

    const exploration = screen.getByRole('region', {
      name: 'Explore with Ask AirQo and ideas',
    });
    expect(screen.queryByRole('button', { name: 'Open Ask AirQo' })).toBeNull();
    expect(exploration.className).not.toContain('md:grid-cols-2');
    expect(exploration).toContainElement(screen.getByTestId('home-hint'));
  });
});
