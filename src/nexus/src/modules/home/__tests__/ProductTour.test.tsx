import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductTour } from '../ProductTour';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
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

const steps = [
  {
    target: '[data-tour="missing"]',
    title: 'First step',
    description: 'Start here.',
  },
  {
    target: '[data-tour="missing"]',
    title: 'Last step',
    description: 'Finish here.',
  },
];

describe('ProductTour', () => {
  it('keeps Tab on the last control and Shift+Tab on the first inside the tour', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside</button>
        <ProductTour steps={steps} onClose={jest.fn()} />
      </>
    );

    const close = screen.getByRole('button', { name: 'Close tour' });
    const next = screen.getByRole('button', { name: 'Next' });
    const outside = screen.getByRole('button', { name: 'Outside' });

    next.focus();
    await user.tab();
    expect(close).toHaveFocus();
    expect(outside).not.toHaveFocus();

    await user.tab({ shift: true });
    expect(next).toHaveFocus();
    expect(outside).not.toHaveFocus();
  });
});
