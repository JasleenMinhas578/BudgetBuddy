import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from '../components/UI/Toast';

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <div>{children}</div>,
  motion: {
    div: ({ children, ...rest }) => (
      <div {...rest} data-motion="div">
        {children}
      </div>
    )
  }
}));

describe('Toast component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders message with icon when visible', () => {
    render(
      <Toast
        message="Success!"
        type="success"
        isVisible
        onClose={jest.fn()}
        duration={0}
      />
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('auto dismisses after the specified duration', () => {
    const onClose = jest.fn();
    render(
      <Toast
        message="Auto dismiss"
        type="info"
        isVisible
        onClose={onClose}
        duration={1000}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when toast body is clicked', () => {
    const onClose = jest.fn();
    render(
      <Toast
        message="Clickable"
        type="warning"
        isVisible
        onClose={onClose}
        duration={0}
      />
    );

    fireEvent.click(screen.getByText('Clickable'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stops propagation and closes when close button is pressed', () => {
    const onClose = jest.fn();
    render(
      <Toast
        message="Close me"
        type="error"
        isVisible
        onClose={onClose}
        duration={0}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when not visible', () => {
    render(
      <Toast
        message="Hidden"
        type="info"
        isVisible={false}
        onClose={jest.fn()}
        duration={0}
      />
    );

    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('uses default props when optional values are omitted', () => {
    const onClose = jest.fn();
    render(
      <Toast
        message="Defaults"
        isVisible
        onClose={onClose}
      />
    );

    expect(screen.getByText('Defaults')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(onClose).toHaveBeenCalled();
  });
});

