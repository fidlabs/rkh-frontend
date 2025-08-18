'use client';

import React, { useState } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAccount } from '@/hooks';
import { Application } from '@/types/application';

interface SignRkhTransactionButtonProps {
  application: Application;
  text: string;
}

export default function SignRkhTransactionButton({
  application,
  text,
}: SignRkhTransactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { account, proposeAddVerifier, acceptVerifierProposal } = useAccount();
  const { toast } = useToast();

  const proposeTransaction = async () => {
    setIsPending(true);
    try {
      const messageId = await proposeAddVerifier(application.address, application.datacap);
      toast({
        title: 'RKH Transaction Proposed',
        description: `Transaction proposed with message id: ${messageId}`,
      });
    } catch (error) {
      console.error('Error proposing verifier:', error);
      toast({
        title: 'Error',
        description: 'Failed to propose verifier',
        variant: 'destructive',
      });
    }
    setIsPending(false);
    setIsOpen(false);
  };

  const approveTransaction = async () => {
    setIsPending(true);
    try {
      const messageId = await acceptVerifierProposal(
        application.address,
        application.datacap,
        application.rkhApprovals ? application.rkhApprovals[0] : '',
        application.rkhMessageId ?? 0,
      );
      toast({
        title: 'RKH Transaction Approved',
        description: `Transaction approved with message id: ${messageId}`,
      });
    } catch (error) {
      console.error('Error accepting verifier proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept verifier proposal',
        variant: 'destructive',
      });
    }
    setIsPending(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        className="w-[150px]"
        disabled={!account?.isConnected || isPending}
        onClick={() => setIsOpen(true)}
      >
        {text}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Transaction</DialogTitle>
          <DialogDescription>
            Signing a RKH transaction to add a datacap allocator.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center p-8">
          {isPending && <ScaleLoader />}
          {!isPending && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow key="verifier">
                  <TableCell>{'Verifier'}</TableCell>
                  <TableCell>
                    {application.actorId}
                    <a
                      href={`https://filscan.io/en/address/${application.actorId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-block align-middle"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </TableCell>
                </TableRow>
                <TableRow key="datacap">
                  <TableCell>{'DataCap'}</TableCell>
                  <TableCell>{application.datacap} PiB</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
        <div className="flex justify-center">
          <Button
            className="w-[150px]"
            disabled={isPending}
            onClick={() => {
              if (application.rkhApprovals && application.rkhApprovals.length > 0) {
                approveTransaction();
              } else {
                proposeTransaction();
              }
            }}
          >
            {isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
