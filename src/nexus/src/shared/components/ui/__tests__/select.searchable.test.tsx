import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// react-popper positions via DOM measurement that jsdom cannot provide. Stub it
// so the list renders inline; the search/selection logic under test is
// independent of positioning.
jest.mock('react-popper', () => ({
  usePopper: () => ({
    styles: { popper: { position: 'relative' } },
    attributes: { popper: {} },
    update: jest.fn(),
  }),
}));

import SelectField from '../select';

const STAFF = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@airqo.net' },
  { id: '2', name: 'Grace Hopper', email: 'grace@airqo.net' },
  { id: '3', name: 'Alan Turing', email: 'alan@airqo.net' },
  { id: '4', name: 'Katherine Johnson', email: 'kj@airqo.net' },
];

const AssigneeSelect = ({
  value = '',
  onChange,
  searchable = true,
}: {
  value?: string;
  onChange?: (event: { target: { value: unknown } }) => void;
  searchable?: boolean;
}) => (
  <SelectField
    label="Assignee"
    searchable={searchable}
    value={value}
    onChange={onChange}
    placeholder="Select a team member"
  >
    <option value="">Unassigned</option>
    {STAFF.map(member => (
      <option key={member.id} value={member.id} data-search={member.email}>
        {member.name}
      </option>
    ))}
  </SelectField>
);

const trigger = () => screen.getByRole('button', { name: /assignee/i });
const searchBox = () => screen.getByRole('combobox');
const optionNames = () =>
  screen.getAllByRole('option').map(node => node.textContent);

describe('SelectField searchable', () => {
  it('shows every option before a search is typed', async () => {
    const user = userEvent.setup();
    render(<AssigneeSelect />);

    await user.click(trigger());

    expect(optionNames()).toEqual([
      'Unassigned',
      'Ada Lovelace',
      'Grace Hopper',
      'Alan Turing',
      'Katherine Johnson',
    ]);
  });

  it('filters on the visible label', async () => {
    const user = userEvent.setup();
    render(<AssigneeSelect />);

    await user.click(trigger());
    await user.type(searchBox(), 'hopper');

    expect(optionNames()).toEqual(['Grace Hopper']);
  });

  it('filters on data-search text that is not displayed, e.g. an email', async () => {
    const user = userEvent.setup();
    render(<AssigneeSelect />);

    await user.click(trigger());
    await user.type(searchBox(), 'kj@airqo.net');

    expect(optionNames()).toEqual(['Katherine Johnson']);
  });

  it('reports when a search matches nothing', async () => {
    const user = userEvent.setup();
    render(<AssigneeSelect />);

    await user.click(trigger());
    await user.type(searchBox(), 'nobody-here');

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(
      screen.getByText(/No matches for “nobody-here”/)
    ).toBeInTheDocument();
  });

  it('selects a filtered option and closes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<AssigneeSelect onChange={onChange} />);

    await user.click(trigger());
    await user.type(searchBox(), 'turing');
    await user.click(screen.getByRole('option', { name: 'Alan Turing' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.value).toBe('3');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('keeps the whole list keyboard-navigable from the search box', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<AssigneeSelect onChange={onChange} />);

    await user.click(trigger());
    await user.type(searchBox(), 'a');

    // Matches: Unassigned, Ada Lovelace, Grace Hopper, Alan Turing,
    // Katherine Johnson — all contain an "a".
    expect(optionNames()).toHaveLength(5);

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.value).toBe('1');
  });

  it('clears a stale query when reopened', async () => {
    const user = userEvent.setup();
    render(<AssigneeSelect />);

    await user.click(trigger());
    await user.type(searchBox(), 'hopper');
    expect(optionNames()).toEqual(['Grace Hopper']);

    await user.keyboard('{Escape}');
    await user.click(trigger());

    expect(searchBox()).toHaveValue('');
    expect(optionNames()).toHaveLength(5);
  });

  it('is off by default, so existing dropdowns are unchanged', async () => {
    const user = userEvent.setup();
    render(<AssigneeSelect searchable={false} />);

    await user.click(trigger());

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(optionNames()).toHaveLength(5);
  });

  it('still selects from the full list when not searchable', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<AssigneeSelect searchable={false} onChange={onChange} />);

    await user.click(trigger());
    await user.click(screen.getByRole('option', { name: 'Grace Hopper' }));

    expect(onChange.mock.calls[0][0].target.value).toBe('2');
  });

  // The option list is portalled to document.body, so a click inside it lands
  // outside the select's own container. Outside-click detection has to test
  // both roots, or typing in the filter box would dismiss the list.
  it('stays open when the click lands inside the portalled popper', async () => {
    const user = userEvent.setup();
    const { container } = render(<AssigneeSelect />);

    await user.click(trigger());

    const popper = screen.getByRole('listbox').parentElement as HTMLElement;
    // Proof the list really is portalled out of the select's container.
    expect(document.body).toContainElement(popper);
    expect(container).not.toContainElement(popper);

    // Clicking the filter box inside the popper must not dismiss the list…
    fireEvent.mouseDown(searchBox());
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');

    // …nor clicking any other part of the popper.
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Ada Lovelace' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes on a click outside both the trigger and the popper', async () => {
    const user = userEvent.setup();
    render(<AssigneeSelect />);

    await user.click(trigger());
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });
});
