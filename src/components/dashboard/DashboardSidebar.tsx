import Link from 'next/link';
import { ArrowLeftIcon, ShieldIcon, UsersIcon } from 'lucide-react';

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Fil+</span>
        </Link>
        
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground md:h-8 md:w-8"
          title="Dashboard"
        >
          <ShieldIcon className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Dashboard</span>
        </Link>

        <Link
          href="/multisig-rkh-portal"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground md:h-8 md:w-8"
          title="Multisig RKH Portal"
        >
          <UsersIcon className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Multisig RKH Portal</span>
        </Link>
      </nav>
    </aside>
  );
}
