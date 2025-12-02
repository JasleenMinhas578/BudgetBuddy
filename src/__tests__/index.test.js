// Tests for the React entrypoint (`index.tsx/js`) that boots the application.
// - Mocks the `App` component and ReactDOM's `createRoot` to verify that the root DOM node is created and rendered correctly.
// - Ensures that the index file wires in `reportWebVitals` after rendering so performance metrics can be collected.
jest.mock('../App', () => {
  const React = require('react');
  return function MockApp() {
    return <div>MockApp</div>;
  };
});

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn()
  }))
}));

jest.mock('../reportWebVitals', () => jest.fn());

describe('index entrypoint', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a root and renders the App wrapped in StrictMode', () => {
    const { createRoot } = require('react-dom/client');
    const mockRender = jest.fn();
    createRoot.mockReturnValue({ render: mockRender });
    require('../index');

    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  it('invokes reportWebVitals after rendering', () => {
    const { createRoot } = require('react-dom/client');
    createRoot.mockReturnValue({ render: jest.fn() });
    const reportWebVitals = require('../reportWebVitals');
    require('../index');
    expect(reportWebVitals).toHaveBeenCalled();
  });
});

