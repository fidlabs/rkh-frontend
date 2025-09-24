import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Row } from '@tanstack/react-table';
import { Refresh, RefreshStatus, MetapathwayType } from '@/types/refresh';
import { AccountRole } from '@/types/account';
import { RefreshTableActions } from './refresh-table-actions';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockUseStateWaitMsg: vi.fn(),
  mockUseProposeRKHTransaction: vi.fn(),
  mockUseApproveRKHTransaction: vi.fn(),
  mockUseMetaAllocatorTransaction: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useAccount: mocks.mockUseAccount,
  useStateWaitMsg: mocks.mockUseStateWaitMsg.mockReturnValue({
    stateWaitMsg: '',
    checkTransactionState: vi.fn(),
  }),
  useProposeRKHTransaction: mocks.mockUseProposeRKHTransaction.mockReturnValue({
    proposeTransaction: vi.fn(),
    messageId: '',
  }),
  useApproveRKHTransaction: mocks.mockUseApproveRKHTransaction.mockReturnValue({
    approveTransaction: vi.fn(),
    messageId: '',
  }),
  useMetaAllocatorTransaction: mocks.mockUseMetaAllocatorTransaction.mockReturnValue({
    submitSafeTransaction: vi.fn(),
    txHash: '',
    blockNumber: '',
  }),
}));

describe('RefreshTableActions', () => {
  const createMockRow = (refresh: Partial<Refresh>): Row<Refresh> =>
    ({
      original: {
        githubIssueId: 1,
        title: 'Test Refresh',
        creator: { userId: 1, name: 'Test User' },
        assignees: null,
        labels: null,
        state: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        closedAt: null,
        jsonNumber: '1',
        refreshStatus: RefreshStatus.PENDING,
        dataCap: 100,
        msigAddress: 'f1testaddress',
        maAddress: '0xtestmaaddress' as `0x${string}`,
        ...refresh,
      } as Refresh,
    }) as Row<Refresh>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockUseAccount.mockReturnValue({
      account: null,
      selectedMetaAllocator: null,
    });
  });

  describe('when refresh is allocated', () => {
    it('should render Filfox link when refresh is allocated', () => {
      const row = createMockRow({
        refreshStatus: RefreshStatus.DC_ALLOCATED,
        transactionCid: 'bafy2bzacedlmm2frqcvtqhr3rzrrvavxxyi5iqqgdmzkbcvjdvas7gdfa4knu',
      });

      render(<RefreshTableActions row={row} />);

      const link = screen.getByRole('link', { name: /view on filfox/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute(
        'href',
        'https://filfox.info/en/message/bafy2bzacedlmm2frqcvtqhr3rzrrvavxxyi5iqqgdmzkbcvjdvas7gdfa4knu',
      );
    });
  });

  describe('when user is GOVERNANCE_TEAM', () => {
    beforeEach(() => {
      mocks.mockUseAccount.mockReturnValue({
        account: { role: AccountRole.GOVERNANCE_TEAM },
        selectedMetaAllocator: null,
      });
    });

    it('should render governance review button when waiting for governance review', () => {
      const row = createMockRow({
        refreshStatus: RefreshStatus.PENDING,
        metapathwayType: MetapathwayType.RKH,
      });
    });
  });

  describe('when user is ROOT_KEY_HOLDER', () => {
    beforeEach(() => {
      mocks.mockUseAccount.mockReturnValue({
        account: { role: AccountRole.ROOT_KEY_HOLDER },
        selectedMetaAllocator: null,
      });
    });

    it('should render RKH sign button when waiting for RKH sign', () => {
      const row = createMockRow({
        refreshStatus: RefreshStatus.APPROVED,
        metapathwayType: MetapathwayType.RKH,
        msigAddress: 'f1rkhaddress',
      });

      render(<RefreshTableActions row={row} />);

      expect(screen.getByRole('button', { name: /sign/i })).toBeInTheDocument();
    });

    it('should render RKH approve button when waiting for RKH approve', () => {
      const row = createMockRow({
        refreshStatus: RefreshStatus.SIGNED_BY_RKH,
        metapathwayType: MetapathwayType.RKH,
        msigAddress: 'f1rkhaddress',
        dataCap: 200,
        rkhPhase: {
          messageId: 123,
          approvals: ['approver1', 'approver2'],
        },
      });

      render(<RefreshTableActions row={row} />);

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    });

    it.each`
      refreshStatus                  | metapathwayType         | description
      ${RefreshStatus.PENDING}       | ${MetapathwayType.MDMA} | ${'not waiting for RKH actions'}
      ${RefreshStatus.SIGNED_BY_RKH} | ${MetapathwayType.MDMA} | ${'signed but wrong metapathway'}
      ${RefreshStatus.DC_ALLOCATED}  | ${MetapathwayType.RKH}  | ${'allocated RKH refresh'}
    `('should not render buttons when $description', ({ refreshStatus, metapathwayType }) => {
      const row = createMockRow({
        refreshStatus,
        metapathwayType,
      });

      const { container } = render(<RefreshTableActions row={row} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('when user is METADATA_ALLOCATOR', () => {
    beforeEach(() => {
      mocks.mockUseAccount.mockReturnValue({
        account: { role: AccountRole.METADATA_ALLOCATOR },
        selectedMetaAllocator: {
          ethAddress: '0xmaaddress',
        },
      });
    });

    it('should render MA approve button when waiting for MA approve', () => {
      const row = createMockRow({
        refreshStatus: RefreshStatus.APPROVED,
        metapathwayType: MetapathwayType.MDMA,
        msigAddress: 'f1maaddress',
        maAddress: '0xmaaddress' as `0x${string}`,
      });

      render(<RefreshTableActions row={row} />);

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    });

    it('should not render MA approve button when not the selected MA', () => {
      const row = createMockRow({
        refreshStatus: RefreshStatus.PENDING,
        metapathwayType: MetapathwayType.MDMA,
        msigAddress: 'f1maaddress',
        maAddress: '0xothermaaddress' as `0x${string}`,
      });

      const { container } = render(<RefreshTableActions row={row} />);

      expect(container.firstChild).toBeNull();
    });

    it.each`
      refreshStatus                  | metapathwayType         | description
      ${RefreshStatus.PENDING}       | ${MetapathwayType.RKH}  | ${'not waiting for MA approve'}
      ${RefreshStatus.SIGNED_BY_RKH} | ${MetapathwayType.MDMA} | ${'signed but not pending'}
      ${RefreshStatus.DC_ALLOCATED}  | ${MetapathwayType.MDMA} | ${'allocated MDMA refresh'}
    `('should not render button when $description', ({ refreshStatus, metapathwayType }) => {
      const row = createMockRow({
        refreshStatus,
        metapathwayType,
      });

      const { container } = render(<RefreshTableActions row={row} />);

      expect(container.firstChild).toBeNull();
    });
  });
});
