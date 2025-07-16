import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { useAccount } from '@/hooks';

interface FilsnapConnectionScreenProps {
  onConnect: () => void;
  onError: () => void;
}

export const FilsnapConnectionScreen = ({ onConnect, onError }: FilsnapConnectionScreenProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect } = useAccount();
  const { toast } = useToast();

  const handleFilsnapConnect = async () => {
    setIsConnecting(true);

    try {
      await connect('filsnap');
      onConnect();
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
      onError();
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    handleFilsnapConnect();
  }, []);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Connecting to MetaMask via Filsnap...</p>
      </div>
    );
  }

  return (
    <>
      <p>Connection successful</p>
    </>
  );
};
