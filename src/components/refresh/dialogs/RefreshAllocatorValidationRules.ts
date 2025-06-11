import { RegisterOptions } from 'react-hook-form'

export interface FormFields {
  allocatorAddress: string
  dataCap: number
  githubIssue?: number
}

export const validationRules = {
  allocatorAddress: (): RegisterOptions<FormFields, 'allocatorAddress'> => ({
    required: { value: true, message: 'Allocator address is required' },
    pattern: { value: /^f[0-4][a-zA-Z0-9]*$/, message: 'Allocator address should start with "f"' },
  }),

  dataCap: (): RegisterOptions<FormFields, 'dataCap'> => ({
    required: { value: true, message: 'Data Cap is required' },
    min: { value: 1, message: 'Data Cap must be at least 1' },
    max: { value: Number.MAX_SAFE_INTEGER, message: 'Value is too high' },
  }),

  githubIssue: (): RegisterOptions<FormFields, 'githubIssue'> => ({
    min: { value: 1, message: 'Github issue number should be at least 1' },
    max: { value: Number.MAX_SAFE_INTEGER, message: 'Value is too high' },
  }),
}
