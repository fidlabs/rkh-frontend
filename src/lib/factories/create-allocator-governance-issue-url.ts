import { env } from '@/config/environment';

export function createAllocatorGovernanceIssueUrl(issueNumber?: number): string {
  const parsedIssueNumber = issueNumber ? `/${issueNumber}` : '';

  return `https://github.com/${env.githubOwner}/Allocator-Governance/issues${parsedIssueNumber}`;
}
