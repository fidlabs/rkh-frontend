import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

import { cn } from '@/lib/utils';
import Account from '../account/Account';

export interface MainNavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

interface NavbarProps {
  items?: MainNavItem[];
}

export function Navbar({ items }: NavbarProps) {
  const segment = useSelectedLayoutSegment();

  return (
    <header className="fixed top-0 z-40 w-full">
      <div className="flex h-16 items-center justify-between p-4">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <span className="hidden font-bold sm:inline-block">Fil+</span>
          </Link>

          {items?.length ? (
            <nav className="hidden gap-6 md:flex">
              {items?.map((item, index) => (
                <Link
                  key={index}
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm',
                    item.href.startsWith(`/${segment}`) ? 'text-foreground' : 'text-foreground/60',
                    item.disabled && 'cursor-not-allowed opacity-80',
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex gap-4 items-center">
          <Account />
        </div>
      </div>
    </header>
  );
}
