import Safe, { Eip1193Provider } from '@safe-global/protocol-kit';

export const safeAddress = '0x2e25A2f6bC2C0b7669DFB25180Ed57e07dAabe9e';

export const getSafeKit = async (provider: any): Promise<Safe> => {
  const safeKit = await Safe.init({
    provider: provider as Eip1193Provider,
    safeAddress: safeAddress,
  });

  return safeKit;
};
/* configuration for test net
export const getSafeKit = async (provider: any): Promise<Safe> => {
  const safeKit = await Safe.init({
    provider: provider as Eip1193Provider,
    safeAddress: safeAddress,
    contractNetworks: {
      31415926: {
        safeSingletonAddress: process.env.NEXT_PUBLIC_SAFE_SINGLETON_ADDRESS as `0x${string}`,
        safeProxyFactoryAddress: process.env.NEXT_PUBLIC_SAFE_PROXY_FACTORY_ADDRESS as `0x${string}`,
        multiSendAddress: process.env.NEXT_PUBLIC_SAFE_MULTISEND_ADDRESS as `0x${string}`,
        fallbackHandlerAddress: process.env.NEXT_PUBLIC_SAFE_FALLBACK_HANDLER_ADDRESS as `0x${string}`,
        multiSendCallOnlyAddress: process.env.NEXT_PUBLIC_SAFE_MULTISEND_CALL_ONLY_ADDRESS as `0x${string}`,
        createCallAddress: process.env.NEXT_PUBLIC_SAFE_CREATE_CALL_ADDRESS as `0x${string}`,
        signMessageLibAddress: process.env.NEXT_PUBLIC_SAFE_SIGN_MESSAGE_LIB_ADDRESS as `0x${string}`,
        simulateTxAccessorAddress: process.env.NEXT_PUBLIC_SAFE_SIMULATE_TX_ACCESSOR_ADDRESS as `0x${string}`,
      } as any,
    },
  });

  return safeKit;
};*/
