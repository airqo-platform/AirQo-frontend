import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockReplace = jest.fn();
let pathname = '/user/air-quality/analytics';
let params = new URLSearchParams('view=comparison&homeStart=compare-places');

jest.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useSearchParams: () => params,
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/shared/components/ui/card', () => {
  const React = jest.requireActual<typeof import('react')>('react');

  const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(function Card({ children, ...props }, ref) {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  });
  Card.displayName = 'Card';

  return { Card };
});

import { GUIDES, HomeShortcutGuide } from '../components/HomeShortcutGuide';
import { OUTCOME_ACTIONS } from '../constants';

describe('HomeShortcutGuide', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    pathname = '/user/air-quality/analytics';
    params = new URLSearchParams('view=comparison&homeStart=compare-places');
  });

  it('spotlights the comparison tools and keeps the selected tab on dismiss', async () => {
    render(<HomeShortcutGuide />);

    expect(
      screen.getByRole('dialog', { name: 'Compare places' })
    ).toHaveTextContent('Choose your view');

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Close tour' }));
    expect(mockReplace).toHaveBeenCalledWith(
      '/user/air-quality/analytics?view=comparison',
      { scroll: false }
    );
  });

  it('does not show a guide for a mismatched route or no home entry', () => {
    pathname = '/user/data-export';
    const { rerender } = render(<HomeShortcutGuide />);
    expect(screen.queryByTestId('product-tour')).toBeNull();

    pathname = '/user/air-quality/analytics';
    params = new URLSearchParams();
    rerender(<HomeShortcutGuide />);
    expect(screen.queryByTestId('product-tour')).toBeNull();
  });

  it('keeps every guide pathname aligned with its outcome action', () => {
    expect(OUTCOME_ACTIONS.length).toBeGreaterThan(0);

    for (const action of OUTCOME_ACTIONS) {
      const href = new URL(action.href, 'https://nexus.example');
      const homeStart = href.searchParams.get('homeStart');
      expect(homeStart).toBeTruthy();
      const guide = GUIDES[homeStart as string];
      expect(guide).toBeDefined();
      expect(guide.pathname).toBe(href.pathname);
    }
  });
});
