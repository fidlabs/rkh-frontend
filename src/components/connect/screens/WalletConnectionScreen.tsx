import { useToast } from '@/components/ui/use-toast';
import { FilsnapConnectionScreen } from './FilsnapConnectionScreen';
import { LedgerConnectionScreen } from './LedgerConnectionScreen';
import { MetamaskConnectionScreen } from './MetamaskConnectionScreen';
import { MetaAllocator } from '@/types/ma';

interface WalletConnectionScreenProps {
  provider: string;
  onConnect: () => void;
  onError: () => void;
  metaAllocator?: MetaAllocator;
}

export const WalletConnectionScreen = ({
  provider,
  onConnect,
  onError,
  metaAllocator,
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
      return <MetamaskConnectionScreen onConnect={onConnect} metaAllocator={metaAllocator} />;
    case 'filsnap':
      return <FilsnapConnectionScreen onConnect={onConnect} onError={handleError} />;
    case 'ledger':
      return <LedgerConnectionScreen onConnect={onConnect} onError={handleError} />;
    default:
      return <>Unknown provider</>;
  }
};
