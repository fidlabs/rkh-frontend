'use client';

import dynamic from 'next/dynamic';

const DashboardComponent = dynamic(() =>
  import('@/components/dashboard').then(mod => mod.DashboardPage),
);

export default function DashboardPage() {
  return <DashboardComponent />;
}
