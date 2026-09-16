export {};

jest.mock('../apiClient', () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockPut = jest.fn();
  const mockPatch = jest.fn();
  const mockDelete = jest.fn();
  const mockSetAuthToken = jest.fn();
  const mockRemoveAuthToken = jest.fn();
  return {
    createAuthenticatedClient: () => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      patch: mockPatch,
      delete: mockDelete,
      setAuthToken: mockSetAuthToken,
      removeAuthToken: mockRemoveAuthToken,
    }),
    __mockGet: mockGet,
    __mockPost: mockPost,
    __mockPut: mockPut,
    __mockPatch: mockPatch,
    __mockDelete: mockDelete,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn(),
}));

const {
  __mockGet: mockGet,
  __mockPost: mockPost,
  __mockPut: mockPut,
  __mockDelete: mockDelete,
} = jest.requireMock('../apiClient') as {
  __mockGet: jest.Mock;
  __mockPost: jest.Mock;
  __mockPut: jest.Mock;
  __mockDelete: jest.Mock;
};

const { preferencesService } = jest.requireActual('../preferencesService') as {
  preferencesService: {
    getCharts: (groupId?: string) => Promise<unknown>;
    getChart: (chartId: string) => Promise<unknown>;
    createChart: (request: unknown) => Promise<unknown>;
    updateChart: (chartId: string, request: unknown) => Promise<unknown>;
    copyChart: (chartId: string) => Promise<unknown>;
    deleteChart: (chartId: string) => Promise<unknown>;
  };
};

describe('preferencesService error sanitization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCharts throws a stable message and keeps the backend diagnostic as a non-enumerable cause', async () => {
    const backendDiagnostic = 'Backend exploded at line 42';
    mockGet.mockResolvedValueOnce({
      status: 400,
      data: {
        success: false,
        message: backendDiagnostic,
      },
    });

    let thrown: (Error & { cause?: unknown }) | undefined;
    try {
      await preferencesService.getCharts('group-1');
    } catch (err) {
      thrown = err as Error & { cause?: unknown };
    }

    expect(thrown).toBeDefined();
    // Stable message — never the backend text.
    expect(thrown?.message).toBe('Failed to load chart configurations');
    expect(thrown?.message).not.toContain(backendDiagnostic);

    // The backend diagnostic is preserved on the non-enumerable cause.
    const cause = thrown?.cause as { diagnostic?: string } | undefined;
    expect(cause?.diagnostic).toBe(backendDiagnostic);
    expect(Object.getOwnPropertyDescriptor(thrown, 'cause')?.enumerable).toBe(
      false
    );
  });

  it('getCharts surfaces a stable message on a raw axios error', async () => {
    const rawAxiosError = new Error('timeout of 30000ms exceeded');
    (rawAxiosError as { isAxiosError?: boolean }).isAxiosError = true;
    (rawAxiosError as { code?: string }).code = 'ECONNABORTED';
    mockGet.mockRejectedValueOnce(rawAxiosError);

    let thrown: (Error & { cause?: unknown }) | undefined;
    try {
      await preferencesService.getCharts('group-1');
    } catch (err) {
      thrown = err as Error & { cause?: unknown };
    }

    expect(thrown).toBeDefined();
    expect(thrown?.message).toBe('Failed to load chart configurations');
    expect(thrown?.message).not.toContain('timeout of 30000ms exceeded');
    expect(thrown?.cause).toBe(rawAxiosError);
    expect(Object.getOwnPropertyDescriptor(thrown, 'cause')?.enumerable).toBe(
      false
    );
  });

  it('createChart throws a stable message and not the backend text', async () => {
    const backendDiagnostic = 'Chart title violates rule X7';
    mockPost.mockResolvedValueOnce({
      status: 422,
      data: {
        success: false,
        message: backendDiagnostic,
      },
    });

    let thrown: (Error & { cause?: unknown }) | undefined;
    try {
      await preferencesService.createChart({
        title: 'x',
        chartConfig: { chartType: 'Line' },
      });
    } catch (err) {
      thrown = err as Error & { cause?: unknown };
    }

    expect(thrown).toBeDefined();
    expect(thrown?.message).toBe('Failed to create chart configuration');
    expect(thrown?.message).not.toContain(backendDiagnostic);
    expect(Object.getOwnPropertyDescriptor(thrown, 'cause')?.enumerable).toBe(
      false
    );
  });

  it('updateChart throws a stable message and not the backend text', async () => {
    const backendDiagnostic = 'Unexpected field: chartType';
    mockPut.mockResolvedValueOnce({
      status: 400,
      data: {
        success: false,
        message: backendDiagnostic,
      },
    });

    let thrown: (Error & { cause?: unknown }) | undefined;
    try {
      await preferencesService.updateChart('chart-1', { title: 'y' });
    } catch (err) {
      thrown = err as Error & { cause?: unknown };
    }

    expect(thrown).toBeDefined();
    expect(thrown?.message).toBe('Failed to update chart configuration');
    expect(thrown?.message).not.toContain(backendDiagnostic);
    expect(Object.getOwnPropertyDescriptor(thrown, 'cause')?.enumerable).toBe(
      false
    );
  });

  it('copyChart throws a stable message and not the backend text', async () => {
    const backendDiagnostic = 'Source chart missing';
    mockPost.mockResolvedValueOnce({
      status: 404,
      data: {
        success: false,
        message: backendDiagnostic,
      },
    });

    let thrown: (Error & { cause?: unknown }) | undefined;
    try {
      await preferencesService.copyChart('chart-1');
    } catch (err) {
      thrown = err as Error & { cause?: unknown };
    }

    expect(thrown).toBeDefined();
    expect(thrown?.message).toBe('Failed to copy chart configuration');
    expect(thrown?.message).not.toContain(backendDiagnostic);
    expect(Object.getOwnPropertyDescriptor(thrown, 'cause')?.enumerable).toBe(
      false
    );
  });

  it('deleteChart throws a stable message and not the backend text', async () => {
    const backendDiagnostic = 'Chart locked by another operation';
    mockDelete.mockResolvedValueOnce({
      status: 409,
      data: {
        success: false,
        message: backendDiagnostic,
      },
    });

    let thrown: (Error & { cause?: unknown }) | undefined;
    try {
      await preferencesService.deleteChart('chart-1');
    } catch (err) {
      thrown = err as Error & { cause?: unknown };
    }

    expect(thrown).toBeDefined();
    expect(thrown?.message).toBe('Failed to delete chart configuration');
    expect(thrown?.message).not.toContain(backendDiagnostic);
    expect(Object.getOwnPropertyDescriptor(thrown, 'cause')?.enumerable).toBe(
      false
    );
  });
});
