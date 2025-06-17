import { useContext, useMemo } from 'react';
import { AccountContext } from '@/contexts/AccountContext';

/**
 * Custom hook to access the account role.
 * @returns Account role.
 */
export function useAccountRole() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccountRole must be used within an AccountProvider');
  }
  return useMemo(() => context.account?.role, [context.account?.role]);
}
