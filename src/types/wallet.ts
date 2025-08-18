export interface Wallet {
  type: string;
  sign: (message: any, indexAccount: number) => Promise<string>;
  signArbitrary: (message: string, indexAccount: number) => Promise<string>;
  getAccounts: () => Promise<string[]>;
  getPubKey: () => Buffer;
  filecoinApp?: any; // Optional, used for Ledger wallets
  filsnapAdapter?: any; // Optional, used for Filsnap wallets
}
