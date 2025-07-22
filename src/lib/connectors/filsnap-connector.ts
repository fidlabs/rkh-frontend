import { Connector } from '@/types/connector';
import { Account, AccountRole } from '@/types/account';
import { fetchRole } from '@/lib/api';
import { FilsnapAdapter } from 'filsnap-adapter';
import { FilsnapWallet } from '../wallets/filsnap-wallet';

export class FilsnapConnector implements Connector {
  name = 'filsnap';
  private connected = false;
  private account: Account | null = null;
  private adapter: FilsnapAdapter | null = null;

  async connect(): Promise<Account> {
    try {
      // Check if Metamask with Snaps support is installed
      const hasSnaps = await FilsnapAdapter.hasSnaps();
      if (!hasSnaps) {
        throw new Error('Metamask with Snaps support is not installed');
      }

      // Connect to the Filsnap adapter
      this.adapter = await FilsnapAdapter.connect({ network: 'mainnet' }, 'npm:filsnap');

      // Get the Filecoin address
      const { error, result: address } = await this.adapter.getAddress();
      if (error) {
        throw new Error(`Failed to get address: ${error}`);
      }

      let role: AccountRole;
      try {
        role = await fetchRole(address);
      } catch (error) {
        role = AccountRole.GUEST;
      }
      this.account = {
        address,
        role,
        isConnected: true,
        wallet: new FilsnapWallet(this.adapter, address),
      };
      this.connected = true;
      return this.account;
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.account = null;
    this.adapter = null;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
