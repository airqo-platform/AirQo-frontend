import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrgCohortSelector } from '../OrgCohortSelector';
import type { OrgCohortOption } from '@/shared/hooks/useOrgCohorts';

// SelectField renders through react-popper, which is unreliable in jsdom
// (see DataExportPreview.test.tsx). Stub it with a native <select> that
// keeps the same onChange({ target: { value } }) contract.
jest.mock('@/shared/components/ui/select', () => {
  // Uppercase name so react-hooks/rules-of-hooks accepts the useState below.
  const MockSelectField = ({
    label,
    value,
    onChange,
    disabled,
    error,
    placeholder,
    children,
    containerClassName,
    listHeader,
    ...rest
  }: {
    label?: string;
    value?: unknown;
    onChange?: (event: { target: { value: unknown } }) => void;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
    children?: React.ReactNode;
    containerClassName?: string;
    listHeader?: React.ReactNode;
    'aria-label'?: string;
  }) => {
    // Mirrors SelectField's open state: the popper (and therefore the
    // listHeader) only exists while the dropdown is open.
    const [open, setOpen] = React.useState(false);

    return (
      <div data-testid="select-field" className={containerClassName}>
        {label ? <label>{label}</label> : null}
        <select
          aria-label={rest['aria-label'] ?? label ?? 'Cohort'}
          value={typeof value === 'string' ? value : ''}
          disabled={disabled}
          onClick={() => setOpen(true)}
          onChange={event => {
            setOpen(false);
            onChange?.({ target: { value: event.target.value } });
          }}
        >
          {!value && placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>
        {open && listHeader ? (
          <div role="presentation" data-testid="select-list-header">
            {listHeader}
          </div>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
      </div>
    );
  };

  return { __esModule: true, default: MockSelectField };
});

jest.mock('@/shared/components/ui/button', () => ({
  __esModule: true,
  Button: ({
    onClick,
    children,
    ...rest
  }: {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
    'aria-label'?: string;
  }) => (
    <button type="button" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

const cohorts: OrgCohortOption[] = [
  { id: 'cohort-1', name: 'Kampala Central' },
  { id: 'cohort-2', name: 'Jinja Network' },
];

const getSelect = (): HTMLSelectElement =>
  screen.getByRole('combobox') as HTMLSelectElement;

describe('OrgCohortSelector', () => {
  it('renders the cohort names it is given', () => {
    render(
      <OrgCohortSelector
        cohorts={cohorts}
        value="cohort-1"
        onChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole('option', { name: 'Kampala Central' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Jinja Network' })
    ).toBeInTheDocument();
    // No "All cohorts" option is ever offered.
    expect(
      screen.queryByRole('option', { name: /all cohorts/i })
    ).not.toBeInTheDocument();
  });

  it('falls back to a positional label for unnamed cohorts', () => {
    render(
      <OrgCohortSelector
        cohorts={[
          { id: 'cohort-1', name: '' },
          { id: 'cohort-2', name: 'Jinja Network' },
        ]}
        value="cohort-1"
        onChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole('option', { name: 'Cohort 1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Jinja Network' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Cohort 2' })
    ).not.toBeInTheDocument();
  });

  it('reflects the controlled value and emits user choices through onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <OrgCohortSelector
        cohorts={cohorts}
        value="cohort-1"
        onChange={onChange}
      />
    );

    expect(getSelect().value).toBe('cohort-1');

    await user.selectOptions(getSelect(), 'cohort-2');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('cohort-2');
  });

  it('shows the error and a retry action, and retry calls onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    render(
      <OrgCohortSelector
        cohorts={cohorts}
        value="cohort-1"
        onChange={jest.fn()}
        error="The organization cohorts could not be loaded."
        onRetry={onRetry}
      />
    );

    expect(
      screen.getByText('The organization cohorts could not be loaded.')
    ).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('disables the select while cohorts are loading', () => {
    render(
      <OrgCohortSelector
        cohorts={cohorts}
        value="cohort-1"
        onChange={jest.fn()}
        isLoading
      />
    );

    expect(getSelect()).toBeDisabled();
  });

  it('disables the select when there are no cohorts', () => {
    render(<OrgCohortSelector cohorts={[]} value="" onChange={jest.fn()} />);

    expect(getSelect()).toBeDisabled();
  });

  it('stays quiet in controlled mode — no automatic onChange emission', async () => {
    const onChange = jest.fn();

    render(
      <OrgCohortSelector
        cohorts={cohorts}
        value="cohort-2"
        onChange={onChange}
      />
    );

    expect(getSelect().value).toBe('cohort-2');
    // Give any (incorrect) mirror effect a chance to fire.
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the list header while the dropdown is open, and the options still work', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <OrgCohortSelector
        cohorts={cohorts}
        value="cohort-1"
        onChange={onChange}
        listHeader="Select cohort"
      />
    );

    // Nothing is rendered before the dropdown is opened.
    expect(screen.queryByText('Select cohort')).not.toBeInTheDocument();

    await user.click(getSelect());

    expect(screen.getByText('Select cohort')).toBeInTheDocument();
    // The header is presentation-only — never a selectable option.
    expect(
      screen.queryByRole('option', { name: 'Select cohort' })
    ).not.toBeInTheDocument();

    await user.selectOptions(getSelect(), 'cohort-2');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('cohort-2');
  });
});
