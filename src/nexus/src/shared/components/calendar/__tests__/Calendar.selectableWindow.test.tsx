import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Calendar } from '../components/Calendar';

// The month arrows render through the shared Button, which calls useRouter()
// and useMediaQuery(); neither exists in jsdom.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));

// Card reads the theme slice off the redux store; the day grid does not depend
// on it, so render the markup without the provider.
jest.mock('@/shared/components/ui/card', () => {
  const MockCard = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Card: MockCard,
    CardHeader: MockCard,
    CardTitle: MockCard,
    CardDescription: MockCard,
    CardContent: MockCard,
    CardFooter: MockCard,
  };
});

// Day cells are the only buttons carrying `aria-disabled` without an
// `aria-label` (the month arrows are labelled), and each renders just its
// day-of-month.
const dayButtons = () =>
  Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      'button[aria-disabled]:not([aria-label])'
    )
  );

const day = (value: number) =>
  dayButtons().find(button => button.textContent === String(value));

const september = (
  props: Partial<React.ComponentProps<typeof Calendar>> = {}
) => (
  <Calendar
    numberOfMonths={1}
    initialRange={{ from: new Date(2026, 8, 4), to: new Date(2026, 8, 4) }}
    {...props}
  />
);

describe('Calendar selectable window', () => {
  it('enables every in-month day when no bounds are given', () => {
    render(september());

    expect(day(4)).toBeEnabled();
    expect(day(30)).toBeEnabled();
  });

  it('disables days outside minDate/maxDate', () => {
    render(
      september({
        initialRange: {
          from: new Date(2026, 8, 4),
          to: new Date(2026, 8, 10),
        },
        minDate: new Date(2026, 8, 4),
        maxDate: new Date(2026, 8, 10),
      })
    );

    expect(day(4)).toBeEnabled();
    expect(day(10)).toBeEnabled();
    expect(day(3)).toBeDisabled();
    expect(day(11)).toBeDisabled();
    expect(day(30)).toBeDisabled();
  });

  it('treats a maxDate of "today at midnight" as including today', () => {
    // Bounds are compared as calendar days, so a start-of-day timestamp must
    // not lock out its own day.
    render(september({ maxDate: new Date(2026, 8, 4, 0, 0, 0, 0) }));

    expect(day(4)).toBeEnabled();
    expect(day(5)).toBeDisabled();
  });

  it('applies the disabled predicate on top of the bounds', () => {
    render(september({ disabled: date => date.getDate() % 2 === 0 }));

    expect(day(5)).toBeEnabled();
    expect(day(4)).toBeDisabled();
    expect(day(6)).toBeDisabled();
  });

  it('keeps out-of-month padding days disabled without a bound', () => {
    render(september());

    const buttons = dayButtons();
    expect(buttons.length).toBeGreaterThan(28);
    expect(buttons.filter(button => button.disabled).length).toBeGreaterThan(0);
  });

  it('stops the month arrows at the edge of the selectable window', () => {
    render(
      september({
        initialRange: {
          from: new Date(2026, 8, 4),
          to: new Date(2026, 8, 10),
        },
        maxDate: new Date(2026, 8, 10),
      })
    );

    // October holds nothing selectable, so paging forward is pointless.
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    // August holds selectable days, so paging back stays available.
    expect(
      screen.getByRole('button', { name: 'Previous month' })
    ).toBeEnabled();
  });
});

describe('Calendar single-date selection', () => {
  // The regression: the grid used to run its two-click range logic in every
  // mode, so one click on a single-date picker produced `{ from, to: undefined }`
  // — an empty end box and a second click the user had no reason to make.
  const single = (
    props: Partial<React.ComponentProps<typeof Calendar>> = {}
  ) => (
    <Calendar
      numberOfMonths={1}
      mode="single"
      initialRange={{ from: new Date(2026, 8, 4), to: new Date(2026, 8, 4) }}
      {...props}
    />
  );

  it('completes on the first click, with no end left to pick', () => {
    const onRangeChange = jest.fn();
    render(single({ onRangeChange }));

    fireEvent.click(day(12)!);

    expect(onRangeChange).toHaveBeenCalledTimes(1);
    // Both ends set to the clicked day: nothing is left half-finished.
    expect(onRangeChange).toHaveBeenCalledWith({
      from: new Date(2026, 8, 12),
      to: new Date(2026, 8, 12),
    });
  });

  it('replaces the previous value on each click rather than starting a new range', () => {
    const onRangeChange = jest.fn();
    render(single({ onRangeChange }));

    fireEvent.click(day(12)!);
    fireEvent.click(day(20)!);

    // A second click overwrites; it never grows into a 12→20 range.
    expect(onRangeChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 8, 20),
      to: new Date(2026, 8, 20),
    });
  });

  it('does not need a second click before Apply carries the new date', () => {
    const onApply = jest.fn();
    render(
      <Calendar
        numberOfMonths={1}
        mode="single"
        onRangeChange={jest.fn()}
        onApply={onApply}
      />
    );

    fireEvent.click(day(12)!);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledWith({
      from: new Date(2026, 8, 12),
      to: new Date(2026, 8, 12),
    });
  });

  it('still reports a disabled day as unselectable', () => {
    const onRangeChange = jest.fn();
    render(single({ onRangeChange, minDate: new Date(2026, 8, 10) }));

    fireEvent.click(day(5)!);
    expect(onRangeChange).not.toHaveBeenCalled();

    fireEvent.click(day(12)!);
    expect(onRangeChange).toHaveBeenCalledTimes(1);
  });
});

describe('CalendarFooter single-mode chrome', () => {
  // A single date has no period, so the end-of-range box and the time-range
  // pair are controls whose value could never be carried anywhere.
  const footerInputs = () =>
    Array.from(document.querySelectorAll<HTMLInputElement>('input'));

  it('shows one date box and no time controls in single mode', () => {
    render(
      <Calendar
        numberOfMonths={1}
        mode="single"
        initialRange={{ from: new Date(2026, 8, 4), to: new Date(2026, 8, 4) }}
      />
    );

    expect(footerInputs()).toHaveLength(1);
    expect(footerInputs()[0]).toHaveValue('Sep 4, 2026');
    expect(screen.queryByText('Include Time')).not.toBeInTheDocument();
  });

  it('keeps both date boxes and the time toggle in range mode', () => {
    render(
      <Calendar
        numberOfMonths={1}
        initialRange={{ from: new Date(2026, 8, 4), to: new Date(2026, 8, 10) }}
      />
    );

    expect(footerInputs()).toHaveLength(2);
    expect(footerInputs()[0]).toHaveValue('Sep 4, 2026');
    expect(footerInputs()[1]).toHaveValue('Sep 10, 2026');
    expect(screen.getByText('Include Time')).toBeInTheDocument();
  });
});
