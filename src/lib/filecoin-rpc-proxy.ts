import { env } from '@/config/environment';

export interface FilecoinActor {
  Balance: string;
}

export interface FilecoinState {
  NumApprovalsThreshold: number;
  Signers: string[];
  NextTxnID: number;
}

export interface PendingTransaction {
  ID: number;
  To: string;
  Value: string;
  Method: number;
  Params: string;
  Approved: string[];
}

export interface DecodedParams {
  To: string;
  Method: number;
  Params: any;
}

export class FilecoinRpcProxyClient {
  private msigAddress: string;
  private proxyUrl: string;

  constructor(msigAddress: string) {
    this.msigAddress = msigAddress;
    // Always route through the backend proxy
    this.proxyUrl = `${env.apiBaseUrl.replace('/api/v1', '')}/api/v1/rpc`;
  }

  private async makeRpcCall(method: string, params: any[]): Promise<any> {
    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message} (code: ${data.error.code})`);
    }

    return data.result;
  }

  async getActorInfo(): Promise<FilecoinActor> {
    return await this.makeRpcCall('Filecoin.StateGetActor', [this.msigAddress, null]);
  }

  async getAvailableBalance(): Promise<string> {
    return await this.makeRpcCall('Filecoin.MsigGetAvailableBalance', [this.msigAddress, null]);
  }

  async getState(): Promise<FilecoinState> {
    const { State } = await this.makeRpcCall('Filecoin.StateReadState', [this.msigAddress, null]);
    return State;
  }

  async getPendingTransactions(): Promise<PendingTransaction[]> {
    return await this.makeRpcCall('Filecoin.MsigGetPending', [this.msigAddress, null]);
  }

  async decodeParams(actor: string, method: number, params: string): Promise<DecodedParams> {
    return await this.makeRpcCall('Filecoin.StateDecodeParams', [actor, method, params, null]);
  }

  async encodeParams(actor: string, method: number, params: any): Promise<string> {
    return await this.makeRpcCall('Filecoin.StateEncodeParams', [actor, method, params]);
  }

  async getActorCode(actorAddress: string): Promise<any> {
    const actor = await this.makeRpcCall('Filecoin.StateGetActor', [actorAddress, null]);
    return actor.Code;
  }

  async getTotalBalance(): Promise<string> {
    const actor = await this.getActorInfo();
    return actor.Balance;
  }

  // Public method to access provider for custom RPC calls
  async sendRpc(method: string, params: any[]): Promise<any> {
    return await this.makeRpcCall(method, params);
  }
}

// Factory function to create proxy client
export function createFilecoinRpcProxyClient(msigAddress: string): FilecoinRpcProxyClient {
  return new FilecoinRpcProxyClient(msigAddress);
}
