import { useSwitchChain as useWagmiSwitchChain } from 'wagmi';
import { env } from '@/config/environment';

enum ChainId {
  Mainnet = 0,
  Testnet = 1,
}

export const useSwitchChain = () => {
  const { chains, switchChain, ...rest } = useWagmiSwitchChain();

  const autoSwitchChain = () => {
    const chainIndex = env.useTestnet ? ChainId.Testnet : ChainId.Mainnet;

    return switchChain({
      chainId: chains[chainIndex].id,
    });
  };

  return {
    ...rest,
    autoSwitchChain,
    switchChain,
    chains,
  };
};
