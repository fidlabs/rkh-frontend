import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@zondax/filecoin-signing-tools/js', () => ({
  default: {
    generateMnemonic: vi.fn(() => 'test mnemonic'),
    generateKeyPair: vi.fn(() => ({
      privateKey: 'test-private-key',
      publicKey: 'test-public-key',
    })),
  },
  transactionSerialize: vi.fn(() => 'mock-serialized-transaction'),
}));
