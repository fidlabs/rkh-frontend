import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFilecoinAmount(amount: string): string {
  // Convert from attoFIL to FIL (1 FIL = 10^18 attoFIL)
  const attoFil = BigInt(amount);
  const fil = Number(attoFil) / Math.pow(10, 18);

  if (fil >= 1) {
    return `${fil.toFixed(6)} FIL`;
  } else {
    return `${(fil * 1000).toFixed(3)} mFIL`;
  }
}
