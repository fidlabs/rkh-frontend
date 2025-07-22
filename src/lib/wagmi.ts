import { createConfig, http } from 'wagmi';
import { filecoin } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';
import { env, testNetSafeContracts } from '@/config/environment';

const filecoinLocalTestnet = defineChain({
  id: env.testNetChainId,
  name: 'Filecoin Local Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Filecoin',
    symbol: 'FIL',
  },
  rpcUrls: {
    default: {
      http: [env.rpcUrl],
    },
  },
  testnet: true,
  contracts: {
    safeSingleton: { address: testNetSafeContracts.safeSingletonAddress },
    safeProxyFactory: { address: testNetSafeContracts.safeProxyFactoryAddress },
    multiSend: { address: testNetSafeContracts.multiSendAddress },
    multiSendCallOnly: { address: testNetSafeContracts.multiSendCallOnlyAddress },
    fallbackHandler: { address: testNetSafeContracts.fallbackHandlerAddress },
    signMessageLib: { address: testNetSafeContracts.signMessageLibAddress },
    createCall: { address: testNetSafeContracts.createCallAddress },
    simulateTxAccessor: { address: testNetSafeContracts.simulateTxAccessorAddress },
    metaAllocator: { address: env.metaAllocatorContractAddress },
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
