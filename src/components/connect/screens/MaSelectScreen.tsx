import { MetaAllocator } from '@/types/ma';
import { Button } from '@/components/ui/button';
import { useMaAddresses } from '@/hooks';
import { Loader2 } from 'lucide-react';

interface MaSelectScreenProps {
  onMaSelect: (ma: MetaAllocator) => void;
}

export const MaSelectScreen = ({ onMaSelect }: MaSelectScreenProps) => {
  const { data: maAddresses, isLoading: isLoadingMaAddresses } = useMaAddresses();

  if (isLoadingMaAddresses) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="animate-spin" />
        <span>Loading meta allocators...</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {maAddresses?.map((ma: MetaAllocator) => (
        <Button
          variant="outline"
          className="w-full"
          key={ma.ethAddress}
          onClick={() => onMaSelect(ma)}
        >
          {ma.name}
        </Button>
      ))}
    </div>
  );
};
