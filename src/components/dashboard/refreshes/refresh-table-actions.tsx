import { MetaAllocatorSignTransactionButton } from '@/components/refresh/MetaAllocatorSignTransactionButton';
import { RkhApproveTransactionButton } from '@/components/refresh/RkhApproveTransactionButton';
import { RkhSignTransactionButton } from '@/components/refresh/RkhSignTransactionButton';
import { createFilfoxMessageUrl } from '@/lib/factories/create-filfox-message-url';
import { Refresh } from '@/types/refresh';
import { Row } from '@tanstack/react-table';
import { Link } from '@/components/ui/link';
import { useAccount } from '@/hooks';
import {
  isAllocated,
  isGovernanceTeamRole,
  isMetaAllocatorRole,
  isRkhRole,
  isWaitingForGovernanceReview,
  isWaitingForMAApprove,
  isWaitingForRkhApprove,
  isWaitingForRkhSign,
} from './table.utils';

import { RefreshGovernanceReviewButton } from '@/components/governance-review/RefreshGovernanceReviewButton';

export const RefreshTableActions = ({ row }: { row: Row<Refresh> }) => {
  const { account } = useAccount();

  switch (true) {
    case isGovernanceTeamRole(account?.role) && isWaitingForGovernanceReview(row):
      return <RefreshGovernanceReviewButton refresh={row.original} />;
    case isRkhRole(account?.role) && isWaitingForRkhSign(row):
      return (
        <RkhSignTransactionButton
          dataCap={row.original.dataCap}
          address={row.original.msigAddress}
        />
      );

    case isRkhRole(account?.role) && isWaitingForRkhApprove(row):
      return (
        <RkhApproveTransactionButton
          address={row.original.msigAddress}
          transactionId={row.original.rkhPhase?.messageId!}
          datacap={row.original.dataCap}
          fromAccount={row.original.rkhPhase?.approvals?.at(0) as string}
        />
      );
    case isMetaAllocatorRole(account?.role) && isWaitingForMAApprove(row):
      return (
        <MetaAllocatorSignTransactionButton
          dataCap={row.original.dataCap}
          address={row.original.msigAddress}
          maAddress={row.original.maAddress}
          metapathwayType={row.original.metapathwayType!}
        />
      );
    case isAllocated(row):
      return (
        <Link
          className="w-[150px]"
          variant="filled"
          href={createFilfoxMessageUrl(row.original.transactionCid!)}
          target="_blank"
        >
          View on Filfox
        </Link>
      );
    default:
      return null;
  }
};
