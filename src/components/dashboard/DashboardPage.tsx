'use client';

import { Suspense, useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard';
import Account from '@/components/account/Account';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { DashboardBreadcrumb } from '@/components/dashboard/DashboardBreadcrumb';
import { env } from '@/config/environment';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RefreshAllocatorSection } from '@/components/refresh/RefreshAllocatorSection';
import { AccountRole } from '@/types/account';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { availableFilters, DashboardTabs } from '@/components/dashboard/constants';
import { useAccountRole } from '@/hooks';
import { CompletedApplicationsPanel } from './completed-applications/CompletedApplicationsPanel';
import { NewApplicationsPanel } from './new-applications/NewApplicationsPanel';
import { RefreshesPanel } from './refreshes/RefreshesPanel';

/**
 * DashboardPage component
 * Renders the main dashboard page with sidebar, header, and applications panel
 */
export function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [tab, setTab] = useState<DashboardTabs>(DashboardTabs.NEW_APPLICATIONS);
  const role = useAccountRole();

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Applications', href: '/dashboard' },
  ];

  const handleFilterChange = (filter: string, checked: boolean) => {
    if (checked) {
      setActiveFilters(prev => [...prev, filter]);
    } else {
      setActiveFilters(prev => prev.filter(f => f !== filter));
    }
  };

  useEffect(() => {
    setSearchTerm('');
    setActiveFilters([]);
  }, [tab]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <DashboardBreadcrumb items={breadcrumbItems} />
        {env.useTestData && (
          <div className="bg-yellow-100 p-2 text-yellow-800">
            Using test data in {env.apiBaseUrl} environment
          </div>
        )}
        <div className="relative ml-auto flex-1 md:grow-0"></div>

        <Account />

        {role === AccountRole.ROOT_KEY_HOLDER || role === AccountRole.INDIRECT_ROOT_KEY_HOLDER ? (
          <RefreshAllocatorSection />
        ) : null}

        <Button variant="outline">
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            <Link
              href="https://airtable.com/appVmASv3V2GIds6v/pagI08VGIVczU97wK/form"
              target="_blank"
            >
              Apply To Become An Allocator
            </Link>
          </span>
        </Button>
      </header>

      <DashboardHeader
        availableFilters={availableFilters[tab]}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs value={tab} onValueChange={value => setTab(value as DashboardTabs)}>
          <TabsList className="w-full mt-4">
            <TabsTrigger className="flex-1" value={DashboardTabs.NEW_APPLICATIONS}>
              New Applications
            </TabsTrigger>
            <TabsTrigger className="flex-1" value={DashboardTabs.COMPLETED_APPLICATIONS}>
              Completed Applications
            </TabsTrigger>
            <TabsTrigger className="flex-1" value={DashboardTabs.REFRESHES}>
              Refreshes
            </TabsTrigger>
          </TabsList>

          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <ScaleLoader />
              </div>
            }
          >
            <TabsContent value={DashboardTabs.NEW_APPLICATIONS}>
              <NewApplicationsPanel searchTerm={searchTerm} activeFilters={activeFilters} />
            </TabsContent>
            <TabsContent value={DashboardTabs.COMPLETED_APPLICATIONS}>
              <CompletedApplicationsPanel searchTerm={searchTerm} activeFilters={activeFilters} />
            </TabsContent>
            <TabsContent value={DashboardTabs.REFRESHES}>
              <RefreshesPanel searchTerm={searchTerm} />
            </TabsContent>
          </Suspense>
        </Tabs>
      </main>
    </>
  );
}
