export type FilecoinAddress = `${'f' | 't'}${'0' | '1' | '2' | '3' | '4'}${string}`;

export const filecoinAddresRegex = /^[f|t]{1}[0-4]{1}[A-Za-z0-9]+$/;

export function isFilecoinAddress(input: unknown): input is FilecoinAddress {
  return typeof input === 'string' && filecoinAddresRegex.test(input);
}

export function isPlainObject(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === 'object' && !Array.isArray(input);
}
