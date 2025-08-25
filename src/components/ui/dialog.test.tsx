import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DialogErrorCard, DialogLoadingCard, DialogSuccessCard } from './dialog';

describe('DialogErrorCard', () => {
  const mockProps = {
    errorMessage: 'error message',
    onGoBack: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error message', () => {
    render(<DialogErrorCard {...mockProps} />);

    expect(screen.getByTestId('error-header')).toHaveTextContent('Error');
    expect(screen.getByTestId('error-message')).toHaveTextContent(mockProps.errorMessage);
  });

  it('should render both action buttons', () => {
    render(<DialogErrorCard {...mockProps} />);

    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should call onGoBack when Go back button is clicked', async () => {
    const user = userEvent.setup();
    render(<DialogErrorCard {...mockProps} />);

    const goBackButton = screen.getByRole('button', { name: /go back/i });
    await user.click(goBackButton);

    expect(mockProps.onGoBack).toHaveBeenCalledTimes(1);
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });

  it('should call onClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    render(<DialogErrorCard {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    expect(mockProps.onGoBack).not.toHaveBeenCalled();
  });
});

describe('DialogLoadingCard', () => {
  it('should render loading content with default message', () => {
    render(<DialogLoadingCard />);

    expect(screen.getByTestId('loading-message')).toHaveTextContent('Loading...');
  });

  it('should render loading content with custom message', () => {
    render(<DialogLoadingCard loadingMessage="custom loading message" />);

    expect(screen.getByTestId('loading-message')).toHaveTextContent('custom loading message');
  });
});

describe('dialog success card', () => {
  it('should render success content with default message', () => {
    const mockOnClose = vi.fn();
    render(<DialogSuccessCard onClose={mockOnClose}>test</DialogSuccessCard>);

    expect(screen.getByTestId('success-header')).toHaveTextContent('Success');
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});
