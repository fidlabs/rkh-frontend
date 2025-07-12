import { env } from '@/config/environment';

export function createAllocatorRegistryJsonUrl(jsonNumber: string): string {
  const parsedJsonNumber = jsonNumber ? `/${jsonNumber}.json` : '';

  return `https://github.com/${env.githubOwner}/Allocator-Registry/blob/main/Allocators${parsedJsonNumber}`;
}
