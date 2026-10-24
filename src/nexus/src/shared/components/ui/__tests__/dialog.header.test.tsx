import React from 'react';
import { render, screen } from '@testing-library/react';

// The dialog portals into document.body and animates with framer-motion;
// neither affects the header layout contract under test, but the imports
// need to survive jsdom. Button pulls in next/navigation and react-responsive.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@airqo/icons-react', () => ({
  AqXClose: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />,
}));

jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import ReusableDialog from '../dialog';

const LONG_TITLE =
  'An Extremely Long Organization Permission Role Assignment Configuration Title That Should Wrap';

describe('ReusableDialog header long-title handling', () => {
  it('renders a long title without clipping and keeps the close button', () => {
    render(
      <ReusableDialog
        isOpen={true}
        onClose={jest.fn()}
        title={LONG_TITLE}
        subtitle="A subtitle that is also fairly long and should wrap within the header"
      >
        <p>Body content</p>
      </ReusableDialog>
    );

    const heading = screen.getByRole('heading', { name: LONG_TITLE });
    // The title wrapper chain must let the text wrap (min-w-0) and break
    // long words instead of overflowing over the close button.
    expect(heading).toHaveClass('break-words');
    expect(heading).toHaveClass('min-w-0');
    expect(heading.parentElement).toHaveClass('min-w-0');
    expect(heading.closest('.flex.items-center.gap-3')).toHaveClass('min-w-0');

    // Close button still rendered and reachable in the header.
    expect(
      screen.getByRole('button', { name: /close dialog/i })
    ).toBeInTheDocument();
  });
});
