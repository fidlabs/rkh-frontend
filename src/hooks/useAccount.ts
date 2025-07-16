import { useContext } from 'react';
import { AccountContext } from '@/contexts/AccountContext';

/**
 * Custom hook to access the account context.
 * @returns Account context value.
 */
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
