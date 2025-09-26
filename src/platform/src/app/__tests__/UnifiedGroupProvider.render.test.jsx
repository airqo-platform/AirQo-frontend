import React from 'react';
import { render } from '@testing-library/react';
import UnifiedGroupProvider from '@/app/providers/UnifiedGroupProvider';
import * as nextAuth from 'next-auth/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Create a small mock store with the expected slices
const mockStore = configureStore([]);

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: jest.fn() }),
}));

describe('UnifiedGroupProvider rendering behaviors', () => {
  test('renders children when activeGroup exists even if sessionInitialized is false', async () => {
    const store = mockStore({
      groups: {
        activeGroup: { _id: 'g1', grp_title: 'Org' },
        userGroups: [{ _id: 'g1' }],
      },
    });

    jest.spyOn(nextAuth, 'useSession').mockReturnValue({
      data: { user: { id: 'u1' } },
      status: 'authenticated',
    });

    const { getByText } = render(
      <Provider store={store}>
        <UnifiedGroupProvider>
          <div>CHILDREN_RENDERED</div>
        </UnifiedGroupProvider>
      </Provider>,
    );

    expect(getByText('CHILDREN_RENDERED')).toBeTruthy();
  });
});
