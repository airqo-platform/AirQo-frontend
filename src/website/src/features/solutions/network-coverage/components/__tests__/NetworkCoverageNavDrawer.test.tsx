import { fireEvent, render, screen, within } from '@testing-library/react';

import NetworkCoverageNavDrawer from '../NetworkCoverageNavDrawer';

jest.mock('@/hooks/useLockBodyScroll', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('NetworkCoverageNavDrawer', () => {
  it('keeps the final Resources link reachable inside its scrollable section', () => {
    render(<NetworkCoverageNavDrawer isOpen onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Resources' }));

    const resourcesSection = document.getElementById('nav-section-Resources');
    expect(resourcesSection).not.toBeNull();
    expect(resourcesSection).toHaveClass('max-h-[70vh]', 'overflow-y-auto');
    expect(
      within(resourcesSection as HTMLElement).getByRole('link', {
        name: /Help & FAQs/i,
      }),
    ).toHaveAttribute('href', '/faqs');
  });
});
