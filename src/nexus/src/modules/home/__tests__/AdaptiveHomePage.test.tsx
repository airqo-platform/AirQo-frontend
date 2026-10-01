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
  activeComparison: null,
  locationUpdates: [],
  counts: { savedLocations: 0, charts: 0, comparisons: 0, drafts: 0 },
  isLoading: false,
  updatesLoading: false,
  hasPartialError: false,
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  // Location cards record their origin so the site page's breadcrumb returns
  // here; the home route is that origin.
  usePathname: () => '/user/home',
}));

let mockFirstName = 'Amina';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { firstName: mockFirstName } } }),
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

jest.mock('@/shared/components/ui/card', () => {
  const passthrough = ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className} {...props}>
      {children}
    </div>
  );
  const passthroughEl = ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={className} {...props}>
      {children}
    </h3>
  );
  const passthroughP = ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={className} {...props}>
      {children}
    </p>
  );
  return {
    Card: passthrough,
    CardHeader: passthrough,
    CardContent: passthrough,
    CardFooter: passthrough,
    CardTitle: passthroughEl,
    CardDescription: passthroughP,
  };
});

jest.mock('@/modules/user-checklist/components/VideoModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/shared/components/ui/dialog', () => ({
  __esModule: true,
  default: () => null,
}));

