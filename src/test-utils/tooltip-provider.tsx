import { TooltipProvider } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

export const createTooltipProviderWrapper = () => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TooltipProvider>{children}</TooltipProvider>
  );
  Wrapper.displayName = 'TooltipTestWrapper';

  return Wrapper;
};
