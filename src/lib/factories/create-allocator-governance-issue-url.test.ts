import { vi } from 'vitest';
import { createAllocatorGovernanceIssueUrl } from '@/lib/factories/create-allocator-governance-issue-url';

const mocks = vi.hoisted(() => ({
  testOwnerMock: 'test-owner',
}));

vi.mock('@/config/environment', () => ({
  env: {
    githubOwner: mocks.testOwnerMock,
  },
}));

describe('createAllocatorGovernanceIssueUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each`
    jsonNumber   | expected
    ${123}       | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Governance/issues/123`}
    ${0}         | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Governance/issues`}
    ${-123}      | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Governance/issues/-123`}
    ${undefined} | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Governance/issues`}
    ${null}      | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Governance/issues`}
  `('should create correct URL for jsonNumber: "$jsonNumber"', ({ jsonNumber, expected }) => {
    const result = createAllocatorGovernanceIssueUrl(jsonNumber);

    expect(result).toBe(expected);
  });
});
