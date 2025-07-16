import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useAccount } from '@/hooks';

interface FilsnapDialogProps {
  onClose: () => void;
}

export default function FilsnapDialog({ onClose }: FilsnapDialogProps) {
  const { connect } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleFilsnapConnect = async () => {
    setIsConnecting(true);

    try {
      await connect('filsnap');
      onClose();
    } catch (error) {
      console.error('Filsnap connection error:', error);
      toast({
        title: 'Connection Failed',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
      onClose(); // Close the dialog on error
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
        <p>Connecting to Metamask...</p>
      </div>
    );
  }

  return null;
}
