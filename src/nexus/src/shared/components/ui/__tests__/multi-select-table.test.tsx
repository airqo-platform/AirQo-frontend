import { fireEvent, render, screen } from '@testing-library/react';
import { MultiSelectTable } from '../multi-select-table';

jest.mock('@/shared/components/ui/dialog', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/shared/hooks/redux', () => ({
  useAppSelector: () => ({ interfaceStyle: 'default' }),
}));

describe('MultiSelectTable pagination callbacks', () => {
  it('does not report the current page as a page change', () => {
    const onClientPageChange = jest.fn();
    const data = Array.from({ length: 11 }, (_, index) => ({
      id: `row-${index + 1}`,
      name: `Row ${index + 1}`,
    }));

    render(
      <MultiSelectTable
        data={data}
        columns={[{ key: 'name', label: 'Name' }]}
        pageSize={10}
        searchable={false}
        filterable={false}
        sortable={false}
        onClientPageChange={onClientPageChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 1' }));
    expect(onClientPageChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(onClientPageChange).toHaveBeenCalledTimes(1);
    expect(onClientPageChange).toHaveBeenCalledWith(2);
  });
});
