import { describe, it, expect } from 'vitest';
import { createFilfoxMessageUrl } from './create-filfox-message-url';

describe('createFilfoxMessageUrl', () => {
  it('should return the correct url', () => {
    expect(createFilfoxMessageUrl('bafybeigd263767676767676767676767676')).toBe(
      'https://filfox.info/en/message/bafybeigd263767676767676767676767676',
    );
  });
});