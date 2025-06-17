import { RegisterOptions } from 'react-hook-form';
import { filecoinAddresRegex } from '@/types/filecoin';

export interface FormFields {
  allocatorAddress: string;
  dataCap: number;
  githubIssue?: number;
}

export const validationRules = {
  allocatorAddress: (): RegisterOptions<FormFields, 'allocatorAddress'> => ({
    required: { value: true, message: 'Allocator address is required' },
    pattern: { value: filecoinAddresRegex, message: 'Allocator address have wrong format' },
  }),

  dataCap: (): RegisterOptions<FormFields, 'dataCap'> => ({
    required: { value: true, message: 'Data Cap is required' },
    min: { value: 1, message: 'Data Cap must be at least 1' },
    max: { value: Number.MAX_SAFE_INTEGER, message: 'Value is too high' },
  }),
};
