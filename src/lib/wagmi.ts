import { createConfig, http } from 'wagmi';
import { filecoin } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { Address, defineChain } from 'viem';
import { env } from '@/config/environment';

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
      address: process.env.NEXT_PUBLIC_SAFE_SINGLETON_ADDRESS as Address,
    },
    safeProxyFactory: {
      address: process.env.NEXT_PUBLIC_SAFE_PROXY_FACTORY_ADDRESS as Address,
    },
    multiSend: {
      address: process.env.NEXT_PUBLIC_SAFE_MULTISEND_ADDRESS as Address,
    },
    multiSendCallOnly: {
      address: process.env.NEXT_PUBLIC_SAFE_MULTISEND_CALL_ONLY_ADDRESS as Address,
    },
    fallbackHandler: {
      address: process.env.NEXT_PUBLIC_SAFE_FALLBACK_HANDLER_ADDRESS as Address,
    },
    signMessageLib: {
      address: process.env.NEXT_PUBLIC_SAFE_SIGN_MESSAGE_LIB_ADDRESS as Address,
    },
    createCall: {
      address: process.env.NEXT_PUBLIC_SAFE_CREATE_CALL_ADDRESS as Address,
    },
    simulateTxAccessor: {
      address: process.env.NEXT_PUBLIC_SAFE_SIMULATE_TX_ACCESSOR_ADDRESS as Address,
    },
    metaAllocator: {
      address: process.env.NEXT_PUBLIC_META_ALLOCATOR_CONTRACT_ADDRESS as Address,
    },
  },
});

export const config = createConfig({
  chains: [filecoin, filecoinLocalTestnet],
  connectors: [injected()],
  transports: {
    [filecoin.id]: http(),
    [filecoinLocalTestnet.id]: http(env.rpcUrl),
  },
});
