import { useDispatch, useSelector } from '../reduxHooks';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => 'dispatch-result'),
  useSelector: jest.fn((selector: unknown) => selector),
}));

jest.mock('@/store', () => ({}));

describe('reduxHooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports useDispatch', () => {
    expect(useDispatch).toBeDefined();
    expect(typeof useDispatch).toBe('function');
  });

  it('exports useSelector', () => {
    expect(useSelector).toBeDefined();
    expect(typeof useSelector).toBe('function');
  });

  it('useDispatch returns the react-redux useDispatch', () => {
    const dispatch = useDispatch();

    expect(dispatch).toBe('dispatch-result');
  });

  it('useSelector delegates to react-redux useSelector', () => {
    const selector = (state: unknown) => state;
    const result = useSelector(selector);

    expect(result).toBe(selector);
  });
});
