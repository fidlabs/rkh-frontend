import { Account } from './account';

export interface Connector {
  name: string;
  connect: () => Promise<Account>;
  disconnect: () => Promise<void>;
  isConnected: () => boolean;
}
