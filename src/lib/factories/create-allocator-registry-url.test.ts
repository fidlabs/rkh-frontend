import { vi } from 'vitest';
import { createAllocatorRegistryUrl } from '@/lib/factories/create-allocator-registry-url';

const mocks = vi.hoisted(() => ({
  testOwnerMock: 'test-owner',
}));

vi.mock('@/config/environment', () => ({
  env: {
    githubOwner: mocks.testOwnerMock,
  },
}));

describe('createAllocatorRegistryUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each`
    jsonNumber                    | expected
    ${'123'}                      | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/123.json`}
    ${'abc123'}                   | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/abc123.json`}
    ${''}                         | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/.json`}
    ${'test-123_abc'}             | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/test-123_abc.json`}
    ${'very-long-json-123456789'} | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/very-long-json-123456789.json`}
    ${'1.2.3'}                    | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/1.2.3.json`}
  `('should create correct URL for jsonNumber: "$jsonNumber"', ({ jsonNumber, expected }) => {
    const result = createAllocatorRegistryUrl(jsonNumber);

    expect(result).toBe(expected);
  });
});
