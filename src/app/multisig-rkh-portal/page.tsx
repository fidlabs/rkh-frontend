'use client';

import dynamic from 'next/dynamic';

const MultisigRkhPortalComponent = dynamic(() =>
  import('@/components/multisig-rkh-portal').then(mod => mod.MultisigRkhPortalPage),
);

export default function MultisigRkhPortalPage() {
  return <MultisigRkhPortalComponent />;
}
