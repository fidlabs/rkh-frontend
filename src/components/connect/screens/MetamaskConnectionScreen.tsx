import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { useAccount } from '@/hooks';
import { MetaAllocator } from '@/types/ma';

interface MetamaskConnectionScreenProps {
  onConnect: () => void;
  metaAllocator?: MetaAllocator;
}

export const MetamaskConnectionScreen = ({
  onConnect,
  metaAllocator,
}: MetamaskConnectionScreenProps) => {
  const { account, connect } = useAccount();

  useEffect(() => {
    if (account) {
      onConnect();
    } else {
      connect('metamask', 0, metaAllocator);
    }
  }, [account]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p>Connecting to MetaMask...</p>
    </div>
  );
};
