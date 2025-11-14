import { SignatureType } from '@/types/governance-review';
import { SignStateMessageMethodFactory } from './sign-state-message-factory';

describe('SignStateMessageMethodFactory', () => {
  const props = {
    result: 'Approved',
    id: '123',
    finalDataCap: 1024,
    allocatorType: 'RKH',
  };

  it.each`
    signatureType                            | expectedMessage
    ${SignatureType.RefreshReview}           | ${'Governance refresh Approved 123 1024 RKH'}
    ${SignatureType.ApproveGovernanceReview} | ${'Governance Approved 123 1024 RKH'}
    ${SignatureType.KycOverride}             | ${'KYC Override for 123'}
    ${SignatureType.KycRevoke}               | ${'KYC Revoke for 123'}
    ${SignatureType.MetaAllocatorReject}     | ${'Meta Allocator reject 123 RKH'}
  `('returns the correct message for $signatureType', ({ signatureType, expectedMessage }) => {
    const messageFactory = SignStateMessageMethodFactory.create(signatureType);
    expect(messageFactory(props)).toBe(expectedMessage);
  });
});
