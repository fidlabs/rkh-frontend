import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useSwitchChain } from './useSwitchChain';

const mocks = vi.hoisted(() => ({
  useSwitchChainMock: vi.fn(),
  switchChainMock: vi.fn(),
  envMock: {
    useTestnet: false,
  },
}));

vi.mock('wagmi', () => ({
  useSwitchChain: mocks.useSwitchChainMock,
}));

vi.mock('@/config/environment', () => ({
  env: mocks.envMock,
}));

describe('useSwitchChain', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useSwitchChainMock.mockReturnValue({
      switchChain: mocks.switchChainMock,
      chains: [{ id: 'main-net-id' }, { id: 'test-net-id' }],
      data: 'data',
      variables: 'variables',
    });
  });

  it('should return autoSitchChain chain function', () => {
    const { result } = renderHook(() => useSwitchChain());

    expect(result.current.autoSwitchChain).toBeDefined();
  });

  it('should handle autoSwitchChain for mainnet', () => {
    const { result } = renderHook(() => useSwitchChain());

    act(() => {
      result.current.autoSwitchChain();
    });

    expect(mocks.switchChainMock).toHaveBeenCalledWith({ chainId: 'main-net-id' });
  });

  it('should handle autoSwitchChain for testnet', () => {
    mocks.envMock.useTestnet = true;

    const { result } = renderHook(() => useSwitchChain());

    act(() => {
      result.current.autoSwitchChain();
    });
  });
});
