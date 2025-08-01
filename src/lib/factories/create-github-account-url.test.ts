import { describe, it, expect } from 'vitest';
import { createGithubAccountUrl } from '@/lib/factories/create-github-account-url';

describe('createGithubAccountUrl', () => {
  it('should create correct URL for account', () => {
    const result = createGithubAccountUrl('test-account');
    expect(result).toBe('https://github.com/test-account');
  });
});