import AdaptiveHomePage from '../components/AdaptiveHomePage';

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
    mockFirstName = 'Amina';
    Object.assign(mockExperience, {
      mode: 'new',
      continueItems: [],
      activeComparison: null,
      locationUpdates: [],
      counts: { savedLocations: 0, charts: 0, comparisons: 0, drafts: 0 },
      isLoading: false,
      updatesLoading: false,
      hasPartialError: false,
    });
  });

  it('capitalizes a lowercase account name in the greeting', () => {
    mockFirstName = 'paul';

    renderHome();

    expect(screen.getByText('Welcome, Paul')).toBeInTheDocument();
    expect(screen.queryByText('Welcome, paul')).toBeNull();
  });

  it('preserves intentional casing in the greeting', () => {
    mockFirstName = 'McDonald';
    mockExperience.mode = 'returning';

    renderHome();

    expect(screen.getByText('Welcome back, McDonald')).toBeInTheDocument();
  });

  it('capitalizes accented names without breaking the rest of the name', () => {
    mockFirstName = 'élodie';

    renderHome();

    expect(screen.getByText('Welcome, Élodie')).toBeInTheDocument();
  });

  it('capitalizes each word of an accented name', () => {
    mockFirstName = 'joséphine';

    renderHome();

    // A `\b\w` boundary is ASCII-only and would render this "JoséPhine".
    expect(screen.getByText('Welcome, Joséphine')).toBeInTheDocument();
  });

  it('falls back to a neutral greeting when no first name is stored', () => {
    mockFirstName = '';

    renderHome();

    expect(screen.getByText('Welcome, There')).toBeInTheDocument();
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
      screen.getByRole('heading', { name: 'Updates from your places' })
    ).toBeInTheDocument();
    // Nothing to view yet, so the section offers its empty-state action only.
    expect(screen.queryByRole('button', { name: 'View all' })).toBeNull();
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

    const outcomes = screen.getByTestId('home-outcome-compare-places');
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
        'home-outcome-compare-places',
        '/user/air-quality/analytics?view=comparison&homeStart=compare-places',
      ],
      [
        'home-outcome-analyze-trends',
        '/user/air-quality/analytics?view=trends&homeStart=analyze-trends',
      ],
      ['home-outcome-explore-location', '/user/map?homeStart=explore-location'],
      [
        'home-outcome-visualize-data',
        '/user/data-visualizer?homeStart=visualize-data',
      ],
      ['home-outcome-export-data', '/user/data-export?homeStart=export-data'],
      [
        'home-outcome-view-rankings',
        '/user/air-quality/rankings?homeStart=view-rankings',
      ],
    ];

    for (const [testId, href] of routes) {
      await user.click(screen.getByTestId(testId));
      expect(mockPush).toHaveBeenCalledWith(href);
    }
  });

  it('keeps the primary colour the single accent across the page', () => {
    mockExperience.continueItems = [
      {
        type: 'comparison',
        title: 'Kampala and Nairobi',
        description: 'Continue comparing 2 locations.',
        href: '/user/air-quality/analytics?view=comparison',
        timestamp: '2026-01-01T00:00:00.000Z',
        iconName: 'compare',
      },
    ];
    renderHome();

    // Every section title is anchored by the same primary marker.
    ['Continue your work', 'Jump right in', 'Updates from your places'].forEach(
      name => {
        const heading = screen.getByRole('heading', { name });
        expect(
          heading.parentElement?.querySelector('span[aria-hidden="true"]')
        ).toHaveClass('bg-primary');
      }
    );

    // The greeting stays neutral — primary is reserved for the interactive
    // surfaces below, so the header keeps its quiet, scannable top.
    expect(screen.getByText('Welcome, Amina')).toHaveClass(
      'text-muted-foreground'
    );
    expect(screen.getByText('Welcome, Amina')).not.toHaveClass('text-primary');

    // Interactive tiles are tinted with the primary token, never raw hex.
    const outcomeIcon = screen
      .getByTestId('home-outcome-compare-places')
      .querySelector('span.rounded-md');
    expect(outcomeIcon).toHaveClass('bg-primary/10', 'text-primary');
    expect(screen.getByTestId('home-hint').closest('div')).toHaveClass(
      'bg-primary/[0.03]'
    );
  });

  it('keeps the status strip neutral when a location has no reading yet', () => {
    mockExperience.mode = 'returning';
    mockExperience.activeComparison = { id: 'c1', name: 'Gulu' };
    mockExperience.locationUpdates = [
      {
        name: 'Akwa',
        href: '/user/air-quality/analytics/sites/akwa?site_id=site-2',
        aqiIndex: null,
        aqiCategory: null,
      },
    ];

    renderHome();

    const placeCard = screen.getByTestId('home-place-update');
    expect(placeCard).toHaveClass('border-t-[3px]', 'border-t-border');
    // No inline override, so the token neutral colour applies — never currentColor.
    expect(placeCard.style.borderTopColor).toBe('');
    expect(placeCard).toHaveTextContent('No reading yet');
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
    mockExperience.activeComparison = {
      id: 'c1',
      name: 'Kampala and Nairobi',
    };

    renderHome();

    expect(screen.getByText('Welcome back, Amina')).toBeInTheDocument();
    expect(screen.getByTestId('home-continue-comparison')).toBeInTheDocument();
    expect(screen.getByTestId('home-place-update')).toHaveTextContent(
      'Makerere University'
    );
    expect(screen.getByTestId('home-place-update')).toHaveTextContent('Good');
    // The 3px status strip must carry an explicit token colour. Without one it
    // inherits `currentColor` and renders as a dark bar across the card top.
    const placeCard = screen.getByTestId('home-place-update');
    expect(placeCard).toHaveClass('border-t-[3px]', 'border-t-border');
    // A reading paints the strip with the AQI category colour inline.
    expect(placeCard.style.borderTopColor).not.toBe('');
    expect(
      screen.getByRole('button', { name: 'See readings' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View map' })).toBeNull();

    const updates = screen.getByRole('region', {
      name: 'Updates from your places',
    });
    // The section title stands alone — the saved group name is not surfaced.
    expect(updates).not.toHaveTextContent('Kampala and Nairobi');
    expect(updates).toContainElement(screen.getByTestId('home-place-update'));
    expect(
      screen.getByRole('heading', { name: 'Updates from your places' })
    ).toBeInTheDocument();
    expect(updates).toContainElement(
      screen.getByRole('button', { name: 'View all' })
    );

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'See readings' }));
    // The origin is appended so the site page's breadcrumb returns to home.
    expect(mockPush).toHaveBeenCalledWith(
      '/user/air-quality/analytics/sites/makerere-university?site_id=site-1&from=%2Fuser%2Fhome'
    );

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'View all' }));
    expect(mockPush).toHaveBeenCalledWith(
      '/user/air-quality/analytics?view=comparison'
    );
  });

  it('offers a compare-places action when there are no saved locations', async () => {
    renderHome();

    expect(
      screen.getByRole('heading', { name: 'Updates from your places' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'No saved locations yet' })
    ).toBeInTheDocument();
    // The empty state carries its own call to action, so "View all" is hidden.
    expect(screen.queryByRole('button', { name: 'View all' })).toBeNull();
    expect(screen.queryByTestId('home-place-update')).toBeNull();

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Compare places' }));
    expect(mockPush).toHaveBeenCalledWith(
      '/user/air-quality/analytics?view=comparison'
    );
  });

  it('keeps the updates header visible while place updates load', () => {
    mockExperience.updatesLoading = true;

    renderHome();

    expect(
      screen.getByRole('heading', { name: 'Updates from your places' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'View all' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Loading place updates' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'No saved locations yet' })
    ).toBeNull();
    expect(screen.queryByTestId('home-place-update')).toBeNull();
  });

  it('stays usable when a data source fails without showing a raw error', () => {
    mockExperience.hasPartialError = true;

    renderHome();

    expect(
      screen.queryByText(/personalized updates are unavailable/i)
    ).toBeNull();
    expect(screen.queryByText(/TypeError|token|stack/i)).toBeNull();
    expect(screen.getByTestId('home-outcome-compare-places')).toBeEnabled();
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
