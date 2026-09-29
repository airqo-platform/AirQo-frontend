export {};

// jsdom's Blob lacks the newer `.text()` method used by the PDF error path.
// Polyfill it via FileReader so blob decoding can be tested.
if (typeof Blob.prototype.text !== 'function') {
  Blob.prototype.text = function (this: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}

jest.mock('../apiClient', () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockPut = jest.fn();
  return {
    createAuthenticatedClient: () => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: jest.fn(),
    }),
    __mockGet: mockGet,
    __mockPost: mockPost,
    __mockPut: mockPut,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn(),
}));

const {
  __mockGet: mockGet,
  __mockPost: mockPost,
  __mockPut: mockPut,
} = jest.requireMock('../apiClient') as {
  __mockGet: jest.Mock;
  __mockPost: jest.Mock;
  __mockPut: jest.Mock;
};

const { billingService, normalizeSummaryBuckets } = jest.requireActual(
  '../billingService'
) as {
  billingService: {
    listInvoices: (
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    createInvoice: (payload: Record<string, unknown>) => Promise<unknown>;
    recordPayment: (
      invoiceId: string,
      payload: Record<string, unknown>
    ) => Promise<unknown>;
    getInvoicePdf: (
      id: string,
      opts?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<Blob>;
    getReceiptPdf: (
      id: string,
      opts?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<Blob>;
    updateSettings: (
      payload: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    finalizeInvoice: (
      id: string,
      opts?: Record<string, unknown>
    ) => Promise<unknown>;
    markInvoiceSent: (
      id: string,
      opts?: Record<string, unknown>
    ) => Promise<unknown>;
    voidInvoice: (
      id: string,
      opts?: Record<string, unknown>
    ) => Promise<unknown>;
    convertInvoice: (id: string) => Promise<unknown>;
    voidPayment: (
      id: string,
      opts?: Record<string, unknown>
    ) => Promise<unknown>;
  };
  normalizeSummaryBuckets: (summary: unknown) => unknown[];
};

const makeInvoiceRow = (overrides: Record<string, unknown> = {}) => ({
  _id: 'inv_1',
  number: 'INV-001',
  status: 'draft',
  currency: 'USD',
  total: 100,
  amount_due: 100,
  amount_paid: 0,
  ...overrides,
});

describe('BillingService.listInvoices', () => {
  beforeEach(() => jest.clearAllMocks());

  it('builds the path, joins status with commas, passes skip/limit, normalizes envelope and ids', async () => {
    const rows = [
      makeInvoiceRow(),
      makeInvoiceRow({ _id: 'inv_2', number: 'INV-002' }),
    ];
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: { items: rows, meta: { total: 2, limit: 25, skip: 0 } },
      },
    });

    const controller = new AbortController();
    const result = await billingService.listInvoices(
      { status: ['draft', 'open'], skip: 0, limit: 25 },
      controller.signal
    );

    expect(mockGet).toHaveBeenCalledTimes(1);
    const [path, config] = mockGet.mock.calls[0] as [
      string,
      { signal: AbortSignal },
    ];
    expect(path).toMatch(/^\/users\/billing\/invoices\?/);
    expect(path).toContain('status=draft%2Copen');
    expect(path).toContain('skip=0');
    expect(path).toContain('limit=25');
    expect(config).toEqual({ signal: controller.signal });
    const r = result as {
      items: Array<{ id: string; number: string; status: string }>;
      meta: { total: number };
    };
    expect(r.items).toHaveLength(2);
    expect(r.items[0].id).toBe('inv_1');
    expect(r.items[0].number).toBe('INV-001');
    expect(r.items[0].status).toBe('draft');
    expect(r.meta.total).toBe(2);
  });
});

describe('BillingService.createInvoice', () => {
  beforeEach(() => jest.clearAllMocks());

  it('posts the doc-shaped body (subject/reference/payment_terms_days/terms array)', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'created',
        data: { _id: 'inv_9', status: 'draft' },
      },
    });

    const payload = {
      customer_id: 'cust_1',
      subject: 'Device sale',
      reference: 'PO-123',
      payment_terms_days: 30,
      terms: ['Net 30', 'Late fee applies'],
      line_items: [{ item: 'PM Sensor', quantity: 1, unit_price: 200 }],
    };
    const result = await billingService.createInvoice(payload);

    expect(mockPost).toHaveBeenCalledWith('/users/billing/invoices', payload);
    const r = result as { id: string };
    expect(r.id).toBe('inv_9');
  });
});

