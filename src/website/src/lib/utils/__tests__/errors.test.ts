import { ApiError } from '../errors';

describe('ApiError', () => {
  it('creates an error with message and status', () => {
    const error = new ApiError('Not Found', 404);
    expect(error.message).toBe('Not Found');
    expect(error.status).toBe(404);
  });

  it('has correct name property', () => {
    const error = new ApiError('Bad Request', 400);
    expect(error.name).toBe('ApiError');
  });

  it('is an instance of Error', () => {
    const error = new ApiError('Server Error', 500);
    expect(error).toBeInstanceOf(Error);
  });

  it('is an instance of ApiError', () => {
    const error = new ApiError('Error', 500);
    expect(error).toBeInstanceOf(ApiError);
  });

  it('accepts optional data parameter', () => {
    const data = { field: 'email', reason: 'invalid' };
    const error = new ApiError('Validation Error', 422, data);
    expect(error.data).toEqual(data);
  });

  it('has undefined data when not provided', () => {
    const error = new ApiError('Error', 500);
    expect(error.data).toBeUndefined();
  });

  it('has a stack trace', () => {
    const error = new ApiError('Error', 500);
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ApiError');
  });

  it('accepts any type for data', () => {
    const stringData = new ApiError('Error', 500, 'string data');
    expect(stringData.data).toBe('string data');

    const arrayData = new ApiError('Error', 500, [1, 2, 3]);
    expect(arrayData.data).toEqual([1, 2, 3]);

    const numberData = new ApiError('Error', 500, 42);
    expect(numberData.data).toBe(42);
  });
});
