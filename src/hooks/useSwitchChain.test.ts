import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useSwitchChain } from './useSwitchChain';
import { createWrapper } from '@/test-utils';
import { useSwitchChain as useWagmiSwitchChain } from 'wagmi';
import { env } from '@/config/environment';

vi.mock('wagmi');
vi.mock('@/config/environment');

const mockUseWagmiSwitchChain = useWagmiSwitchChain as Mock;
const mockEnv = env as { useTestnet: boolean };

describe('useSwitchChain', () => {
  const mockSwitchChain = vi.fn();
  const mockChains = [
    { id: 1, name: 'Mainnet' },
    { id: 2, name: 'Testnet' },
  ];
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseWagmiSwitchChain.mockReturnValue({
      chains: mockChains,
      switchChain: mockSwitchChain,
      otherHookProp: 'fixtureProp',
    });
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useSwitchChain(), { wrapper });

    expect(result.current.chains).toBe(mockChains);
    expect(result.current.switchChain).toBe(mockSwitchChain);
    expect(typeof result.current.autoSwitchChain).toBe('function');
  });

  it('should switch to mainnet when useTestnet is false', async () => {
    mockEnv.useTestnet = false;

    const { result } = renderHook(() => useSwitchChain(), { wrapper });

    await act(async () => {
      result.current.autoSwitchChain();
    });

    expect(mockSwitchChain).toHaveBeenCalledWith({
      chainId: mockChains[0].id,
    });
  });

  it('should switch to testnet when useTestnet is true', async () => {
    mockEnv.useTestnet = true;

    const { result } = renderHook(() => useSwitchChain(), { wrapper });

    await act(async () => {
      result.current.autoSwitchChain();
    });

    expect(mockSwitchChain).toHaveBeenCalledWith({
      chainId: mockChains[1].id,
    });
  });
});
