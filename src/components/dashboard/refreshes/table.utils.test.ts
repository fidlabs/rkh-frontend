import { describe, expect, it } from 'vitest';
import { Row } from '@tanstack/react-table';
import { MetapathwayType, Refresh, RefreshStatus } from '@/types/refresh';
import {
  isWaitingForRkhSign,
  isWaitingForRkhApprove,
  isWaitingForMAApprove,
  isAllocated,
} from './table.utils';

describe('table.utils', () => {
  const createMockRow = (refresh: Partial<Refresh>): Row<Refresh> =>
    ({
      original: refresh as Refresh,
    }) as Row<Refresh>;

  describe('isWaitingForRkhSign', () => {
    it.each`
      refreshStatus                  | metapathwayType         | expected | description
      ${RefreshStatus.PENDING}       | ${MetapathwayType.RKH}  | ${true}  | ${'RKH pending refresh'}
      ${RefreshStatus.PENDING}       | ${MetapathwayType.MDMA} | ${false} | ${'non-RKH refresh'}
      ${RefreshStatus.SIGNED_BY_RKH} | ${MetapathwayType.RKH}  | ${false} | ${'non-pending RKH refresh'}
      ${RefreshStatus.PENDING}       | ${undefined}            | ${false} | ${'null metapathwayType'}
      ${undefined}                   | ${MetapathwayType.RKH}  | ${false} | ${'undefined refreshStatus'}
      ${undefined}                   | ${undefined}            | ${false} | ${'undefined statuses'}
    `(
      'should return $expected for $description',
      ({ refreshStatus, metapathwayType, expected }) => {
        const row = createMockRow({
          refreshStatus,
          metapathwayType,
        });

        expect(isWaitingForRkhSign(row)).toBe(expected);
      },
    );
  });

  describe('isWaitingForRkhApprove', () => {
    it.each`
      refreshStatus                  | metapathwayType         | rkhPhase                                                   | expected | description
      ${RefreshStatus.SIGNED_BY_RKH} | ${MetapathwayType.RKH}  | ${{ messageId: 1, approvals: ['approver1', 'approver2'] }} | ${true}  | ${'RKH signed refresh with approvals'}
      ${RefreshStatus.SIGNED_BY_RKH} | ${MetapathwayType.RKH}  | ${undefined}                                               | ${false} | ${'RKH signed refresh without rkhPhase'}
      ${RefreshStatus.SIGNED_BY_RKH} | ${MetapathwayType.RKH}  | ${{ messageId: 1, approvals: [] }}                         | ${false} | ${'RKH signed refresh without approvals'}
      ${RefreshStatus.SIGNED_BY_RKH} | ${MetapathwayType.MDMA} | ${{ messageId: 1, approvals: ['approver1'] }}              | ${false} | ${'unsupported data'}
      ${RefreshStatus.PENDING}       | ${MetapathwayType.RKH}  | ${{ messageId: 1, approvals: ['approver1'] }}              | ${false} | ${'non-signed RKH refresh'}
      ${undefined}                   | ${MetapathwayType.RKH}  | ${{ messageId: 1, approvals: ['approver1'] }}              | ${false} | ${'undefined refreshStatus'}
      ${RefreshStatus.PENDING}       | ${undefined}            | ${{ messageId: 1, approvals: ['approver1'] }}              | ${false} | ${'undefined metapathwayType'}
      ${undefined}                   | ${undefined}            | ${{ messageId: 1, approvals: ['approver1'] }}              | ${false} | ${'undefined stateses'}
    `(
      'should return $expected for $description',
      ({ refreshStatus, metapathwayType, rkhPhase, expected }) => {
        const row = createMockRow({
          refreshStatus,
          metapathwayType,
          rkhPhase,
        });

        expect(isWaitingForRkhApprove(row)).toBe(expected);
      },
    );
  });

  describe('isWaitingForMAApprove', () => {
    it.each`
      refreshStatus                 | metapathwayType         | expected | description
      ${RefreshStatus.PENDING}      | ${MetapathwayType.MDMA} | ${true}  | ${'MDMA pending refresh'}
      ${RefreshStatus.PENDING}      | ${MetapathwayType.RKH}  | ${false} | ${'non-MDMA refresh'}
      ${RefreshStatus.DC_ALLOCATED} | ${MetapathwayType.MDMA} | ${false} | ${'non-pending MDMA refresh'}
      ${RefreshStatus.PENDING}      | ${MetapathwayType.ORMA} | ${true}  | ${'ORMA pending refresh'}
      ${RefreshStatus.PENDING}      | ${MetapathwayType.AMA}  | ${true}  | ${'AMA pending refresh'}
      ${RefreshStatus.PENDING}      | ${undefined}            | ${false} | ${'undefined metapathwayType'}
      ${undefined}                  | ${MetapathwayType.MDMA} | ${false} | ${'undefined refreshStatus'}
      ${undefined}                  | ${undefined}            | ${false} | ${'undefined statuses'}
    `(
      'should return $expected for $description',
      ({ refreshStatus, metapathwayType, expected }) => {
        const row = createMockRow({
          refreshStatus,
          metapathwayType,
        });

        expect(isWaitingForMAApprove(row)).toBe(expected);
      },
    );
  });

  describe('isAllocated', () => {
    it.each`
      refreshStatus                 | transactionCid                                                      | expected | description
      ${RefreshStatus.DC_ALLOCATED} | ${'bafy2bzacedlmm2frqcvtqhr3rzrrvavxxyi5iqqgdmzkbcvjdvas7gdfa4knu'} | ${true}  | ${'DC_ALLOCATED refresh with transactionCid'}
      ${RefreshStatus.DC_ALLOCATED} | ${undefined}                                                        | ${false} | ${'DC_ALLOCATED refresh without transactionCid'}
      ${RefreshStatus.PENDING}      | ${'bafy2bzacedlmm2frqcvtqhr3rzrrvavxxyi5iqqgdmzkbcvjdvas7gdfa4knu'} | ${false} | ${'non-DC_ALLOCATED refresh with transactionCid'}
      ${RefreshStatus.PENDING}      | ${undefined}                                                        | ${false} | ${'non-DC_ALLOCATED refresh without transactionCid'}
      ${undefined}                  | ${'bafy2bzacedlmm2frqcvtqhr3rzrrvavxxyi5iqqgdmzkbcvjdvas7gdfa4knu'} | ${false} | ${'undefined refreshStatus'}
      ${undefined}                  | ${undefined}                                                        | ${false} | ${'undefined statuses'}
    `('should return $expected for $description', ({ refreshStatus, transactionCid, expected }) => {
      const row = createMockRow({
        refreshStatus,
        transactionCid,
      });

      expect(isAllocated(row)).toBe(expected);
    });
  });
});
