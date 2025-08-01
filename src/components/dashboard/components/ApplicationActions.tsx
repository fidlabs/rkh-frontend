import { Button } from '@/components/ui/button';
import { Application } from '@/types/application';
import { CopyIcon, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function ApplicationActions({ application }: { application: Application }) {
  const { toast } = useToast();

  return (
    <div className="flex items-center">
      <Button aria-haspopup="true" size="icon" variant="ghost">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <CopyIcon
        className="h-4 w-4 ml-2 cursor-pointer"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(application.id);
            toast({
              title: 'Application ID copied',
              description: 'The application ID has been copied to the clipboard.',
            });
          } catch (err) {
            console.error('Failed to copy text: ', err);
          }
        }}
      />
    </div>
  );
}
