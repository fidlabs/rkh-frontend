import { createConfig, http } from 'wagmi';
import { filecoin } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

const filecoinLocalTestnet = defineChain({
  id: 31415926,
  name: 'Filecoin Local Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Filecoin',
    symbol: 'FIL',
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:1234/rpc/v1'],
    },
  },
  testnet: true,
  contracts: {
    safeSingleton: {
      address: process.env.NEXT_PUBLIC_SAFE_SINGLETON_ADDRESS as `0x${string}`,
    },
    safeProxyFactory: {
      address: process.env.NEXT_PUBLIC_SAFE_PROXY_FACTORY_ADDRESS as `0x${string}`,
    },
    multiSend: {
      address: process.env.NEXT_PUBLIC_SAFE_MULTISEND_ADDRESS as `0x${string}`,
    },
    multiSendCallOnly: {
      address: process.env.NEXT_PUBLIC_SAFE_MULTISEND_CALL_ONLY_ADDRESS as `0x${string}`,
    },
    fallbackHandler: {
      address: process.env.NEXT_PUBLIC_SAFE_FALLBACK_HANDLER_ADDRESS as `0x${string}`,
    },
    signMessageLib: {
      address: process.env.NEXT_PUBLIC_SAFE_SIGN_MESSAGE_LIB_ADDRESS as `0x${string}`,
    },
    createCall: {
      address: process.env.NEXT_PUBLIC_SAFE_CREATE_CALL_ADDRESS as `0x${string}`,
    },
    simulateTxAccessor: {
      address: process.env.NEXT_PUBLIC_SAFE_SIMULATE_TX_ACCESSOR_ADDRESS as `0x${string}`,
    },
    metaAllocator: {
      address: process.env.NEXT_PUBLIC_META_ALLOCATOR_CONTRACT_ADDRESS as `0x${string}`,
    },
  },
});

export const config = createConfig({
  chains: [filecoin, filecoinLocalTestnet],
  connectors: [injected()],
  transports: {
    [filecoin.id]: http(),
    [filecoinLocalTestnet.id]: http('http://localhost:1234/rpc/v1'),
  },
});
