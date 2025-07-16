import React, { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface MetamaskDialogProps {
  onClose: () => void;
}

export default function MetamaskDialog({ onClose }: MetamaskDialogProps) {
  const { connect, isPending, status, error } = useConnect();
  const { toast } = useToast();

  const hasConnectedRef = useRef(false);

  const handleMetamaskConnect = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to MetaMask',
        variant: 'destructive',
      });
    }
  };

  // Trigger connection only once, ignoring re-renders
  useEffect(() => {
    if (!hasConnectedRef.current) {
      handleMetamaskConnect();
      hasConnectedRef.current = true;
    }
  }, []);

  // Close dialog when connection is successful
  useEffect(() => {
    if (status === 'success') {
      toast({
        title: 'Connection Successful',
        description: 'Successfully connected to MetaMask',
        variant: 'default',
      });
      // onClose();
    } else if (status === 'error' && error) {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to MetaMask',
        variant: 'destructive',
      });
      // onClose();
    }
  }, [status]);

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Connecting to MetaMask...';
      default:
        return 'Initializing connection...';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {isPending && <Loader2 className="h-8 w-8 animate-spin" />}
      <p>{getStatusMessage()}</p>
    </div>
  );
}
