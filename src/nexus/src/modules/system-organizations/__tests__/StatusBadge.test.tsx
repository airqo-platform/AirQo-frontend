import React from 'react';
import { render, screen } from '@testing-library/react';

import StatusBadge from '../components/StatusBadge';

/** Asserts the pill keeps its shared shape and picks the ACTIVE palette. */
const expectActive = (element: HTMLElement) => {
  expect(element).toHaveClass('inline-flex');
  expect(element).toHaveClass('whitespace-nowrap');
  expect(element).toHaveClass('bg-green-100');
  expect(element).not.toHaveClass('bg-gray-100');
};

/** Same shape, but the neutral (INACTIVE/unknown) palette. */
const expectNeutral = (element: HTMLElement) => {
  expect(element).toHaveClass('inline-flex');
  expect(element).toHaveClass('whitespace-nowrap');
  expect(element).toHaveClass('bg-gray-100');
  expect(element).not.toHaveClass('bg-green-100');
};

describe('StatusBadge', () => {
  it('renders ACTIVE with the green palette', () => {
    render(<StatusBadge status="ACTIVE" />);

    expectActive(screen.getByText('ACTIVE'));
  });

  it('renders INACTIVE with the neutral palette', () => {
    render(<StatusBadge status="INACTIVE" />);

    expectNeutral(screen.getByText('INACTIVE'));
  });

  it('normalizes lowercase statuses before comparing', () => {
    render(<StatusBadge status="active" />);

    expectActive(screen.getByText('ACTIVE'));
  });

  it('keeps an unknown status on the neutral palette and shows its label', () => {
    render(<StatusBadge status="PENDING" />);

    expectNeutral(screen.getByText('PENDING'));
  });

  it('falls back to the fallback label when the status is missing', () => {
    const { rerender } = render(<StatusBadge status="" fallback="ACTIVE" />);

    expectActive(screen.getByText('ACTIVE'));

    rerender(<StatusBadge status={null} fallback="INACTIVE" />);
    expectNeutral(screen.getByText('INACTIVE'));
  });

  it('uses UNKNOWN as the default fallback label on the neutral palette', () => {
    render(<StatusBadge status={undefined} />);

    expectNeutral(screen.getByText('UNKNOWN'));
  });

  it('appends caller classes such as the role-row shrink guard', () => {
    render(<StatusBadge status="ACTIVE" className="shrink-0" />);

    expect(screen.getByText('ACTIVE')).toHaveClass('shrink-0');
  });
});
