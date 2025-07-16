import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Users } from 'lucide-react';
import LedgerDialog from './LedgerDialog';
import FilsnapDialog from './FilsnapDialog';
import MetamaskDialog from './MetamaskDialog';

interface SelectRoleDialogProps {
  onClose: () => void;
}

type DialogState = 'select-role' | 'connect-wallet';
type Role = 'root' | 'meta-allocator';

export default function SelectRoleDialog({ onClose }: SelectRoleDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>('select-role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setDialogState('connect-wallet');
  };

  if (dialogState === 'connect-wallet') {
    if (selectedProvider) {
      switch (selectedProvider) {
        case 'ledger':
          return <LedgerDialog onClose={onClose} />;
        case 'filsnap':
          return <FilsnapDialog onClose={onClose} />;
        case 'metamask':
          return <MetamaskDialog onClose={onClose} />;
      }
    }

    return (
      <div className="space-y-4">
        <Button variant="ghost" className="mb-4" onClick={() => setDialogState('select-role')}>
          ← Back to role selection
        </Button>
        <div className="grid gap-4">
          {selectedRole === 'root' ? (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedProvider('filsnap')}
              >
                Connect with MetaMask Snap
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedProvider('ledger')}
              >
                Connect with Ledger
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedProvider('metamask')}
            >
              Connect with MetaMask
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
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
            Connect as RKH
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
            Connect as Meta Allocator
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
