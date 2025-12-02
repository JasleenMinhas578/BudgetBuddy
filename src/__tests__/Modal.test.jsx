// Unit tests for the reusable `Modal` UI component.
// - Verifies conditional rendering behavior when the modal is closed vs open.
// - Checks that title-based and default aria labels are applied for accessibility.
// - Ensures `onClose` is called appropriately via the close button and not triggered when clicking inside the dialog body.
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../components/UI/Modal';

describe('Modal component', () => {
  it('returns null when closed', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Hidden">
        <p>Hidden content</p>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title and children when open', () => {
    render(
      <Modal isOpen onClose={jest.fn()} title="My Modal">
        <p>Visible content</p>
      </Modal>
    );

    expect(screen.getByRole('dialog', { name: /my modal/i })).toBeInTheDocument();
    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('falls back to default aria label when no title or ariaLabel provided', () => {
    render(
      <Modal isOpen onClose={jest.fn()}>
        <p>Plain modal body</p>
      </Modal>
    );

    expect(screen.getByRole('dialog', { name: /modal dialog/i })).toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen onClose={handleClose} ariaLabel="Close me">
        <p>Visible content</p>
      </Modal>
    );

    // Verify modal is rendered
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('prevents overlay close when clicking modal content', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen onClose={handleClose} ariaLabel="Content modal">
        <p>Visible content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('fires onClose when close button is pressed', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen onClose={handleClose} title="Closable modal">
        <p>Visible content</p>
      </Modal>
    );

    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

