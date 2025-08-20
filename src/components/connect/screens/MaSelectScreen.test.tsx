import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MaSelectScreen } from './MaSelectScreen';
import { MetaAllocator } from '@/types/ma';

const mocks = vi.hoisted(() => ({
  mockUseMaAddresses: vi.fn(),
  mockOnMaSelect: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useMaAddresses: mocks.mockUseMaAddresses,
}));

describe('MaSelectScreen', () => {
  const mockMaAddresses: MetaAllocator[] = [
    {
      name: 'Test Meta Allocator 1',
      signers: ['0x123'],
      ethAddress: '0x1234567890123456789012345678901234567890',
      ethSafeAddress: '0x0987654321098765432109876543210987654321',
      filAddress: 'f1test123456789012345678901234567890123456',
      filSafeAddress: 'f2test0987654321098765432109876543210987654321',
    },
    {
      name: 'Test Meta Allocator 2',
      signers: ['0x456'],
      ethAddress: '0x4567890123456789012345678901234567890123',
      ethSafeAddress: '0x1234567890123456789012345678901234567890',
      filAddress: 'f1test456789012345678901234567890123456789',
      filSafeAddress: 'f2test1234567890123456789012345678901234567890',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseMaAddresses.mockReturnValue({
      data: mockMaAddresses,
      isLoading: false,
    });
  });

  it('should show loading state when fetching meta allocators', () => {
    mocks.mockUseMaAddresses.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<MaSelectScreen onMaSelect={mocks.mockOnMaSelect} />);

    expect(screen.getByText('Loading meta allocators...')).toBeInTheDocument();
  });

  it('should render meta allocator buttons when data is loaded', () => {
    render(<MaSelectScreen onMaSelect={mocks.mockOnMaSelect} />);

    expect(screen.getByRole('button', { name: 'Test Meta Allocator 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Meta Allocator 2' })).toBeInTheDocument();
    expect(screen.queryByText('Loading meta allocators...')).not.toBeInTheDocument();
  });

  it('should call onMaSelect with correct meta allocator when button is clicked', async () => {
    const user = userEvent.setup();

    render(<MaSelectScreen onMaSelect={mocks.mockOnMaSelect} />);

    const firstMaButton = screen.getByRole('button', { name: 'Test Meta Allocator 1' });
    await user.click(firstMaButton);

    expect(mocks.mockOnMaSelect).toHaveBeenCalledWith(mockMaAddresses[0]);
    expect(mocks.mockOnMaSelect).toHaveBeenCalledTimes(1);
  });

  it('should handle empty meta allocators list', () => {
    mocks.mockUseMaAddresses.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<MaSelectScreen onMaSelect={mocks.mockOnMaSelect} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Loading meta allocators...')).not.toBeInTheDocument();
  });
});
