'use client';

import { Suspense, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard';
import Account from '@/components/account/Account';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { DashboardBreadcrumb } from '@/components/dashboard/DashboardBreadcrumb';
import { env } from '@/config/environment';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AccountRole } from '@/types/account';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { availableFilters, MultisigRkhPortalTabs } from './constants';
import { useAccountRole } from '@/hooks';
import { SignerManagementPanel } from './signer-management/SignerManagementPanel';
import { AllocatorProposalsPanel } from './allocator-proposals/AllocatorProposalsPanel';
import { MyProposalsPanel } from './my-proposals/MyProposalsPanel';

/**
 * MultisigRkhPortalPage component
 * Renders the multisig RKH portal page with signer management and allocator proposals
 */
export function MultisigRkhPortalPage() {
  const [tab, setTab] = useState<MultisigRkhPortalTabs>(MultisigRkhPortalTabs.SIGNER_MANAGEMENT);
  const role = useAccountRole();

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Multisig RKH Portal', href: '/multisig-rkh-portal' },
  ];

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

        <Button variant="outline">
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </span>
        </Button>
      </header>



      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs value={tab} onValueChange={value => setTab(value as MultisigRkhPortalTabs)}>
          <TabsList className="w-full mt-4">
            <TabsTrigger className="flex-1" value={MultisigRkhPortalTabs.SIGNER_MANAGEMENT}>
              Signer Management
            </TabsTrigger>
            <TabsTrigger className="flex-1" value={MultisigRkhPortalTabs.ALLOCATOR_PROPOSALS}>
              Allocator Proposals
            </TabsTrigger>
            <TabsTrigger className="flex-1" value={MultisigRkhPortalTabs.MY_PROPOSALS}>
              My Proposals
            </TabsTrigger>
          </TabsList>

          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <ScaleLoader />
              </div>
            }
          >
            <TabsContent value={MultisigRkhPortalTabs.SIGNER_MANAGEMENT}>
              <SignerManagementPanel />
            </TabsContent>
            <TabsContent value={MultisigRkhPortalTabs.ALLOCATOR_PROPOSALS}>
              <AllocatorProposalsPanel />
            </TabsContent>
            <TabsContent value={MultisigRkhPortalTabs.MY_PROPOSALS}>
              <MyProposalsPanel />
            </TabsContent>
          </Suspense>
        </Tabs>
      </main>
    </>
  );
}
