import { createFilecoinRpcClient } from './filecoin-rpc';
import { AccountRole } from '@/types/account';

export interface MultisigRoleResult {
  role: AccountRole;
  parentMsigAddress?: string;
}

/**
 * Check if the logged-in wallet is a signer to f080 or any of its multisig signers
 */
export async function checkMultisigRole(address: string): Promise<MultisigRoleResult> {
  try {
    const f080Client = createFilecoinRpcClient('f080');

    // Get f080 signers
    const f080State = await f080Client.getState();
    const f080Signers = f080State.Signers;

    // Get the ActorID for the logged-in address
    let actorId: string | null = null;
    try {
      const actorInfo = await f080Client.sendRpc('Filecoin.StateLookupID', [address, null]);
      actorId = actorInfo;
    } catch (error) {
      console.warn(`Could not get ActorID for address ${address}:`, error);
    }

    // Check if the address or ActorID is a direct signer of f080
    if (f080Signers.includes(address) || (actorId && f080Signers.includes(actorId))) {
      return {
        role: AccountRole.ROOT_KEY_HOLDER,
      };
    }

    // Check if any of f080's signers are multisigs by examining their actor code
    // All multisigs share the same code CID so compare with F080
    const f080Code = await f080Client.getActorCode('f080');

    const multisigSigners = [];
    for (const signer of f080Signers) {
      try {
        // Check if this signer is a multisig by looking at its actor code
        const actorCode = await f080Client.getActorCode(signer);
        if (actorCode['/'] === f080Code['/']) {
          multisigSigners.push(signer);
        }
      } catch (error) {
        console.warn(`Could not get actor info for signer ${signer}:`, error);
        // If we can't determine, skip this signer
        continue;
      }
    }

    // For each multisig signer, check if our address or ActorID is a signer
    for (const multisigAddress of multisigSigners) {
      try {
        const msigClient = createFilecoinRpcClient(multisigAddress);
        const msigState = await msigClient.getState();

        if (
          msigState.Signers.includes(address) ||
          (actorId && msigState.Signers.includes(actorId))
        ) {
          console.log(`Found indirect root key holder ${address} in multisig ${multisigAddress}`);
          return {
            role: AccountRole.INDIRECT_ROOT_KEY_HOLDER,
            parentMsigAddress: multisigAddress,
          };
        }
      } catch (error) {
        // If we can't fetch the multisig state, skip it
        console.warn(`Could not fetch state for multisig ${multisigAddress}:`, error);
        continue;
      }
    }

    // If none of the above, return null to indicate we should use the default role fetching
    return {
      role: AccountRole.USER, // This will be overridden by the default fetchRole call
    };
  } catch (error) {
    console.error('Error checking multisig role:', error);
    // If there's an error, return null to fall back to default role fetching
    return {
      role: AccountRole.GUEST, // This will be overridden by the default fetchRole call
    };
  }
}
