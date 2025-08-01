import { describe, it, expect } from 'vitest';
import { createFilfoxAddressUrl } from '@/lib/factories/create-filfox-address-url';

describe('createFilfoxUrl', () => {
  it('should create correct URL for address', () => {
    const result = createFilfoxAddressUrl('test-address');
    expect(result).toBe('https://filfox.info/en/address/test-address');
  });
});
