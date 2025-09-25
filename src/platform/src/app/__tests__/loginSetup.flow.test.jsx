import React from 'react';import React from 'react';import React from 'react';

import { render, waitFor } from '@testing-library/react';

import HomePage from '@/app/page';import { render, act, waitFor } from '@testing-library/react';import { render, act, waitFor } from '@testing-library/react';



const mockReplace = jest.fn();import HomePage from '@/app/page';import HomePage from '@/ap  test('provider-only activeGroup: requires sessionInitialized for redirect', async () => {



jest.mock('next/navigation', () => ({    useSession.mockReturnValue({

  useRouter: () => ({ replace: mockReplace }),

  usePathname: () => '/',const mockReplace = jest.fn();      data: { user: { id: 'u-5' } },

}));

      status: 'authenticated',

jest.mock('next-auth/react', () => ({

  useSession: jest.fn(),jest.mock('next/navigation', () => ({    });

}));

  useRouter: () => ({ replace: mockReplace }),

const unifiedMock = {

  sessionInitialized: false,  usePathname: () => '/',    // Set activeGroup but keep sessionInitialized false

  activeGroup: null,

};}));    unifiedMock.sessionInitialized = false;



jest.mock('@/app/providers/UnifiedGroupProvider', () => ({    unifiedMock.initialGroupSet = false;

  useUnifiedGroup: jest.fn(() => unifiedMock),

}));jest.mock('next-auth/react', () => ({    unifiedMock.activeGroup = { _id: 'g-provider' };



import { useSession } from 'next-auth/react';  useSession: jest.fn(),



describe('Comprehensive login/setup flow tests', () => {}));    render(<HomePage />);

  beforeEach(() => {

    jest.clearAllMocks();

    unifiedMock.sessionInitialized = false;

    unifiedMock.activeGroup = null;const unifiedMock = {    // Should show loading because sessionInitialized is false

    mockReplace.mockClear();

  });  sessionInitialized: false,    // Even though activeGroup exists, we need sessionInitialized for redirect



  test('immediate success: activeGroup and sessionInitialized both ready => redirect', async () => {  initialGroupSet: false,    await waitFor(() => {

    useSession.mockReturnValue({

      data: { user: { id: 'u-1' } },  activeGroup: null,      expect(mockReplace).not.toHaveBeenCalled();

      status: 'authenticated',

    });};    });

    unifiedMock.sessionInitialized = true;

    unifiedMock.activeGroup = { _id: 'g-immediate' };



    render(<HomePage />);jest.mock('@/app/providers/UnifiedGroupProvider', () => ({    // Now set sessionInitialized to true



    await waitFor(() => {  useUnifiedGroup: jest.fn(() => unifiedMock),    unifiedMock.sessionInitialized = true;

      expect(mockReplace).toHaveBeenCalled();

    });}));    

  });

    // Re-render to trigger effect

  test('provider-only activeGroup: requires sessionInitialized for redirect', async () => {

    useSession.mockReturnValue({// Reuse the loginSetup module mock so setupUserSession can be controlled    render(<HomePage />);

      data: { user: { id: 'u-5' } },

      status: 'authenticated',jest.mock('@/core/utils/loginSetup', () => ({

    });

  __esModule: true,    // Now it should redirect

    // Set activeGroup but keep sessionInitialized false

    unifiedMock.sessionInitialized = false;  setupUserSession: jest.fn(),    await waitFor(() => {

    unifiedMock.activeGroup = { _id: 'g-provider' };

  default: jest.fn(),      expect(mockReplace).toHaveBeenCalled();

    render(<HomePage />);

}));    });

    // Should show loading because sessionInitialized is false

    await waitFor(() => {  }); mockReplace = jest.fn();

      expect(mockReplace).not.toHaveBeenCalled();

    });import { useSession } from 'next-auth/react';

  });

});// loginSetup module is mocked above; no direct import needed herejest.mock('next/navigation', () => ({

  useRouter: () => ({ replace: mockReplace }),

describe('Comprehensive login/setup flow tests', () => {  usePathname: () => '/',

  beforeEach(() => {}));

    jest.clearAllMocks();

    unifiedMock.sessionInitialized = false;jest.mock('next-auth/react', () => ({

    unifiedMock.initialGroupSet = false;  useSession: jest.fn(),

    unifiedMock.activeGroup = null;}));

    mockReplace.mockClear();

  });const unifiedMock = {

  sessionInitialized: false,

  test('immediate success: setupUserSession returns activeGroup => redirect', async () => {  initialGroupSet: false,

    // Provider already has activeGroup set (immediate case)  activeGroup: null,

    useSession.mockReturnValue({};

      data: { user: { id: 'u-1' } },

      status: 'authenticated',jest.mock('@/app/providers/UnifiedGroupProvider', () => ({

    });  useUnifiedGroup: jest.fn(() => unifiedMock),

    unifiedMock.sessionInitialized = true;}));

    unifiedMock.initialGroupSet = true;

    unifiedMock.activeGroup = { _id: 'g-immediate' };// Reuse the loginSetup module mock so setupUserSession can be controlled

jest.mock('@/core/utils/loginSetup', () => ({

    render(<HomePage />);  __esModule: true,

  setupUserSession: jest.fn(),

    await waitFor(() => {  default: jest.fn(),

      expect(mockReplace).toHaveBeenCalled();}));

    });

  });import { useSession } from 'next-auth/react';

