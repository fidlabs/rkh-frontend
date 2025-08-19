'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  useAccount as useWagmiAccount,
  useConnect as useWagmiConnect,
  useDisconnect as useWagmiDisconnect,
} from 'wagmi';

import { AccountContext } from '@/contexts/AccountContext';
import * as cbor from 'cbor';
import * as address from '@glif/filecoin-address';
import { JsonRpcProvider, FetchRequest } from "ethers";
import { hexToBytes } from '@noble/hashes/utils';

import { Connector } from '@/types/connector';
import { LedgerConnector } from '@/lib/connectors/ledger-connector';
import { FilsnapConnector } from '@/lib/connectors/filsnap-connector';
import { Account, AccountRole } from '@/types/account';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VerifyAPI } from 'filecoin-verifier-tools';
import { env } from '@/config/environment';
import { injected } from 'wagmi/connectors';
import { getSafeKit } from '@/lib/safe';
import { useSwitchChain } from '@/hooks';

const queryClient = new QueryClient();

// Import the signer as a dynamic import
const signerPromise = import('@zondax/filecoin-signing-tools/js').then(
  module => module.transactionSerialize,
);

type Msg = {
  Version: number; To: string; From: string; Nonce: number;
  Value: string; GasLimit: number; GasFeeCap: string; GasPremium: string;
  Method: number; Params: string; // base64
};

