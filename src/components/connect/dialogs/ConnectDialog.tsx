import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Users, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useAccount } from '@/hooks';

interface ConnectDialogProps {
  onClose: () => void;
}

type Step = 'select-role' | 'select-provider';
type Role = 'root' | 'meta-allocator';
type Provider = 'metamask' | 'filsnap' | 'ledger';

interface StepConfig {
  title: string;
  description: string;
  canGoBack: boolean;
}

export default function ConnectDialog({ onClose }: ConnectDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>('select-role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect: connectFilsnap } = useAccount();
  const { connect: connectMetamask, isPending, status, error } = useConnect();
  const { toast } = useToast();
  const hasConnectedRef = useRef(false);

  const stepConfigs: Record<Step, StepConfig> = {
    'select-role': {
      title: 'Select Your Role',
      description: 'Choose your role to continue',
      canGoBack: false,
    },
    'select-provider': {
      title: 'Connect Wallet',
      description:
        selectedRole === 'root'
          ? 'Connect using MetaMask Snap or Ledger'
          : 'Connect using MetaMask',
      canGoBack: true,
    },
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setCurrentStep('select-provider');
  };

  const handleProviderSelect = async (provider: Provider) => {
    setIsConnecting(true);

    try {
      if (provider === 'filsnap') {
        await connectFilsnap('filsnap');
        onClose();
      } else if (provider === 'metamask' && !hasConnectedRef.current) {
        hasConnectedRef.current = true;
        await connectMetamask({ connector: injected() });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      onClose();
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (status === 'success') {
      toast({
        title: 'Connection Successful',
        description: 'Successfully connected to wallet',
        variant: 'default',
      });
      onClose();
    } else if (status === 'error' && error) {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect',
        variant: 'destructive',
      });
      onClose();
    }
  }, [status, error]);

  const currentConfig = stepConfigs[currentStep];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">{currentConfig.title}</h2>
          <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
        </div>
        {currentConfig.canGoBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep('select-role')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      {isConnecting || isPending ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Connecting to wallet...</p>
        </div>
      ) : currentStep === 'select-role' ? (
        <div className="flex gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Root Key Holder
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[72px]">
              <p className="text-sm text-muted-foreground">
                Root key holders can manage verifiers and datacap allocations at the highest level.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleRoleSelect('root')}>
                Connect as Root
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Meta Allocator
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[72px]">
              <p className="text-sm text-muted-foreground">
                Meta allocators can manage datacap allocations for specific regions or use cases.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleRoleSelect('meta-allocator')}>
                Connect as Allocator
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4">
          {selectedRole === 'root' ? (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleProviderSelect('filsnap')}
              >
                Connect with MetaMask Snap
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleProviderSelect('ledger')}
              >
                Connect with Ledger
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleProviderSelect('metamask')}
            >
              Connect with MetaMask
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
