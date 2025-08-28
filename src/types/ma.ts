export interface MetaAllocator {
  name: string;
  signers: string[];
  ethAddress: string;
  ethSafeAddress: string;
  filAddress: string;
  filSafeAddress: string;
}

export interface MaAddressesResponse {
  data: MetaAllocator[];
  message: string;
  status: string;
}

export enum MetaAllocatorName {
  MDMA = 'MDMA',
  ORMA = 'ORMA',
  AMA = 'AMA',
}
