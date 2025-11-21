describe('reportWebVitals', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('loads web-vitals and wires metrics when callback is a function', async () => {
    const module = await import('../reportWebVitals');
    const mockVitals = {
      getCLS: jest.fn(),
      getFID: jest.fn(),
      getFCP: jest.fn(),
      getLCP: jest.fn(),
      getTTFB: jest.fn()
    };
    jest.spyOn(module, 'loadWebVitals').mockResolvedValue(mockVitals);
    const reportWebVitals = module.default;
    const callback = jest.fn();

    await reportWebVitals(callback, module.loadWebVitals);

    expect(mockVitals.getCLS).toHaveBeenCalledWith(callback);
    expect(mockVitals.getFID).toHaveBeenCalledWith(callback);
    expect(mockVitals.getFCP).toHaveBeenCalledWith(callback);
    expect(mockVitals.getLCP).toHaveBeenCalledWith(callback);
    expect(mockVitals.getTTFB).toHaveBeenCalledWith(callback);
  });

  it('does nothing when callback is not a function', async () => {
    const module = await import('../reportWebVitals');
    const mockVitals = {
      getCLS: jest.fn()
    };
    jest.spyOn(module, 'loadWebVitals').mockResolvedValue(mockVitals);
    const reportWebVitals = module.default;

    await reportWebVitals(undefined, module.loadWebVitals);

    expect(mockVitals.getCLS).not.toHaveBeenCalled();
  });

  it('loadWebVitals resolves the mocked web-vitals module', async () => {
    jest.resetModules();
    const mockModule = {
      getCLS: jest.fn(),
      getFID: jest.fn(),
      getFCP: jest.fn(),
      getLCP: jest.fn(),
      getTTFB: jest.fn()
    };

    jest.doMock(
      'web-vitals',
      () => ({
        __esModule: true,
        ...mockModule
      }),
      { virtual: true }
    );
    const module = await import('../reportWebVitals');
    const result = await module.loadWebVitals();
    expect(result.getCLS).toBe(mockModule.getCLS);
    expect(result.getFID).toBe(mockModule.getFID);
    expect(result.getFCP).toBe(mockModule.getFCP);
    expect(result.getLCP).toBe(mockModule.getLCP);
    expect(result.getTTFB).toBe(mockModule.getTTFB);
  });

  it('uses the default loader when one is not provided', async () => {
    jest.resetModules();
    const mockVitals = {
      getCLS: jest.fn(),
      getFID: jest.fn(),
      getFCP: jest.fn(),
      getLCP: jest.fn(),
      getTTFB: jest.fn()
    };

    jest.doMock(
      'web-vitals',
      () => ({
        __esModule: true,
        ...mockVitals
      }),
      { virtual: true }
    );
    const module = await import('../reportWebVitals');
    const callback = jest.fn();

    await module.default(callback);

    expect(mockVitals.getCLS).toHaveBeenCalledWith(callback);
  });
});

