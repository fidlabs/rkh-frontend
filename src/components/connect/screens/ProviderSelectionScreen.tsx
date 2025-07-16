import { Button } from '@/components/ui/button';

import { Role } from '../types';

interface ProviderSelectionScreenProps {
  role: Role;
  onProviderSelect: (provider: string) => void;
}

export const ProviderSelectionScreen = ({
  role,
  onProviderSelect,
}: ProviderSelectionScreenProps) => {
  return (
    <div className="grid gap-4">
      {role === 'root' ? (
        <>
          <Button variant="outline" className="w-full" onClick={() => onProviderSelect('ledger')}>
            Ledger
          </Button>
          <Button variant="outline" className="w-full" onClick={() => onProviderSelect('filsnap')}>
            MetaMask Snap
          </Button>
        </>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => onProviderSelect('metamask')}>
          MetaMask
        </Button>
      )}
    </div>
  );
};
