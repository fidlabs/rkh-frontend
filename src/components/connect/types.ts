export type Role = 'root' | 'meta-allocator';

export enum DialogStep {
  SELECT_ROLE = 'select-role',
  SELECT_PROVIDER = 'select-provider',
  SELECT_MA = 'select-ma',
  CONNECT_WALLET = 'connect-wallet',
}
