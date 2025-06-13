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

export interface ApiStateWaitMsgResponse {
  error: string;
  success: boolean;
  data:
    | {
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
    | string;
}