describe('BillingService.recordPayment', () => {
  beforeEach(() => jest.clearAllMocks());

  it('posts to the invoice payments sub-path', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'recorded',
        data: { _id: 'pay_1', amount: 50, currency: 'USD' },
      },
    });

    const result = await billingService.recordPayment('inv_1', {
      amount: 50,
      method: 'cash',
    });

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      '/users/billing/invoices/inv_1/payments',
      { amount: 50, method: 'cash' }
    );
    const r = result as { id: string; amount: number };
    expect(r.id).toBe('pay_1');
    expect(r.amount).toBe(50);
  });
});

describe('BillingService error extraction', () => {
  beforeEach(() => jest.clearAllMocks());

  it('extracts the message from errors.message on a 409', async () => {
    mockGet.mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          success: false,
          message: 'Conflict',
          errors: { message: 'Invoice number already exists' },
        },
      },
    });

    await expect(billingService.listInvoices()).rejects.toThrow(
      'Invoice number already exists'
    );
  });

  it('extracts the first field message when errors.message is an array', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        status: 422,
        data: {
          success: false,
          message: 'Validation failed',
          errors: {
            message: [{ param: 'amount', message: 'Amount must be positive' }],
          },
        },
      },
    });

    await expect(
      billingService.recordPayment('inv_1', { amount: -5 })
    ).rejects.toThrow('Amount must be positive');
  });

  it('surfaces the server message when the AxiosError itself is an Error instance (regression)', async () => {
    // AxiosErrors ARE instanceof Error, so a naive `if (error instanceof Error)`
    // check would swallow the server message. Verify the response.data branch
    // is checked FIRST.
    const serverError = Object.assign(
      new Error('Request failed with status code 409'),
      {
        response: {
          status: 409,
          data: {
            success: false,
            message: '',
            errors: { message: 'Number in use' },
          },
        },
      }
    );
    mockPost.mockRejectedValueOnce(serverError);

    await expect(
      billingService.recordPayment('inv_1', { amount: 50 })
    ).rejects.toThrow('Number in use');
  });
});

describe('BillingService blob PDF error decoding', () => {
  beforeEach(() => jest.clearAllMocks());

  it('decodes a JSON error from a Blob response', async () => {
    const errorJson = JSON.stringify({
      success: false,
      message: 'PDF unavailable',
      errors: { message: 'Invoice has not been finalized' },
    });
    const blob = new Blob([errorJson], { type: 'application/json' });
    mockGet.mockRejectedValueOnce({
      response: { status: 400, data: blob },
    });

    await expect(billingService.getInvoicePdf('inv_1')).rejects.toThrow(
      'Invoice has not been finalized'
    );
  });

  it('returns the fallback message when the error blob is non-JSON (regression)', async () => {
    const blob = new Blob(['not json at all'], { type: 'text/plain' });
    mockGet.mockRejectedValueOnce({
      response: { status: 500, data: blob },
    });

    await expect(billingService.getReceiptPdf('pay_1')).rejects.toThrow(
      'Failed to load receipt'
    );
    await expect(billingService.getReceiptPdf('pay_1')).rejects.not.toThrow(
      /SyntaxError|Unexpected token/i
    );
  });
});

