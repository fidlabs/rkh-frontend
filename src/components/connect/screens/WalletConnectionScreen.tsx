import { useToast } from '@/components/ui/use-toast';
import { FilsnapConnectionScreen } from './FilsnapConnectionScreen';
import { LedgerConnectionScreen } from './LedgerConnectionScreen';
import { MetamaskConnectionScreen } from './MetamaskConnectionScreen';
import { MetaAllocator } from '@/types/ma';
import { useEffect } from 'react';

interface WalletConnectionScreenProps {
  provider: string;
  onConnect: () => void;
  onError: () => void;
  ma?: MetaAllocator;
}

export const WalletConnectionScreen = ({
  provider,
  onConnect,
  onError,
  ma,
}: WalletConnectionScreenProps) => {
  const { toast } = useToast();

  const handleError = () => {
    toast({
      title: 'Connection Failed',
      description: 'There was an error connecting your wallet. Please try again.',
      variant: 'destructive',
    });
    onError();
  };

  switch (provider) {
    case 'metamask':
      return <MetamaskConnectionScreen onConnect={onConnect} ma={ma} />;
    case 'filsnap':
      return <FilsnapConnectionScreen onConnect={onConnect} onError={handleError} />;
    case 'ledger':
      return <LedgerConnectionScreen onConnect={onConnect} onError={handleError} />;
    default:
      return <>Unknown provider</>;
  }
};