export const AccountProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);

  // RKH connectors
  const [currentConnector, setCurrentConnector] = useState<Connector | null>(null);

  // MetaAllocator connectors
  const {
    address: wagmiAddress,
    status: wagmiStatus,
    connector: wagmiConnector,
  } = useWagmiAccount();
  const { autoSwitchChain } = useSwitchChain();
  const { connect: wagmiConnect } = useWagmiConnect();
  const { disconnect: wagmiDisconnect } = useWagmiDisconnect();

  useEffect(() => {
    if (wagmiStatus === 'connected') {
      autoSwitchChain();

      const setupSafe = async () => {
        try {
          const provider = await wagmiConnector?.getProvider();
          const safeKit = await getSafeKit(provider);
          const maOwners = await safeKit.getOwners();

          setAccount({
            address: wagmiAddress,
            index: 0,
            isConnected: true,
            role: maOwners.includes(wagmiAddress)
              ? AccountRole.METADATA_ALLOCATOR
              : AccountRole.GUEST,
            wallet: {
              type: 'metamask',
              sign: async (_message: any, _indexAccount: number) => '0x00',
              signArbitrary: async (message: string, indexAccount: number) => {
                throw new Error('Not implemented');
              },
              getPubKey: () => {
                throw new Error('Not implemented');
              },
              getAccounts: async () => {
                return [wagmiAddress];
              },
            },
          });
        } catch (error) {
          console.error('Error setting up Safe connection:', error);
        }
      };

      setupSafe();
    }
  }, [wagmiStatus, wagmiAddress, wagmiConnector]);

  // Registry of available connectors
  const connectors: { [key: string]: Connector } = {
    ledger: new LedgerConnector(),
    filsnap: new FilsnapConnector(),
  };

  const loadPersistedAccount = useCallback(async () => {}, []);

  /**
   * Connects using the specified connector.
   * @param connectorName The name of the connector ('ledger' or 'metamask').
   * @param accountIndex The index of the account to connect to on the ledger.
   */
  const connect = useCallback(
    async (connectorName: string, accountIndex?: number) => {
      try {
        switch (connectorName) {
          case 'metamask':
            await wagmiConnect({
              connector: injected(),
            });
            break;
          case 'ledger':
            const ledgerConnector = new LedgerConnector(accountIndex);
            const ledgerAccount = await ledgerConnector.connect();
            setAccount(ledgerAccount);
            setCurrentConnector(ledgerConnector);
            break;
          case 'filsnap':
            const filsSnapConnector = new FilsnapConnector();
            const filsSnapAccount = await filsSnapConnector.connect();
            setAccount(filsSnapAccount);
            setCurrentConnector(filsSnapConnector);
            break;
        }
      } catch (error) {
        throw error;
      }
    },
    [connectors],
  );

  /**
   * Disconnects the current connector.
   */
  const disconnect = useCallback(async () => {
    // handle MetaAllocator disconnect
    if (account?.role === AccountRole.METADATA_ALLOCATOR || account?.role === AccountRole.GUEST) {
      await wagmiDisconnect();
      setAccount(null);
    }

    // handle RKH disconnect
    else if (currentConnector) {
      await currentConnector.disconnect();
      setCurrentConnector(null);
      setAccount(null);
    }
  }, [account, currentConnector]);

  const proposeAddVerifier = useCallback(
    async (verifierAddress: string, datacap: number) => {
      if (!account?.wallet) {
        throw new Error('Wallet not connected');
      }

      const api = new VerifyAPI(
        VerifyAPI.browserProvider(env.rpcUrl, {
          token: async () => env.rpcToken,
        }),
        account.wallet,
        env.useTestnet,
      );

      // 1PiB is 2^50
      const fullDataCap = BigInt(datacap * 1_125_899_906_842_624);
      let verifierAccountId = verifierAddress;
      if (verifierAccountId.length < 12) {
        verifierAccountId = await api.actorKey(verifierAccountId);
      }

      // Is this a direct RKH or a multisig member?
      if (account.role === AccountRole.ROOT_KEY_HOLDER) {
      const messageId = await api.proposeVerifier(
        verifierAddress,
        fullDataCap,
        account.index ?? 0,
        account.wallet,
      );
      return messageId;
      } else {
        // Go the multisig way - requires some torture to get the message in the right shape
        //FIXME need to get this from some ind of setting
        const msigAddress ='t2q4zeevbw6twcqd2gm7b25bg3wydq7qq72qhmy5y'

        // Prepare RPC access}
        const req = new FetchRequest(env.rpcUrl);
        req.setHeader("Authorization", `Bearer ${env.rpcToken}`);
        req.setHeader("Content-Type", "application/json");

        const rpcProvider = new JsonRpcProvider(
          req, 
          {
            chainId: 31415926, // neti test ID, need to get from config
            name: "filecoin",
          }
        );

        // Encode INNER message (what will be send to f06) as base64
        // lotus chain encode params t06 2 '{"address":"<allocatoraddress>","allowance":"<datacapamount>"}'
        const vract = await rpcProvider.send("Filecoin.StateGetActor", ["t06", null]);
  console.log('vract ...', vract);
        const innerB64 = await rpcProvider.send("Filecoin.StateEncodeParams", [
          vract.Code,
          2,
          {
            Address: verifierAccountId,
            Allowance: fullDataCap.toString(),
          },
        ]
      );
  console.log('8 ...', innerB64);


      // Encode MIDDLE message
      const rkhAct = await rpcProvider.send("Filecoin.StateGetActor", ["t080", null]);
  console.log('rkhAct ...', rkhAct);
        const middleB64 = await rpcProvider.send("Filecoin.StateEncodeParams", [
          rkhAct.Code,
          2,
          {
            To: "t06",
            Method: 2,
            Value: "0",
            Params: innerB64,
          },
        ]
      );
  console.log('8 ...', middleB64);


      // Encode OUTER message
      const msigAct = await rpcProvider.send("Filecoin.StateGetActor", ["t080", null]);
  console.log('msigAct ...', msigAct);
      const payload = {
        To: "t080",
        Value: "0",
        Method: 2,
        Params: middleB64
      };
      const outerB64 = await rpcProvider.send("Filecoin.StateEncodeParams", [
        msigAct.Code,
        2,
        payload
      ]);
  console.log('outerB64 ...', outerB64);
      const outerHex = Buffer.from(outerB64, "base64").toString("hex");
  console.log('outerHex ...', outerHex);

      // Now prepare the final proposal
      const nonce: number = await rpcProvider.send("Filecoin.MpoolGetNonce", [account.address]);
  console.log('nonce ...', nonce);
      const msg: Msg = {
        Version: 0,
        To: msigAddress,
        From: account.address,
        Nonce: nonce,
        Value: "0",
        GasLimit: 0, GasFeeCap: "0", GasPremium: "0",
        Method: 2,
        Params: outerB64
      };
      
      //Sign and send...
  console.log('filecoinApp ...', account.wallet.filecoinApp); 
      const est: Msg = await rpcProvider.send("Filecoin.GasEstimateMessageGas", [msg, { MaxFee: "20000000000000000" }, null]);

      const msgZondax = {
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

      const transactionSerialize = await signerPromise;
      const derivationPath = `m/44'/461'/0'/0/${account.index}`;
      const serializedHex = transactionSerialize(msgZondax);
      const serializedBytes = hexToBytes(serializedHex);

      const { signature_compact } = await account.wallet.filecoinApp.sign(derivationPath, serializedBytes);
      if (signature_compact.length !== 65) {
        throw new Error(`Ledger returned bad signature length ${signature_compact.length}`);
      }

      const tbs = {
        Message: msgZondax,
        Signature: {
          Data: signature_compact.toString('base64'),
          Type: 1,
        },
      };

  console.log('tbs ...', tbs);
      tbs.Message.Params = msg.Params; //JAGMEM - try to hack this in...but it wasn't signed, was it?
  console.log('tbs mod...', tbs);
      //JAGMEM it seems like the Params ARE NOT sent to MpoolPush - see browser netwrok trace and the settled transaction - both have Params = ""
      const cid = await rpcProvider.send("Filecoin.MpoolPush", [tbs]);
  console.log('Returned CID ...', cid);
      return cid["/"]  || 'ERROR';
      }
    },
    [currentConnector],
  );

  const acceptVerifierProposal = useCallback(
    async (
      verifierAddress: string,
      datacap: number,
      fromAccount: string,
      transactionId: number,
    ) => {
      if (!account?.wallet) {
        throw new Error('Wallet not connected');
      }

      const api = new VerifyAPI(
        VerifyAPI.browserProvider(env.rpcUrl, {
          token: async () => env.rpcToken,
        }),
        account.wallet,
        env.useTestnet,
      );

      // 1PiB is 2^50
      const fullDataCap = BigInt(datacap * 1_125_899_906_842_624);
      let verifierAccountId = verifierAddress;
      if (verifierAccountId.length < 12) {
        verifierAccountId = await api.actorKey(verifierAccountId);
      }

      const messageId = await api.approveVerifier(
        account.address,
        fullDataCap,
        fromAccount,
        transactionId,
        account.index ?? 0,
        account.wallet,
      );

      return messageId;
    },
    [account],
  );

  const signStateMessage = useCallback(
    async (message: string) => {
      if (!account?.wallet) {
        throw new Error('Wallet not connected');
      }

      const signature = await account?.wallet.signArbitrary(message, account.index || 0);

      return signature;
    },
    [account, currentConnector],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AccountContext.Provider
        value={{
          account,
          connect,
          disconnect,
          connectors,
          signStateMessage,
          proposeAddVerifier,
          acceptVerifierProposal,
          loadPersistedAccount,
        }}
      >
        {children}
      </AccountContext.Provider>
    </QueryClientProvider>
  );
};
