import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MetamaskConnectionScreen } from './MetamaskConnectionScreen';
import { MetaAllocator } from '@/types/ma';
import { AccountRole } from '@/types/account';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockOnConnect: vi.fn(),
  mockConnect: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useAccount: mocks.mockUseAccount,
}));

describe('MetamaskConnectionScreen', () => {
  const fixtureMetaAllocator: MetaAllocator = {
    name: 'Test Meta Allocator',
    signers: ['0x123'],
    ethAddress: '0x1234567890123456789012345678901234567890',
    ethSafeAddress: '0x0987654321098765432109876543210987654321',
    filAddress: 'f1test123456789012345678901234567890123456',
    filSafeAddress: 'f2test0987654321098765432109876543210987654321',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      account: null,
      connect: mocks.mockConnect,
    });
  });

  it('should show loading state initially', () => {
    render(<MetamaskConnectionScreen onConnect={mocks.mockOnConnect} />);

    expect(screen.getByText('Connecting to MetaMask...')).toBeInTheDocument();
  });

  it('should call connect with correct parameters when no account exists', () => {
    render(<MetamaskConnectionScreen onConnect={mocks.mockOnConnect} />);

    expect(mocks.mockConnect).toHaveBeenCalledWith('metamask', 0, undefined);
    expect(mocks.mockConnect).toHaveBeenCalledTimes(1);
  });

  it('should call connect with meta allocator when provided', () => {
    render(
      <MetamaskConnectionScreen
        onConnect={mocks.mockOnConnect}
        metaAllocator={fixtureMetaAllocator}
      />,
    );

    expect(mocks.mockConnect).toHaveBeenCalledWith('metamask', 0, fixtureMetaAllocator);
    expect(mocks.mockConnect).toHaveBeenCalledTimes(1);
  });

  it('should call onConnect when account exists', () => {
    mocks.mockUseAccount.mockReturnValue({
      account: {
        address: '0x123',
        isConnected: true,
        role: AccountRole.METADATA_ALLOCATOR,
        wallet: { type: 'metamask' },
        index: 0,
      },
      connect: mocks.mockConnect,
    });

    render(<MetamaskConnectionScreen onConnect={mocks.mockOnConnect} />);

    expect(mocks.mockOnConnect).toHaveBeenCalledTimes(1);
  });

  it('should not call connect when account already exists', () => {
    mocks.mockUseAccount.mockReturnValue({
      account: {
        address: '0x123',
        isConnected: true,
        role: AccountRole.METADATA_ALLOCATOR,
        wallet: { type: 'metamask' },
        index: 0,
      },
      connect: mocks.mockConnect,
    });

    render(<MetamaskConnectionScreen onConnect={mocks.mockOnConnect} />);

    expect(mocks.mockConnect).not.toHaveBeenCalled();
  });
});