// loginSetup module is mocked above; no direct import needed here

  test('delayed success: setup resolves later, no redirect until provider shows activeGroup', async () => {

    // Delayed success: setup happens in background; Page should not redirect until provider shows activeGroupdescribe('Comprehensive login/setup flow tests', () => {

    useSession.mockReturnValue({  beforeEach(() => {

      data: { user: { id: 'u-2' } },    jest.clearAllMocks();

      status: 'authenticated',    unifiedMock.sessionInitialized = false;

    });    unifiedMock.initialGroupSet = false;

    unifiedMock.activeGroup = null;

    const { rerender } = render(<HomePage />);    mockReplace.mockClear();

  });

    // No active group yet => no redirect

    expect(mockReplace).not.toHaveBeenCalled();  test('immediate success: setupUserSession returns activeGroup => redirect', async () => {

    // Provider already has activeGroup set (immediate case)

    // now simulate provider updating after setup resolves    useSession.mockReturnValue({

    await act(async () => {      data: { user: { id: 'u-1' } },

      unifiedMock.sessionInitialized = true;      status: 'authenticated',

      unifiedMock.initialGroupSet = true;    });

      unifiedMock.activeGroup = { _id: 'g-delayed' };    unifiedMock.sessionInitialized = true;

      rerender(<HomePage />);    unifiedMock.initialGroupSet = true;

    });    unifiedMock.activeGroup = { _id: 'g-immediate' };



    await waitFor(() => expect(mockReplace).toHaveBeenCalled());    render(<HomePage />);

  });

    await waitFor(() => {

  test('setup failure: do not redirect and show error state', async () => {      expect(mockReplace).toHaveBeenCalled();

    useSession.mockReturnValue({    });

      data: { user: { id: 'u-3' } },  });

      status: 'authenticated',

    });  test('delayed success: setup resolves later, no redirect until provider shows activeGroup', async () => {

    // provider remains uninitialized and no activeGroup    // Delayed success: setup happens in background; Page should not redirect until provider shows activeGroup

    unifiedMock.sessionInitialized = false;    useSession.mockReturnValue({

    unifiedMock.initialGroupSet = false;      data: { user: { id: 'u-2' } },

    unifiedMock.activeGroup = null;      status: 'authenticated',

    });

    render(<HomePage />);

    const { rerender } = render(<HomePage />);

    // ensure no redirect

    await new Promise((r) => setTimeout(r, 50));    // No active group yet => no redirect

    expect(mockReplace).not.toHaveBeenCalledWith('/user/Home');    expect(mockReplace).not.toHaveBeenCalled();

  });

    // now simulate provider updating after setup resolves

  test('no groups (no activeGroup determined): ensure no redirect and error dispatch', async () => {    await act(async () => {

    // simulate setup throwing error (no groups)      unifiedMock.sessionInitialized = true;

    useSession.mockReturnValue({      unifiedMock.initialGroupSet = true;

      data: { user: { id: 'u-4' } },      unifiedMock.activeGroup = { _id: 'g-delayed' };

      status: 'authenticated',      rerender(<HomePage />);

    });    });

    unifiedMock.sessionInitialized = false;

    unifiedMock.initialGroupSet = false;    await waitFor(() => expect(mockReplace).toHaveBeenCalled());

    unifiedMock.activeGroup = null;  });



    render(<HomePage />);  test('setup failure: do not redirect and show error state', async () => {

    useSession.mockReturnValue({

    await new Promise((r) => setTimeout(r, 50));      data: { user: { id: 'u-3' } },

    expect(mockReplace).not.toHaveBeenCalled();      status: 'authenticated',

  });    });

    // provider remains uninitialized and no activeGroup

  test('provider-only activeGroup: requires sessionInitialized for redirect', async () => {    unifiedMock.sessionInitialized = false;

    useSession.mockReturnValue({    unifiedMock.initialGroupSet = false;

      data: { user: { id: 'u-5' } },    unifiedMock.activeGroup = null;

      status: 'authenticated',

    });    render(<HomePage />);



    // Set activeGroup but keep sessionInitialized false    // ensure no redirect

    unifiedMock.sessionInitialized = false;    await new Promise((r) => setTimeout(r, 50));

    unifiedMock.initialGroupSet = false;    expect(mockReplace).not.toHaveBeenCalledWith('/user/Home');

    unifiedMock.activeGroup = { _id: 'g-provider' };  });



    render(<HomePage />);  test('no groups (no activeGroup determined): ensure no redirect and error dispatch', async () => {

    // simulate setup throwing error (no groups)

    // Should show loading because sessionInitialized is false    useSession.mockReturnValue({

    // Even though activeGroup exists, we need sessionInitialized for redirect      data: { user: { id: 'u-4' } },

    await waitFor(() => {      status: 'authenticated',

      expect(mockReplace).not.toHaveBeenCalled();    });

    });    unifiedMock.sessionInitialized = false;

    unifiedMock.initialGroupSet = false;

    // Now set sessionInitialized to true    unifiedMock.activeGroup = null;

    unifiedMock.sessionInitialized = true;

        render(<HomePage />);

    // Re-render to trigger effect

    render(<HomePage />);    await new Promise((r) => setTimeout(r, 50));

    expect(mockReplace).not.toHaveBeenCalled();

    // Now it should redirect  });

    await waitFor(() => {

      expect(mockReplace).toHaveBeenCalled();  test('provider-only activeGroup (provider already set): immediate render and redirect', async () => {

    });    // setupUserSession may be a no-op if provider already has activeGroup

  });    useSession.mockReturnValue({

});      data: { user: { id: 'u-5' } },
      status: 'authenticated',
    });

    unifiedMock.sessionInitialized = false;
    unifiedMock.initialGroupSet = false;
    unifiedMock.activeGroup = { _id: 'g-provider' };

    render(<HomePage />);

    // Because activeGroup exists, the page should redirect even if sessionInitialized is false
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
  });
});
