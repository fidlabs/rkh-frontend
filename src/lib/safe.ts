import Safe, { Eip1193Provider } from '@safe-global/protocol-kit';
import { env, testNetSafeContracts } from '@/config/environment';

const validateTestNetSafeContracts = (): boolean => {
  if (!testNetSafeContracts) {
    console.warn('testNetSafeContracts not defined');
    return false;
  }

  const missingAddresses: string[] = [];

  Object.entries(testNetSafeContracts).forEach(([key, value]) => {
    if (!value || value === 'undefined') {
      missingAddresses.push(key);
    }
  });

  if (missingAddresses.length > 0) {
    console.warn('Missing Safe contract addresses:');
    missingAddresses.forEach(address => {
      console.warn(`❌ ${address}`);
    });
    console.warn('Safe will use default contract addresses instead.');
    return false;
  }

  console.log('✅ All Safe contract addresses are set');
  return true;
};

export const getSafeKit = async (provider: any): Promise<Safe> => {
  if (env.useTestnet && !validateTestNetSafeContracts())
    throw new Error('Missing Safe environment variables for test');

  return await Safe.init({
    provider: provider as Eip1193Provider,
    safeAddress: env.safeAddress,
    ...(env.useTestnet
      ? {
          contractNetworks: {
            [env.testNetChainId]: {
              safeSingletonAddress: testNetSafeContracts.safeSingletonAddress,
              safeProxyFactoryAddress: testNetSafeContracts.safeProxyFactoryAddress,
              multiSendAddress: testNetSafeContracts.multiSendAddress,
              fallbackHandlerAddress: testNetSafeContracts.fallbackHandlerAddress,
              multiSendCallOnlyAddress: testNetSafeContracts.multiSendCallOnlyAddress,
              createCallAddress: testNetSafeContracts.createCallAddress,
              signMessageLibAddress: testNetSafeContracts.signMessageLibAddress,
              simulateTxAccessorAddress: testNetSafeContracts.simulateTxAccessorAddress,
            },
          } as any,
        }
      : {}),
  });
};
