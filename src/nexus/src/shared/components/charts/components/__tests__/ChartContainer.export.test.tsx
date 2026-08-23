import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ChartContainer } from '../ChartContainer';
import { store } from '@/shared/store';

// flowbite-react ships ESM-only and cannot be parsed by ts-jest; the dialog
// only uses its Tooltip, so stub it for the component test.
jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Shared UI Button uses the Next router; no router exists in unit tests.
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

// Shared UI (Card etc.) reads the theme from the redux store â€” use the real
// store so `interfaceStyle` etc. resolve instead of crashing.
const renderWithStore = (ui: React.ReactElement) =>
  render(<Provider store={store}>{ui}</Provider>);

describe('ChartContainer export root', () => {
  it('captures the title and subtitle inside the export root', () => {
    renderWithStore(
      <ChartContainer title="My chart" subtitle="My subtitle">
        <div>chart body</div>
      </ChartContainer>
    );

    const root = document.querySelector('[data-export-root]');
    expect(root).not.toBeNull();
    expect(root).toContainElement(screen.getByText('My chart'));
    expect(root).toContainElement(screen.getByText('My subtitle'));
    expect(root).toContainElement(screen.getByText('chart body'));
  });

  it('excludes the More button and footer actions from exports', () => {
    renderWithStore(
      <ChartContainer
        title="T"
        footerHint={<button type="button">footer action</button>}
      >
        <div>body</div>
      </ChartContainer>
    );

    const moreButton = screen.getByRole('button', { name: /more/i });
    expect(
      moreButton.closest('[data-export-ignore]')
    ).not.toBeNull();

    const footerAction = screen.getByRole('button', {
      name: 'footer action',
    });
    expect(
      footerAction.closest('[data-export-ignore]')
    ).not.toBeNull();
  });

  it('excludes the inline title editor while it is open', async () => {
    renderWithStore(
      <ChartContainer title="T" onEditTitle={jest.fn()}>
        <div>body</div>
      </ChartContainer>
    );

    fireEvent.click(screen.getByRole('button', { name: /more/i }));
    const editButton = await waitFor(() =>
      screen.getByRole('button', { name: /edit title & subtitle/i })
    );
    fireEvent.click(editButton);

    const titleInput = screen.getByLabelText('Chart title');
    expect(
      titleInput.closest('[data-export-ignore]')
    ).not.toBeNull();
  });
});
