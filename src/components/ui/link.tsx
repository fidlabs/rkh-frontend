import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import NextLink from 'next/link';
import React from 'react';

const linkVariants = cva(
  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-blue-600 hover:text-blue-800',
        filled:
          'whitespace-nowrap rounded-md text-sm font-medium ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2',
        underline: 'text-blue-600 hover:text-blue-800 underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
export interface LinkProps
  extends React.ComponentPropsWithoutRef<typeof NextLink>,
    VariantProps<typeof linkVariants> {}

const Link = React.forwardRef<React.ElementRef<typeof NextLink>, LinkProps>(
  ({ className, children, variant, ...props }, ref) => {
    return (
      <NextLink {...props} ref={ref} className={cn(linkVariants({ variant }), className)}>
        {children}
      </NextLink>
    );
  },
);

Link.displayName = 'Link';

export { Link };
