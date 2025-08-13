import { useSwitchChain as useWagmiSwitchChain } from 'wagmi';
import { env } from '@/config/environment';
import { useCallback } from 'react';

enum ChainId {
  Mainnet = 0,
  Testnet = 1,
}

export const useSwitchChain = () => {
  const { chains, switchChain, ...rest } = useWagmiSwitchChain();

  const autoSwitchChain = useCallback(() => {
    const chainIndex = env.useTestnet ? ChainId.Testnet : ChainId.Mainnet;

    return switchChain({
      chainId: chains[chainIndex].id,
    });
  }, [switchChain, chains]);

  return {
    ...rest,
    autoSwitchChain,
    switchChain,
    chains,
  };
};
