import { MetaAllocatorSignTransactionButton } from '@/components/refresh/MetaAllocatorSignTransactionButton';
import { RkhApproveTransactionButton } from '@/components/refresh/RkhApproveTransactionButton';
import { RkhSignTransactionButton } from '@/components/refresh/RkhSignTransactionButton';
import { createFilfoxMessageUrl } from '@/lib/factories/create-filfox-message-url';
import { Refresh } from '@/types/refresh';
import { Row } from '@tanstack/react-table';
import { Link } from '@/components/ui/link';
import { AccountRole } from '@/types/account';
import { useAccount } from '@/hooks';
import {
  isAllocated,
  isWaitingForMAApprove,
  isWaitingForRkhApprove,
  isWaitingForRkhSign,
} from './table.utils';

export const RefreshTableActions = ({ row }: { row: Row<Refresh> }) => {
  const { account, selectedMetaAllocator } = useAccount();

  switch (true) {
    case isAllocated(row):
      return (
        <Link
          variant="filled"
          href={createFilfoxMessageUrl(row.original.transactionCid!)}
          target="_blank"
        >
          View on Filfox
        </Link>
      );
    case (account?.role === AccountRole.ROOT_KEY_HOLDER ||
      account?.role === AccountRole.INDIRECT_ROOT_KEY_HOLDER) &&
      isWaitingForRkhSign(row):
      return <RkhSignTransactionButton address={row.original.msigAddress} />;
    case (account?.role === AccountRole.ROOT_KEY_HOLDER ||
      account?.role === AccountRole.INDIRECT_ROOT_KEY_HOLDER) &&
      isWaitingForRkhApprove(row):
      return (
        <RkhApproveTransactionButton
          address={row.original.msigAddress}
          transactionId={row.original.rkhPhase?.messageId!}
          datacap={row.original.dataCap}
          fromAccount={row.original.rkhPhase?.approvals?.at(0) as string}
        />
      );
    case account?.role === AccountRole.METADATA_ALLOCATOR &&
      isWaitingForMAApprove(row) &&
      selectedMetaAllocator?.ethAddress === row.original.maAddress:
      return (
        <MetaAllocatorSignTransactionButton
          address={row.original.msigAddress}
          maAddress={row.original.maAddress}
        />
      );

    default:
      return null;
  }
};
