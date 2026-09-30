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
  const React = require('react');
  return {
    Card: React.forwardRef(
      (
        {
          children,
          ...props
        }: React.HTMLAttributes<HTMLDivElement> & {
          children?: React.ReactNode;
        },
        ref: React.Ref<HTMLDivElement>
      ) => (
        <div ref={ref} {...props}>
          {children}
        </div>
      )
    ),
  };
});

import { HomeShortcutGuide } from '../HomeShortcutGuide';

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
});
