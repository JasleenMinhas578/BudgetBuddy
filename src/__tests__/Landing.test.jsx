// Snapshot-style rendering tests for the marketing `Landing` page.
// - Mocks framer-motion to avoid animation side effects while checking static content.
// - Verifies the main hero text, call-to-action links, and key supporting copy render correctly with expected routes.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../pages/Landing';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }) => <div {...rest}>{children}</div>
  }
}));

describe('Landing page', () => {
  it('renders hero content and navigation links', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(
      screen.getByText((content, node) => node.textContent === 'Master Your Financial Future')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start Your Journey/i })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute('href', '/login');
    expect(screen.getByText(/Why Choose BudgetBuddy/)).toBeInTheDocument();
  });
});

