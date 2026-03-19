import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const SwitcherRoot = ToggleGroup.Root;
const SwitcherItem = ToggleGroup.Item;

const switcherRootVariants = cva('flex rounded-md border', {
  variants: {
    error: {
      true: 'border-red-500',
      false: 'border-gray-200',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    error: false,
    disabled: false,
  },
});

type SwitcherOption<T extends string = string> = {
  label: string;
  value: T;
};

type SwitcherProps<T extends string = string> = {
  options: SwitcherOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  className?: string;
};

const Switcher = React.forwardRef<HTMLDivElement, SwitcherProps>(
  ({ options, value, defaultValue, onChange, onBlur, disabled, error, id, className }, ref) => {
    return (
      <SwitcherRoot
        ref={ref}
        type="single"
        id={id}
        value={value}
        onValueChange={val => {
          if (val) onChange?.(val);
        }}
        onBlur={onBlur}
        disabled={disabled}
        defaultValue={defaultValue}
        className={cn(switcherRootVariants({ error, disabled }), className)}
      >
        {options.map(option => (
          <SwitcherItem
            key={option.value}
            value={option.value}
            className={cn(
              'flex-1 flex items-center justify-center',
              'px-4 py-2 text-sm font-medium transition-colors',
              'first:rounded-l-md last:rounded-r-md',
              'data-[state=on]:bg-primary data-[state=on]:text-white',
              'data-[state=off]:bg-white data-[state=off]:text-gray-600',
              'hover:bg-gray-50 data-[state=on]:hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
          >
            {option.label}
          </SwitcherItem>
        ))}
      </SwitcherRoot>
    );
  },
);

Switcher.displayName = 'Switcher';

export { Switcher };