describe('normalizeSummaryBuckets', () => {
  it('handles a flat array of buckets', () => {
    expect(
      normalizeSummaryBuckets([
        { currency: 'USD', outstanding_amount: 100 },
        { currency: 'KES', outstanding_amount: 200 },
      ])
    ).toEqual([
      { currency: 'USD', outstanding_amount: 100 },
      { currency: 'KES', outstanding_amount: 200 },
    ]);
  });

  it('handles a currency-keyed map, injecting the currency key', () => {
    const result = normalizeSummaryBuckets({
      USD: { invoiced_amount: 100 },
      KES: { collected_amount: 200 },
    }) as Array<{ currency: string; invoiced_amount?: number }>;
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { currency: 'USD', invoiced_amount: 100 },
        { currency: 'KES', collected_amount: 200 },
      ])
    );
  });

  it('handles the { currencies: [...] } shape', () => {
    const result = normalizeSummaryBuckets({
      currencies: [{ currency: 'USD', overdue_count: 2 }],
    }) as Array<{ currency: string; overdue_count: number }>;
    expect(result).toEqual([{ currency: 'USD', overdue_count: 2 }]);
  });

  it('skips non-object entries', () => {
    const result = normalizeSummaryBuckets([
      { currency: 'USD' },
      null,
      42,
    ]) as Array<{ currency: string }>;
    expect(result).toEqual([{ currency: 'USD' }]);
  });
});

describe('BillingService.updateSettings', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends the doc-shaped settings body (catalog array, sequence_starts, reminder arrays)', async () => {
    mockPut.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'updated',
        data: {
          catalog: [{ item: 'Sensor', unit_price: 200, currency: 'USD' }],
          sequence_starts: { invoice: 1000, receipt: 500 },
          reminder_days_before_due: [7, 3],
          reminder_days_after_due: [1, 7, 14],
          number_prefix: 'INV-',
          default_payment_terms_days: 30,
          default_terms: ['Net 30'],
        },
      },
    });

    const payload = {
      catalog: [{ item: 'Sensor', unit_price: 200, currency: 'USD' }],
      sequence_starts: { invoice: 1000, receipt: 500 },
      reminder_days_before_due: [7, 3],
      reminder_days_after_due: [1, 7, 14],
      number_prefix: 'INV-',
      default_payment_terms_days: 30,
      default_terms: ['Net 30'],
    };
    const controller = new AbortController();
    const result = await billingService.updateSettings(
      payload,
      controller.signal
    );

    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(mockPut).toHaveBeenCalledWith('/users/billing/settings', payload, {
      signal: controller.signal,
    });
    const r = result as {
      catalog: Array<{ unit_price: number }>;
      sequence_starts: { invoice: number };
      reminder_days_before_due: number[];
    };
    expect(r.catalog[0].unit_price).toBe(200);
    expect(r.sequence_starts.invoice).toBe(1000);
    expect(r.reminder_days_before_due).toEqual([7, 3]);
  });
});

describe('BillingService invoice action return types', () => {
  beforeEach(() => jest.clearAllMocks());

  it('finalizeInvoice returns a normalized invoice', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: { _id: 'inv_1', status: 'open', number: 'INV-001' },
      },
    });
    const result = await billingService.finalizeInvoice('inv_1');
    const r = result as { id: string; status: string; number: string };
    expect(r.id).toBe('inv_1');
    expect(r.status).toBe('open');
    expect(r.number).toBe('INV-001');
  });

  it('markInvoiceSent returns a normalized invoice', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: { _id: 'inv_2', status: 'open' },
      },
    });
    const result = await billingService.markInvoiceSent('inv_2', {
      note: 'emailed',
    });
    const r = result as { id: string };
    expect(r.id).toBe('inv_2');
  });

  it('voidInvoice returns a normalized invoice', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: { _id: 'inv_3', status: 'void' },
      },
    });
    const result = await billingService.voidInvoice('inv_3', {
      reason: 'cancelled',
    });
    const r = result as { status: string };
    expect(r.status).toBe('void');
  });

  it('convertInvoice returns a normalized invoice', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: { _id: 'inv_4', status: 'open', kind: 'invoice' },
      },
    });
    const result = await billingService.convertInvoice('inv_4');
    const r = result as { kind: string };
    expect(r.kind).toBe('invoice');
  });

  it('voidPayment returns a normalized payment', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: { _id: 'pay_9', status: 'void' },
      },
    });
    const result = await billingService.voidPayment('pay_9', {
      reason: 'refunded',
    });
    const r = result as { id: string; status: string };
    expect(r.id).toBe('pay_9');
    expect(r.status).toBe('void');
  });
});
