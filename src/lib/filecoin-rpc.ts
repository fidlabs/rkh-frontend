import { JsonRpcProvider, FetchRequest } from "ethers";
import { filecoinConfig } from "@/config/filecoin";

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

export class FilecoinRpcClient {
  private provider: JsonRpcProvider;
  private msigAddress: string;

  constructor(lotusUrl: string, token: string, msigAddress: string, chainId: number = 314) {
    const req = new FetchRequest(lotusUrl);
    req.setHeader("Content-Type", "application/json");
    req.setHeader("Authorization", `Bearer ${token}`);
    this.provider = new JsonRpcProvider(req, { chainId, name: "filecoin" });
    this.msigAddress = msigAddress;
  }

  async getActorInfo(): Promise<FilecoinActor> {
    return await this.provider.send("Filecoin.StateGetActor", [this.msigAddress, null]);
  }

  async getAvailableBalance(): Promise<string> {
    return await this.provider.send("Filecoin.MsigGetAvailableBalance", [this.msigAddress, null]);
  }

  async getState(): Promise<FilecoinState> {
    const { State } = await this.provider.send("Filecoin.StateReadState", [this.msigAddress, null]);
    return State;
  }

  async getPendingTransactions(): Promise<PendingTransaction[]> {
    return await this.provider.send("Filecoin.MsigGetPending", [this.msigAddress, null]);
  }

  async decodeParams(method: number, params: string): Promise<DecodedParams> {
    return await this.provider.send("Filecoin.StateDecodeParams", [this.msigAddress, method, params, null]);
  }

  async encodeParams(actor: string, method: number, params: any): Promise<string> {
    return await this.provider.send("Filecoin.StateEncodeParams", [actor, method, params]);
  }

  async getActorCode(actorAddress: string): Promise<any> {
    const actor = await this.provider.send("Filecoin.StateGetActor", [actorAddress, null]);
    return actor.Code;
  }

  async getTotalBalance(): Promise<string> {
    const actor = await this.getActorInfo();
    return actor.Balance;
  }

  // Public method to access provider for custom RPC calls
  async sendRpc(method: string, params: any[]): Promise<any> {
    return await this.provider.send(method, params);
  }
}

// Factory function to create client with environment config
export function createFilecoinRpcClient(msigAddress: string): FilecoinRpcClient {
  const { lotus } = filecoinConfig;
  
  return new FilecoinRpcClient(lotus.url, lotus.token, msigAddress, lotus.chainId);
}
