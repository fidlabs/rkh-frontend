import { SignatureType } from '@/types/governance-review';

interface MessageFactoryProps {
  result: string;
  id: string;
  finalDataCap: number;
  allocatorType: string;
}

type MessageFactory = (props: MessageFactoryProps) => string;

export class SignStateMessageMethodFactory {
  static create(type: SignatureType): MessageFactory {
    return {
      [SignatureType.RefreshReview]: ({
        result,
        id,
        finalDataCap,
        allocatorType,
      }: MessageFactoryProps) =>
        `Governance refresh ${result} ${id} ${finalDataCap} ${allocatorType}`,
      [SignatureType.ApproveGovernanceReview]: ({
        result,
        id,
        finalDataCap,
        allocatorType,
      }: MessageFactoryProps) => `Governance ${result} ${id} ${finalDataCap} ${allocatorType}`,
      [SignatureType.KycOverride]: ({ id }: MessageFactoryProps) => `KYC Override for ${id}`,
      [SignatureType.KycRevoke]: ({ id }: MessageFactoryProps) => `KYC Revoke for ${id}`,
      [SignatureType.MetaAllocatorReject]: ({ id, allocatorType }: MessageFactoryProps) =>
        `Meta Allocator reject ${id} ${allocatorType}`,
    }[type];
  }
}
