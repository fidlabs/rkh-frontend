'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogStep, Role } from './types';
import { RoleSelectionScreen } from './screens/RoleSelectionScreen';
import { ProviderSelectionScreen } from './screens/ProviderSelectionScreen';
import { WalletConnectionScreen } from './screens/WalletConnectionScreen';

interface StepConfig {
  title: string;
  description: string;
  canGoBack: boolean;
}

const STEP_CONFIGS: Record<DialogStep, (role?: Role) => StepConfig> = {
  'select-role': () => ({
    title: 'Select Role',
    description: 'Please select a role to continue.',
    canGoBack: false,
  }),
  'select-provider': () => ({
    title: 'Select Provider',
    description: 'Please select a provider to continue.',
    canGoBack: true,
  }),
  'connect-wallet': () => ({
    title: 'Connect Wallet',
    description: 'Please connect your wallet to continue.',
    canGoBack: true,
  }),
};

interface ConnectWalletDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleClose: () => void;
}

export function ConnectWalletDialog({ isOpen, setIsOpen, handleClose }: ConnectWalletDialogProps) {
  const [currentStep, setCurrentStep] = useState<DialogStep>('select-role');
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setCurrentStep('select-provider');
  };

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    setCurrentStep('connect-wallet');
  };

  const handleConnect = () => {
    setCurrentStep('select-role');
    setSelectedRole(undefined);
    setSelectedProvider(undefined);

    handleClose();
  };

  const handleError = () => {
    handleClose();

    setCurrentStep('select-role');
    setSelectedRole(undefined);
    setSelectedProvider(undefined);
  };

  const currentConfig = STEP_CONFIGS[currentStep](selectedRole);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentConfig.canGoBack && (
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep('select-role')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {currentConfig.title}
          </DialogTitle>
          <DialogDescription>{currentConfig.description}</DialogDescription>
        </DialogHeader>
        {currentStep === 'select-role' ? (
          <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
        ) : currentStep === 'select-provider' && selectedRole ? (
          <ProviderSelectionScreen role={selectedRole} onProviderSelect={handleProviderSelect} />
        ) : selectedProvider ? (
          <WalletConnectionScreen
            provider={selectedProvider}
            onConnect={handleConnect}
            onError={handleError}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
