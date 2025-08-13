import { createContext } from 'react';

import { Account } from '@/types/account';
import { Connector } from '@/types/connector';
import { MetaAllocator } from '@/types/ma';

export interface AccountContextType {
  account: Account | null;
  selectedMetaAllocator?: MetaAllocator | null;
  connectors: { [key: string]: Connector };
  connect: (connectorName: string, accountIndex?: number, ma?: MetaAllocator) => Promise<void>;
  disconnect: () => Promise<void>;
  loadPersistedAccount: () => Promise<void>;

  // Governance Team Member
  signStateMessage: (message: string) => Promise<string>;

  // Root Key Holder
  proposeAddVerifier: (verifierAddress: string, datacap: number) => Promise<string>;
  acceptVerifierProposal: (
    verifierAddress: string,
    datacap: number,
    fromAccount: string,
    transactionId: number,
  ) => Promise<string>;
}

export const AccountContext = createContext<AccountContextType | undefined>(undefined);
