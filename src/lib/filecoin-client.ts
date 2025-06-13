import { createPublicClient, http, rpcSchema } from 'viem';
import { filecoin, filecoinCalibration } from 'viem/chains';
import { env } from '@/config/environment';

interface ApproveReturn {
  Applied: boolean;
  Code: number;
  Ret: string;
}

interface ProposeReturn {
  Applied: boolean;
  Code: number;
  Ret: string;
  TxnID: number;
}

interface StateWaitMsgResponse {
  Height: number;
  Message: {
    '/': string;
  };
  Receipt: {
    EventsRoot: string | null;
    ExitCode: number;
    GasUsed: number;
    Return: string;
  };
  ReturnDec: ApproveReturn | ProposeReturn;
  TipSet: Array<{
    '/': string;
  }>;
}

type FilecoinRpcSchema = [
  {
    Method: 'Filecoin.StateWaitMsg';
    Parameters: [
      {
        '/': string;
      },
      number,
      number,
      boolean,
    ];
    ReturnType: StateWaitMsgResponse;
  },
];

export interface IFilecoinClient {
  waitMsg: (
    cid: string,
    confidence: number,
    limitChainEpoch: number,
    allowReplaced: boolean,
  ) => Promise<StateWaitMsgResponse | string | null>;
}

export class FilecoinClient implements IFilecoinClient {
  private readonly client;

  constructor() {
    this.client = createPublicClient({
      chain: process.env.NEXT_PUBLIC_APP_ENV === 'production' ? filecoin : filecoinCalibration,
      rpcSchema: rpcSchema<FilecoinRpcSchema>(),
      transport: http(env.rpcUrl),
    });
  }

  public async waitMsg(
    cid: string,
    confidence = 1,
    limitChainEpoch = 10,
    allowReplaced = true,
  ): Promise<StateWaitMsgResponse | string | null> {
    const waitMsg = await this.client.request({
      method: 'Filecoin.StateWaitMsg',
      params: [
        {
          '/': cid,
        },
        confidence,
        limitChainEpoch,
        allowReplaced,
      ],
    });

    return waitMsg;
  }
}
