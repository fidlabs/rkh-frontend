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
import { MetaAllocator } from '@/types/ma';
import { MaSelectScreen } from './screens/MaSelectScreen';

interface StepConfig {
  title: string;
  description: string;
  canGoBack: boolean;
  body?: React.ReactElement;
}

interface ConnectWalletDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleClose: () => void;
}

export function ConnectWalletDialog({ isOpen, setIsOpen, handleClose }: ConnectWalletDialogProps) {
  const [currentStep, setCurrentStep] = useState<DialogStep>(DialogStep.SELECT_ROLE);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>();
  const [selectedMa, setSelectedMa] = useState<MetaAllocator | undefined>();

  const handleMaSelect = (ma: MetaAllocator) => {
    setSelectedMa(ma);
    setCurrentStep(DialogStep.SELECT_PROVIDER);
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'meta-allocator') {
      setCurrentStep(DialogStep.SELECT_MA);
    } else {
      setCurrentStep(DialogStep.SELECT_PROVIDER);
    }
  };

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    setCurrentStep(DialogStep.CONNECT_WALLET);
  };

  const handleConnect = () => {
    console.log('connect');
    setCurrentStep(DialogStep.SELECT_ROLE);
    setSelectedRole(undefined);
    setSelectedProvider(undefined);

    handleClose();
  };

  const handleError = () => {
    handleClose();

    setCurrentStep(DialogStep.SELECT_ROLE);
    setSelectedRole(undefined);
    setSelectedProvider(undefined);
  };

  const STEP_CONFIGS: Record<DialogStep, StepConfig> = {
    [DialogStep.SELECT_ROLE]: {
      title: 'Select Role',
      description: 'Please select a role to continue.',
      canGoBack: false,
      body: <RoleSelectionScreen onRoleSelect={handleRoleSelect} />,
    },
    [DialogStep.SELECT_PROVIDER]: {
      title: 'Select Provider',
      description: 'Please select a provider to continue.',
      canGoBack: true,
      body: (
        <ProviderSelectionScreen
          role={selectedRole || 'meta-allocator'}
          onProviderSelect={handleProviderSelect}
        />
      ),
    },
    [DialogStep.SELECT_MA]: {
      title: 'Select Meta Allocator',
      description: 'Please select a meta allocator to continue.',
      canGoBack: true,
      body: <MaSelectScreen onMaSelect={handleMaSelect} />,
    },
    [DialogStep.CONNECT_WALLET]: {
      title: 'Connect Wallet',
      description: 'Please connect your wallet to continue.',
      canGoBack: true,
      body: (
        <WalletConnectionScreen
          provider={selectedProvider || ''}
          ma={selectedMa}
          onConnect={handleConnect}
          onError={handleError}
        />
      ),
    },
  };

  const currentConfig = STEP_CONFIGS[currentStep];

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
              <Button
                variant="ghost"
                size="sm"
                aria-label="back"
                onClick={() => setCurrentStep(DialogStep.SELECT_ROLE)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {currentConfig.title}
          </DialogTitle>
          <DialogDescription>{currentConfig.description}</DialogDescription>
        </DialogHeader>
        {currentConfig.body}
      </DialogContent>
    </Dialog>
  );
}
