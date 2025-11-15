'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CircleAlert, CircleCheck, CircleXIcon, Loader2, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

interface DialogLoadingCardProps {
  loadingMessage?: string | null;
}

interface DialogErrorProps {
  onGoBack: () => void;
  onClose: () => void;
  errorMessage?: string | null;
}

interface DialogSuccessCardProps {
  onClose: () => void;
  children: React.ReactNode;
}

interface DialogConfirmationCardProps {
  message: string;
  onConfirm: () => void;
  onGoBack: () => void;
}

function DialogLoadingCard({ loadingMessage }: DialogLoadingCardProps) {
  const message = loadingMessage || 'Loading...';

  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p data-testid="loading-message">{message}</p>
    </div>
  );
}

function DialogSuccessCard({ onClose, children }: DialogSuccessCardProps) {
  return (
    <>
      <div
        data-testid="success-header"
        className="flex flex-col items-center pt-4 pb-4 min-w-48 text-xl text-green-600"
      >
        <CircleCheck size="60px" /> Success!
      </div>
      {children}
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
}

function DialogErrorCard({ onGoBack, onClose, errorMessage }: DialogErrorProps) {
  const message = errorMessage || 'An unknown error occurred.';

  return (
    <>
      <div
        data-testid="error-header"
        className="flex flex-col items-center pt-4 pb-4 min-w-48 text-xl text-red-500"
      >
        <CircleXIcon size="60px" /> Error
      </div>

      <div data-testid="error-message" className="text-sm pb-4 text-center">
        {message}
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onGoBack}>
          Go back
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
}

function DialogConfirmationCard({ message, onConfirm, onGoBack }: DialogConfirmationCardProps) {
  return (
    <>
      <div
        data-testid="confirmation-header"
        className="flex flex-col items-center pt-4 pb-4 min-w-48 text-xl text-blue-500"
      >
        <CircleAlert size="60px" />
      </div>

      <div data-testid="confirmation-message" className="text-sm pb-4 text-center">
        {message}
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onGoBack}>
          Go back
        </Button>
        <Button variant="outline" onClick={onConfirm}>
          Confirm
        </Button>
      </DialogFooter>
    </>
  );
}
DialogConfirmationCard.displayName = 'DialogConfirmationCard';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogLoadingCard,
  DialogErrorCard,
  DialogSuccessCard,
  DialogConfirmationCard,
};
