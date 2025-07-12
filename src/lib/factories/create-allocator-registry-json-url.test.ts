import { vi } from 'vitest';
import { createAllocatorRegistryJsonUrl } from '@/lib/factories/create-allocator-registry-json-url';

const mocks = vi.hoisted(() => ({
  testOwnerMock: 'test-owner',
}));

vi.mock('@/config/environment', () => ({
  env: {
    githubOwner: mocks.testOwnerMock,
  },
}));

describe('createAllocatorRegistryJsonUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each`
    jsonNumber                    | expected
    ${'123'}                      | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/123.json`}
    ${'abc123'}                   | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/abc123.json`}
    ${''}                         | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators`}
    ${'test-123_abc'}             | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/test-123_abc.json`}
    ${'very-long-json-123456789'} | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators/very-long-json-123456789.json`}
    ${undefined}                  | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators`}
    ${null}                       | ${`https://github.com/${mocks.testOwnerMock}/Allocator-Registry/blob/main/Allocators`}
  `('should create correct URL for jsonNumber: "$jsonNumber"', ({ jsonNumber, expected }) => {
    const result = createAllocatorRegistryJsonUrl(jsonNumber);

    expect(result).toBe(expected);
  });
});
