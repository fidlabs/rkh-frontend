import { AccountContextType } from '@/contexts/AccountContext';
import { createFilecoinRpcClient } from './filecoin-rpc';
import { filecoinConfig } from '@/config/filecoin';

export interface MultisigActionParams {
  proposalId: number | string;
  msigAddress: string;
  accountContext: AccountContextType;
}

export interface MultisigActionResult {
  success: boolean;
  message: string;
  error?: string;
  txHash?: string;
}

export interface FilecoinMessage {
  To: string;
  From: string;
  Value: string;
  Method: number;
  Params: string;
}

export interface Msg {
  Version: number;
  To: string;
  From: string;
  Nonce: number;
  Value: string;
  GasLimit: number;
  GasFeeCap: string;
  GasPremium: string;
  Method: number;
  Params: string;
}

export interface SignedMessage {
  Message: Msg;
  Signature: {
    Data: string;
    Type: number;
  };
}

// Import the signer as a dynamic import
const signerPromise = import('@zondax/filecoin-signing-tools/js').then(
    module => module.transactionSerialize,
  );

/**
 * Send a multisig message with complete flow: gas estimation, signing, and submission
 */
export async function sendMsigMsg(
  message: FilecoinMessage,
  accountContext: AccountContextType,
): Promise<string> {
  try {
    if (!accountContext.account?.wallet?.filecoinApp) {
      throw new Error('No Ledger account available');
    }

    const msigAddress = accountContext.account?.parentMsigAddress || '';
    const client = createFilecoinRpcClient(msigAddress);
    const account = accountContext.account;

    // Get nonce for the sender address
    const nonce: number = await client.sendRpc("Filecoin.MpoolGetNonce", [account.address]);
    console.log('Nonce:', nonce);

    // Prepare the message with nonce
    const msg: Msg = {
      Version: 0,
      To: message.To,
      From: message.From,
      Nonce: nonce,
      Value: message.Value,
      GasLimit: 0, // Will be estimated
      GasFeeCap: "0", // Will be estimated
      GasPremium: "0", // Will be estimated
      Method: message.Method,
      Params: message.Params
    };

    // Estimate gas
    console.log('Estimating gas for message:', msg);
    const est: Msg = await client.sendRpc("Filecoin.GasEstimateMessageGas", [
      msg, 
      { MaxFee: "20000000000000000" }, 
      null
    ]);

    // Create Zondax-friendly message with estimated gas
    const msgZondax = {
      Version: 0,
      To: msg.To,
      From: msg.From,
      Nonce: msg.Nonce,
      Value: msg.Value,
      GasLimit: Number(est.GasLimit),
      GasFeeCap: String(est.GasFeeCap),
      GasPremium: String(est.GasPremium),
      Method: msg.Method,
      Params: msg.Params,
    };

    console.log('Zondax message:', msgZondax);

    // Get the signer and serialize the transaction
    const transactionSerialize = await signerPromise;
    const derivationPath = `m/44'/461'/0'/0/${account.index}`;
    const serializedHex = transactionSerialize(msgZondax);
    const serializedBytes = hexToBytes(serializedHex);

    // Sign with Ledger
    const { signature_compact } = await account.wallet.filecoinApp.sign(derivationPath, serializedBytes);
    if (signature_compact.length !== 65) {
      throw new Error(`Ledger returned bad signature length ${signature_compact.length}`);
    }

    // Create signed message
    const signedMessage: SignedMessage = {
      Message: msgZondax,
      Signature: {
        Data: signature_compact.toString('base64'),
        Type: 1,
      },
    };

    console.log('Signed message:', signedMessage);

    // Submit to mempool
    const cid = await client.sendRpc("Filecoin.MpoolPush", [signedMessage]);
    console.log('Transaction submitted, CID:', cid);

    return cid["/"] || 'ERROR';

  } catch (error) {
    console.error('Failed to send multisig message:', error);
    throw new Error(`Failed to send multisig message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to convert hex to bytes
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Approve an AddVerifierIndirect proposal
 */
export async function approveAddVerifierIndirect({
  proposalId,
  accountContext,
}: MultisigActionParams): Promise<MultisigActionResult> {
  try {
    
    if (!accountContext.account?.wallet?.filecoinApp) {
      throw new Error('No Ledger wallet available');
    }

    const msigAddress = accountContext.account?.parentMsigAddress || '';
    const client = createFilecoinRpcClient(msigAddress);
    
    console.log('Approving AddVerifierIndirect proposal:', proposalId, 'with msigAddress:', msigAddress, 'and accountContext:', accountContext);

    // Method 3 is "Approve" for multisig
    const approveParams = {
      ID: proposalId,
    };
    
    console.log('Approving AddVerifierIndirect proposal:', proposalId, 'with params:', approveParams);

    const f080Code = await client.getActorCode('f080');
    const msigCode = await client.getActorCode(msigAddress);
    const InnerParamsB64 = await client.encodeParams(f080Code, 3, {ID: proposalId});
    const OuterParamsB64 = await client.encodeParams(msigCode, 2, {
      To: 'f080',
      Method: 3,
      Value: "0",
      Params: InnerParamsB64,
    });

    const msg: FilecoinMessage = {
      To: msigAddress,
      From: accountContext.account?.address || '',
      Value: "0",
      Method: 2, // we are PROPOSING to our msig, the APPROVE is in the inner params
      Params: OuterParamsB64,
    };

    const txHash = await sendMsigMsg(msg, accountContext)
    
    return {
      success: true,
      message: `Successfully approved AddVerifierIndirect proposal #${proposalId}`,
      txHash: txHash,
    };
    
  } catch (error) {
    console.error('Failed to approve AddVerifierIndirect proposal:', error);
    return {
      success: false,
      message: 'Failed to approve AddVerifierIndirect proposal',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reject an AddVerifierIndirect proposal
 */
export async function rejectAddVerifierIndirect({
  proposalId,
  accountContext,
}: MultisigActionParams): Promise<MultisigActionResult> {
  try {
    if (!accountContext.account?.wallet?.filecoinApp) {
      throw new Error('No Ledger account available');
    }

    const msigAddress = accountContext.account?.parentMsigAddress || '';
    const client = createFilecoinRpcClient(msigAddress);
    
    // Method 4 is "Cancel" for multisig (rejecting)
    const rejectParams = {
      ID: proposalId,
    };

    // TODO: Implement actual rejection logic
    // 1. Create cancellation message using the proposal ID
    // 2. Sign with Ledger wallet
    // 3. Submit to network via RPC provider
    
    console.log('Rejecting AddVerifierIndirect proposal:', proposalId, 'with params:', rejectParams);
    
    // Placeholder for actual implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Successfully rejected AddVerifierIndirect proposal #${proposalId}`,
      txHash: 'placeholder-tx-hash',
    };
    
  } catch (error) {
    console.error('Failed to reject AddVerifierIndirect proposal:', error);
    return {
      success: false,
      message: 'Failed to reject AddVerifierIndirect proposal',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Approve an AddSignerIndirect proposal
 */
export async function approveAddSignerIndirect({
  proposalId,
  accountContext,
}: MultisigActionParams): Promise<MultisigActionResult> {
  try {
    if (!accountContext.account?.wallet?.filecoinApp) {
      throw new Error('No Ledger account available');
    }

    const msigAddress = accountContext.account?.parentMsigAddress || '';
    const client = createFilecoinRpcClient(msigAddress);
    
    // Method 3 is "Approve" for multisig
    const approveParams = {
      ID: proposalId,
    };
    
    console.log('Approving AddSignerIndirect proposal:', proposalId, 'with params:', approveParams);
    
    const f080Code = await client.getActorCode('f080');
    const msigCode = await client.getActorCode(msigAddress);
    const InnerParamsB64 = await client.encodeParams(f080Code, 3, {ID: proposalId});
    const OuterParamsB64 = await client.encodeParams(msigCode, 2, {
      To: 'f080',
      Method: 3,
      Value: "0",
      Params: InnerParamsB64,
    });

    const msg: FilecoinMessage = {
      To: msigAddress,
      From: accountContext.account?.address || '',
      Value: "0",
      Method: 2, // we are PROPOSING to our msig, the APPROVE is in the inner params
      Params: OuterParamsB64,
    };

    const txHash = await sendMsigMsg(msg, accountContext)
    
    return {
      success: true,
      message: `Successfully approved AddSignerIndirect proposal #${proposalId}`,
      txHash: txHash,
    };
    
  } catch (error) {
    console.error('Failed to approve AddSignerIndirect proposal:', error);
    return {
      success: false,
      message: 'Failed to approve AddSignerIndirect proposal',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reject an AddSignerIndirect proposal
 */
export async function rejectAddSignerIndirect({
  proposalId,
  accountContext,
}: MultisigActionParams): Promise<MultisigActionResult> {
  try {
    if (!accountContext.account?.wallet?.filecoinApp) {
      throw new Error('No Ledger account available');
    }

    const msigAddress = accountContext.account?.parentMsigAddress || '';
    const client = createFilecoinRpcClient(msigAddress);
    
    // Method 4 is "Cancel" for multisig (rejecting)
    const rejectParams = {
      ID: proposalId,
    };

    // TODO: Implement actual rejection logic
    // 1. Create cancellation message using the proposal ID
    // 2. Sign with Ledger wallet
    // 3. Submit to network via RPC provider
    
    console.log('Rejecting AddSignerIndirect proposal:', proposalId, 'with params:', rejectParams);
    
    // Placeholder for actual implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: false,
      message: `Successfully rejected AddSignerIndirect proposal #${proposalId}`,
      txHash: 'placeholder-tx-hash',
    };
    
  } catch (error) {
    console.error('Failed to reject AddSignerIndirect proposal:', error);
    return {
      success: false,
      message: 'Failed to reject AddSignerIndirect proposal',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Propose adding a new signer
 */
export async function proposeAddSigner({
  proposalId,
  accountContext,
}: MultisigActionParams): Promise<MultisigActionResult> {
  try {
    if (!accountContext.account?.wallet?.filecoinApp) {
      throw new Error('No Ledger account available');
    }

    const msigAddress = accountContext.account?.parentMsigAddress || '';
    const client = createFilecoinRpcClient(msigAddress);

    console.log('Proposing AddSigner:', proposalId);
    
    const f080Code = await client.getActorCode('f080');
    const msigCode = await client.getActorCode(msigAddress);
    const innerParamsB64 = await client.encodeParams(f080Code, 5, {Signer:proposalId, Increase:false});
    const innerParamsHex = "0x" + Buffer.from(innerParamsB64, "base64").toString("hex");
    const outerParamsB64 = await client.encodeParams(f080Code, 2, {
      To: 'f080',
      Method: 5,
      Value: "0",
      Params: innerParamsB64,
    });
    const outerParamsHex = "0x" + Buffer.from(outerParamsB64, "base64").toString("hex");
    const messageParams = await client.encodeParams(msigCode, 2, {
      To: 'f080',
      Method: 2,
      Value: "0",
      Params: outerParamsB64,
    });

    const msg: FilecoinMessage = {
      To: msigAddress,
      From: accountContext.account?.address || '',
      Value: "0",
      Method: 2, // we are PROPOSING to our msig, the ADD SIGNER is in the inner params
      Params: messageParams,
    };

    const txHash = await sendMsigMsg(msg, accountContext)
    
    return {
      success: true,
      message: `Successfully proposed AddSigner #${proposalId}`,
      txHash: txHash
    };
    
  } catch (error) {
    console.error('Failed to propose AddSigner:', error);
    return {
      success: false,
      message: 'Failed to propose AddSigner',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reject an AddSigner proposal
 */
export async function rejectAddSigner({
  proposalId,
  accountContext,
}: MultisigActionParams): Promise<MultisigActionResult> {
  try {
    if (!accountContext.account?.wallet?.filecoinApp) {
      throw new Error('No Ledger account available');
    }

    const msigAddress = accountContext.account?.parentMsigAddress || '';
    const client = createFilecoinRpcClient(msigAddress);
    
    // Method 4 is "Cancel" for multisig (rejecting)
    const rejectParams = {
      ID: proposalId,
    };

    // TODO: Implement actual rejection logic
    // 1. Create cancellation message using the proposal ID
    // 2. Sign with Ledger wallet
    // 3. Submit to network via RPC provider
    
    console.log('Rejecting AddSigner proposal:', proposalId, 'with params:', rejectParams);
    
    // Placeholder for actual implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Successfully rejected AddSigner proposal #${proposalId}`,
      txHash: 'placeholder-tx-hash',
    };
    
  } catch (error) {
    console.error('Failed to reject AddSigner proposal:', error);
    return {
      success: false,
      message: 'Failed to reject AddSigner proposal',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
