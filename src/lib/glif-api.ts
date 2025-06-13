import { FilecoinClient } from './filecoin-client';
import { ApiStateWaitMsgResponse } from '@/types/filecoin-client';

const filecoinClient = new FilecoinClient();

/**
 * Wait for a message to appear on chain and get it.
 *
 * @param {string} cid - Transaction CID.
 * @returns {Promise<ApiStateWaitMsgResponse>} ApiStateWaitMsgResponse - The response from the API.
 */
export const getStateWaitMsg = async (cid: string): Promise<ApiStateWaitMsgResponse> => {
  try {
    const confidence = 1;
    const limitChainEpoch = 10;
    const allowReplaced = true;

    const result = await filecoinClient.waitMsg(cid, confidence, limitChainEpoch, allowReplaced);

    return {
      data: result ?? '',
      error: '',
      success: true,
    };
  } catch (error: unknown) {
    const errMessage = `Error accessing GLIF API Filecoin.StateWaitMsg: ${
      (error as Error).message
    }`;

    if (errMessage.includes('too long')) {
      return await getStateWaitMsg(cid);
    }
    return {
      data: '',
      error: errMessage,
      success: false,
    };
  }
};
