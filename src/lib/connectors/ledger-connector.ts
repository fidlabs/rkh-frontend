import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
// @ts-ignore
import { FilecoinApp } from '@zondax/ledger-filecoin/dist/app';

import { fetchRole } from '@/lib/api';
import { Connector } from '@/types/connector';
import { Account, AccountRole } from '@/types/account';
import { LedgerWallet } from '../wallets/ledger-wallet';
import { checkMultisigRole } from '../multisig-role-checker';

export class LedgerConnector implements Connector {
  name = 'ledger';
  private transport: any;
  private filecoinApp: any;
  private connected = false;
  private accountIndex = 0;
  private account: Account | null = null;

  constructor(accountIndex = 0) {
    this.accountIndex = accountIndex;
  }

  async connect(): Promise<Account> {
    try {
      if (!this.transport) {
        this.transport = await TransportWebUSB.create();
        this.filecoinApp = new FilecoinApp(this.transport);
      }

      const version = await this.filecoinApp.getVersion();
      if (version.device_locked) {
        throw new Error('Ledger is locked. Please unlock your Ledger device.');
      }
      if (version.test_mode) {
        throw new Error('Filecoin app is in test mode.');
      }
      if (version.major < 2) {
        throw new Error('Please update the Filecoin app on your Ledger device.');
      }

      const path = `m/44'/461'/0'/0/${this.accountIndex}`;
      const { addrString: address, compressed_pk: pubkey } =
        await this.filecoinApp.getAddressAndPubKey(path);

      // Check if the logged-in wallet is a signer to f080 or any of its multisig signers
      const multisigRoleResult = await checkMultisigRole(address);
      
      let role;
      let parentMsigAddress;
      
      if (multisigRoleResult.role === AccountRole.ROOT_KEY_HOLDER || 
          multisigRoleResult.role === AccountRole.INDIRECT_ROOT_KEY_HOLDER) {
        // Use the multisig role result
        role = multisigRoleResult.role;
        parentMsigAddress = multisigRoleResult.parentMsigAddress;
      } else {
        // Fall back to the default role fetching
        role = await fetchRole(address);
      }
      
      this.account = {
        index: this.accountIndex,
        address,
        isConnected: true,
        wallet: new LedgerWallet(this.filecoinApp, address, pubkey),
        role,
        parentMsigAddress,
      };
      this.connected = true;
      return this.account;
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
    }
    this.connected = false;
    this.account = null;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Additional methods specific to Ledger
  async fetchAccounts(): Promise<LedgerAccount[]> {
    if (!this.transport) {
      this.transport = await TransportWebUSB.create();
      this.filecoinApp = new FilecoinApp(this.transport);
    }

    const accounts: LedgerAccount[] = [];
    for (let i = 0; i < 10; i++) {
      const path = `m/44'/461'/0'/0/${i}`;
      const apk = await this.filecoinApp.getAddressAndPubKey(path);
      accounts.push({ address: apk.addrString, pubKey: apk.compressed_pk, index: i, path });
    }
    return accounts;
  }
}

interface LedgerAccount {
  address: string;
  pubKey: Buffer;
  path: string;
  index: number;
}
