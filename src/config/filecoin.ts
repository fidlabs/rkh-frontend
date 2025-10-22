import { env } from '@/config/environment';

export const filecoinConfig = {
  // Default multisig address - can be overridden per component
  defaultMsigAddress: 'f080',

  // Lotus RPC configuration
  lotus: {
    url: env.rpcUrl,
    chainId: env.testNetChainId,
  },

  // Method numbers for common Filecoin operations
  methods: {
    // Multisig methods
    PROPOSE: 2,
    APPROVE: 3,
    CANCEL: 4,

    // Payment channel methods
    PAYMENT_CHANNEL_COLLECT: 2,
    PAYMENT_CHANNEL_SETTLE: 3,

    // Other common methods
    SEND: 0,
    CONSTRUCTOR: 1,
  },

  // Actor types
  actors: {
    MULTISIG: 'multisig',
    PAYMENT_CHANNEL: 'payment_channel',
    ACCOUNT: 'account',
  },
};
