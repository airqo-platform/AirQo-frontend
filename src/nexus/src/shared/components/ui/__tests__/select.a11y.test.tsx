import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// react-popper positions via DOM measurement that jsdom cannot provide. Stub it
// so the list renders inline; the ARIA wiring under test is independent of
// positioning.
jest.mock('react-popper', () => ({
  usePopper: () => ({
    styles: { popper: { position: 'relative' } },
    attributes: { popper: {} },
    update: jest.fn(),
  }),
}));

import SelectField from '../select';

const TEAM = [
  { id: '1', name: 'Ada Lovelace' },
  { id: '2', name: 'Grace Hopper' },
  { id: '3', name: 'Alan Turing' },
];

const SimpleSelect = ({
  searchable = false,
  onChange,
}: {
  searchable?: boolean;
  onChange?: (event: { target: { value: unknown } }) => void;
}) => (
  <SelectField label="Assignee" searchable={searchable} onChange={onChange}>
    {TEAM.map(member => (
      <option key={member.id} value={member.id}>
        {member.name}
      </option>
    ))}
  </SelectField>
);

const trigger = () => screen.getByRole('button', { name: /assignee/i });

describe('SelectField ARIA stability', () => {
  it('keeps trigger and listbox ids stable across open/close cycles', async () => {
    const user = userEvent.setup();
    render(<SimpleSelect />);

    // Open — capture ids from the first cycle.
    await user.click(trigger());
    const listId = screen.getByRole('listbox').id;
    expect(trigger()).toHaveAttribute('aria-controls', listId);
    const listIdFirstOpen = listId;

    // Close.
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    // Reopen — ids must not change (a per-render Math.random() id would
    // invalidate aria-controls / aria-activedescendant / label wiring).
    await user.click(trigger());
    expect(screen.getByRole('listbox').id).toBe(listIdFirstOpen);
    expect(trigger()).toHaveAttribute('aria-controls', listIdFirstOpen);
    expect(trigger()).toHaveAccessibleName('Assignee');

    // Close and reopen once more to be sure the id is not re-derived.
    await user.keyboard('{Escape}');
    await user.click(trigger());
    expect(screen.getByRole('listbox').id).toBe(listIdFirstOpen);
  });

  it('keeps label and description ids stable across re-renders', () => {
    const { rerender } = render(<SimpleSelect />);

    const labelledBy = trigger().getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    rerender(<SimpleSelect />);
    expect(trigger().getAttribute('aria-labelledby')).toBe(labelledBy);
  });
});

describe('SelectField aria-activedescendant on a non-searchable select', () => {
  it('points at the highlighted option while arrow-navigating', async () => {
    const user = userEvent.setup();
    render(<SimpleSelect />);

    await user.click(trigger());
    const listId = screen.getByRole('listbox').id;

    // Nothing highlighted yet.
    expect(trigger()).not.toHaveAttribute('aria-activedescendant');

    // First ArrowDown highlights the first option.
    await user.keyboard('{ArrowDown}');
    expect(trigger()).toHaveAttribute(
      'aria-activedescendant',
      `${listId}-option-0`
    );

    // Second ArrowDown moves the highlight.
    await user.keyboard('{ArrowDown}');
    expect(trigger()).toHaveAttribute(
      'aria-activedescendant',
      `${listId}-option-1`
    );

    // ArrowUp moves it back.
    await user.keyboard('{ArrowUp}');
    expect(trigger()).toHaveAttribute(
      'aria-activedescendant',
      `${listId}-option-0`
    );
  });

  it('clears aria-activedescendant when the dropdown closes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SimpleSelect onChange={onChange} />);

    await user.click(trigger());
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange.mock.calls[0][0].target.value).toBe('1');
    expect(trigger()).not.toHaveAttribute('aria-activedescendant');
  });
});
