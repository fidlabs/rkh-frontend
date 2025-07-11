import { env } from '@/config/environment';

export function createAllocatorRegistryUrl(jsonNumber: string): string {
  return `https://github.com/${env.githubOwner}/Allocator-Registry/blob/main/Allocators/${jsonNumber}.json`;
}
