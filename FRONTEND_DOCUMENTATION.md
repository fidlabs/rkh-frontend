# Apply.Allocator.Tech - Frontend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Core Components](#core-components)
5. [State Management](#state-management)
6. [Wallet Integration](#wallet-integration)
7. [Routing & Navigation](#routing--navigation)
8. [UI/UX Design System](#uiux-design-system)
9. [API Integration](#api-integration)
10. [Testing Strategy](#testing-strategy)
11. [Build & Deployment](#build--deployment)
12. [Development Guide](#development-guide)

## Overview

The frontend application is built with Next.js 14 and provides a comprehensive interface for managing Filecoin Plus DataCap allocations. It supports multiple user roles with different interfaces and capabilities.

### Key Features
- **Multi-role Dashboard**: Different interfaces for applicants, governance team, RKH, and meta allocators
- **Wallet Integration**: Support for Ledger, Filsnap, and MetaMask wallets
- **Real-time Updates**: Live application status and proposal tracking
- **Multisig Portal**: Advanced RKH multisig management interface
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Project Structure

```
rkh-frontend/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── dashboard/          # Main dashboard pages
│   │   ├── multisig-rkh-portal/ # RKH multisig operations
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── providers.tsx       # Context providers
│   ├── components/             # Reusable UI components
│   │   ├── account/            # Account management
│   │   ├── branding/           # Branding components
│   │   ├── connect/            # Wallet connection
│   │   ├── dashboard/          # Dashboard components
│   │   ├── multisig-rkh-portal/ # RKH portal components
│   │   ├── refresh/            # Refresh operations
│   │   ├── sign/               # Transaction signing
│   │   └── ui/                 # Base UI components
│   ├── config/                 # Configuration files
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── providers/              # Context providers
│   ├── test-utils/             # Testing utilities
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── vitest.config.ts            # Testing configuration
```

## Technology Stack

### Core Framework
- **Next.js 14**: React framework with app router
- **TypeScript**: Type-safe development
- **React 18**: Latest React features and hooks

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### State Management
- **React Context**: Global state management
- **TanStack Query**: Server state management
- **React Hook Form**: Form state management

### Wallet Integration
- **@zondax/ledger-filecoin**: Ledger hardware wallet
- **filsnap-adapter**: MetaMask Filecoin extension
- **@metamask/sdk**: MetaMask integration
- **@safe-global/protocol-kit**: Safe multisig operations

### Development Tools
- **Vitest**: Unit testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

## Core Components

### 1. Account Management

#### AccountProvider
```typescript
// src/providers/AccountProvider.tsx
export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [currentConnector, setCurrentConnector] = useState<Connector | null>(null);
  
  // Wallet connection logic
  // Role detection
  // Account persistence
}
```

**Features**:
- Wallet connection management
- Role detection and assignment
- Account persistence across sessions
- Multisig role checking

#### AccountDropdown
```typescript
// src/components/account/AccountDropdown.tsx
export function AccountDropdown() {
  const { account, disconnect } = useAccount();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline">
          {account?.address}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={disconnect}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 2. Wallet Connection

#### ConnectWalletDialog
```typescript
// src/components/connect/ConnectWalletDialog.tsx
export function ConnectWalletDialog({ isOpen, onClose }: ConnectWalletDialogProps) {
  const [step, setStep] = useState<'select-role' | 'select-provider'>('select-role');
  const [selectedRole, setSelectedRole] = useState<'root' | 'meta-allocator'>();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {step === 'select-role' && (
          <RoleSelectionScreen onRoleSelect={setSelectedRole} />
        )}
        {step === 'select-provider' && (
          <ProviderSelectionScreen role={selectedRole} />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

**Supported Wallets**:
- **Ledger**: Hardware wallet with Filecoin app
- **Filsnap**: MetaMask Filecoin extension
- **MetaMask**: For Meta Allocator operations

### 3. Dashboard Components

#### ApplicationStatusBar
```typescript
// src/components/dashboard/components/ApplicationStatusBar.tsx
export function ApplicationStatusBar({ application }: ApplicationStatusBarProps) {
  const phases: ApplicationStatus[] = [
    'KYC_PHASE',
    'GOVERNANCE_REVIEW_PHASE',
    'RKH_APPROVAL_PHASE',
    'META_APPROVAL_PHASE',
    'APPROVED',
    'DC_ALLOCATED',
  ];
  
  return (
    <div className="flex flex-col space-y-3 w-full min-w-[200px]">
      {/* Progress visualization */}
      {/* Phase indicators */}
      {/* Status badges */}
    </div>
  );
}
```

#### ApplicationActions
```typescript
// src/components/dashboard/components/ApplicationActions.tsx
export function ApplicationActions({ application }: ApplicationActionsProps) {
  const { account } = useAccount();
  const actionConfig = getActionConfig(application, account);
  
  return (
    <div className="flex gap-2">
      {actionConfig.component ? (
        <actionConfig.component application={application} />
      ) : (
        <Button href={actionConfig.href}>
          {actionConfig.label}
        </Button>
      )}
    </div>
  );
}
```

### 4. Multisig Portal Components

#### MultisigRkhPortalPage
```typescript
// src/components/multisig-rkh-portal/MultisigRkhPortalPage.tsx
export function MultisigRkhPortalPage() {
  const [tab, setTab] = useState<MultisigRkhPortalTabs>(
    MultisigRkhPortalTabs.SIGNER_MANAGEMENT
  );
  
  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">RKH Multisig Portal</h1>
      </header>
      
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value={MultisigRkhPortalTabs.SIGNER_MANAGEMENT}>
            Root Key Holders Management
          </TabsTrigger>
          <TabsTrigger value={MultisigRkhPortalTabs.ALLOCATOR_PROPOSALS}>
            RKH & Allocator Proposals
          </TabsTrigger>
          <TabsTrigger value={MultisigRkhPortalTabs.MY_PROPOSALS}>
            My Multisig Proposals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={MultisigRkhPortalTabs.SIGNER_MANAGEMENT}>
          <SignerManagementPanel />
        </TabsContent>
        {/* Other tab contents */}
      </Tabs>
    </>
  );
}
```

#### SignerManagementPanel
```typescript
// src/components/multisig-rkh-portal/signer-management/SignerManagementPanel.tsx
export function SignerManagementPanel() {
  const { signers, threshold, isLoading } = useSignerManagement();
  const [isAddSignerDialogOpen, setIsAddSignerDialogOpen] = useState(false);
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Root Key Holders Management</CardTitle>
          <Button onClick={() => setIsAddSignerDialogOpen(true)}>
            Add Signer
          </Button>
        </CardHeader>
        <CardContent>
          <TableGenerator
            data={signers}
            columns={createSignerManagementTableColumns(handleRevokeSigner)}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      
      <AddSignerDialog
        isOpen={isAddSignerDialogOpen}
        onClose={() => setIsAddSignerDialogOpen(false)}
      />
    </>
  );
}
```

## State Management

### Context Providers

#### AccountContext
```typescript
// src/contexts/AccountContext.ts
export interface AccountContextType {
  account: Account | null;
  connectors: { [key: string]: Connector };
  connect: (connectorName: string, accountIndex?: number) => Promise<void>;
  disconnect: () => Promise<void>;
  loadPersistedAccount: () => Promise<void>;
  
  // Governance Team
  signStateMessage: (message: string) => Promise<string>;
  
  // Root Key Holder
  proposeAddVerifier: (verifierAddress: string, datacap: number) => Promise<string>;
  acceptVerifierProposal: (verifierAddress: string, datacap: number, fromAccount: string, transactionId: number) => Promise<string>;
}

export const AccountContext = createContext<AccountContextType | undefined>(undefined);
```

### Custom Hooks

#### useAccount
```typescript
// src/hooks/useAccount.ts
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
```

#### useAllocatorProposals
```typescript
// src/hooks/useAllocatorProposals.ts
export function useAllocatorProposals() {
  const [proposals, setProposals] = useState<AllocatorProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    async function fetchProposals() {
      try {
        const client = createFilecoinRpcClient("f080");
        const pendingProposals = await client.getPendingProposals();
        setProposals(pendingProposals);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProposals();
  }, []);
  
  return { proposals, isLoading, isError };
}
```

#### useSignerManagement
```typescript
// src/hooks/useSignerManagement.ts
export function useSignerManagement() {
  const [signers, setSigners] = useState<Signer[]>([]);
  const [threshold, setThreshold] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchSigners() {
      try {
        const client = createFilecoinRpcClient("f080");
        const state = await client.getState();
        
        const signerList: Signer[] = state.Signers.map(address => ({
          address,
          isActive: true,
        }));
        
        setSigners(signerList);
        setThreshold(state.NumApprovalsThreshold);
      } catch (error) {
        console.error('Error fetching signers:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSigners();
  }, []);
  
  return { signers, threshold, isLoading };
}
```

## Wallet Integration

### Connector Architecture

#### Base Connector Interface
```typescript
// src/types/connector.ts
export interface Connector {
  name: string;
  connect(): Promise<Account>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}
```

#### Ledger Connector
```typescript
// src/lib/connectors/ledger-connector.ts
export class LedgerConnector implements Connector {
  name = 'ledger';
  private transport: TransportWebUSB | null = null;
  private filecoinApp: FilecoinApp | null = null;
  private account: Account | null = null;
  private connected = false;
  
  async connect(): Promise<Account> {
    try {
      if (!this.transport) {
        this.transport = await TransportWebUSB.create();
        this.filecoinApp = new FilecoinApp(this.transport);
      }
      
      const path = `m/44'/461'/0'/0/${this.accountIndex}`;
      const { addrString: address } = await this.filecoinApp.getAddressAndPubKey(path);
      
      // Check multisig role
      const multisigRoleResult = await checkMultisigRole(address);
      
      this.account = {
        address,
        isConnected: true,
        wallet: new LedgerWallet(this.filecoinApp, address),
        role: multisigRoleResult.role,
        parentMsigAddress: multisigRoleResult.parentMsigAddress,
      };
      
      this.connected = true;
      return this.account;
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }
}
```

#### Filsnap Connector
```typescript
// src/lib/connectors/filsnap-connector.ts
export class FilsnapConnector implements Connector {
  name = 'filsnap';
  private adapter: FilsnapAdapter | null = null;
  private account: Account | null = null;
  private connected = false;
  
  async connect(): Promise<Account> {
    try {
      const hasSnaps = await FilsnapAdapter.hasSnaps();
      if (!hasSnaps) {
        throw new Error('Metamask with Snaps support is not installed');
      }
      
      this.adapter = await FilsnapAdapter.connect(
        { network: 'mainnet' }, 
        'npm:filsnap'
      );
      
      const { result: address } = await this.adapter.getAddress();
      const role = await fetchRole(address);
      
      this.account = {
        address,
        role,
        isConnected: true,
        wallet: new FilsnapWallet(this.adapter, address),
      };
      
      this.connected = true;
      return this.account;
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }
}
```

### Multisig Role Detection

#### checkMultisigRole
```typescript
// src/lib/multisig-role-checker.ts
export async function checkMultisigRole(address: string): Promise<MultisigRoleResult> {
  try {
    const f080Client = createFilecoinRpcClient("f080");
    const f080State = await f080Client.getState();
    const f080Signers = f080State.Signers;
    
    // Check if direct signer
    if (f080Signers.includes(address)) {
      return { role: AccountRole.ROOT_KEY_HOLDER };
    }
    
    // Check if multisig signer
    const f080Code = await f080Client.getActorCode('f080');
    const multisigSigners = [];
    
    for (const signer of f080Signers) {
      try {
        const actorCode = await f080Client.getActorCode(signer);
        if (actorCode['/'] === f080Code['/']) {
          multisigSigners.push(signer);
        }
      } catch (error) {
        continue;
      }
    }
    
    // Check if member of multisig signers
    for (const multisigAddress of multisigSigners) {
      try {
        const msigClient = createFilecoinRpcClient(multisigAddress);
        const msigState = await msigClient.getState();
        
        if (msigState.Signers.includes(address)) {
          return {
            role: AccountRole.INDIRECT_ROOT_KEY_HOLDER,
            parentMsigAddress: multisigAddress,
          };
        }
      } catch (error) {
        continue;
      }
    }
    
    return { role: AccountRole.USER };
  } catch (error) {
    return { role: AccountRole.GUEST };
  }
}
```

## Routing & Navigation

### App Router Structure

#### Root Layout
```typescript
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccountProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Navbar />
              {children}
            </TooltipProvider>
          </QueryClientProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
```

#### Dashboard Layout
```typescript
// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

#### Multisig Portal Layout
```typescript
// src/app/multisig-rkh-portal/layout.tsx
export default function MultisigRkhPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">RKH Multisig Portal</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

## UI/UX Design System

### Component Library

#### Base UI Components
```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### Table Components
```typescript
// src/components/ui/table-generator.tsx
export function TableGenerator<T>({
  data,
  columns,
  isLoading,
  isError,
}: TableGeneratorProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }
  
  if (isError) {
    return <div className="flex items-center justify-center p-8 text-red-500">Error loading data</div>;
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Design Tokens

#### Colors
```css
/* tailwind.config.ts */
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
}
```

#### Typography
```css
/* globals.css */
@layer base {
  :root {
    --font-sans: "Inter", "system-ui", "sans-serif";
  }
  
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

## API Integration

### API Client

#### Base API Configuration
```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApplications(
  searchTerm: string,
  filters: string[],
  page: number,
  pageLimit: number,
): Promise<ApplicationsResponse> {
  const params = new URLSearchParams({
    search: searchTerm,
    filters: filters.join(','),
    page: page.toString(),
    limit: pageLimit.toString(),
  });
  
  const response = await fetch(`${API_BASE_URL}/applications?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }
  
  return response.json();
}

export async function fetchRole(address: string): Promise<AccountRole> {
  const url = `${API_BASE_URL}/roles?address=${address}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data.role;
  } catch (error) {
    console.error('Failed to fetch role:', error);
    throw new Error('Failed to fetch role');
  }
}
```

### Filecoin RPC Integration

#### RPC Client
```typescript
// src/lib/filecoin-rpc.ts
export class FilecoinRpcClient {
  private rpcUrl: string;
  private authToken: string;
  
  constructor(address: string) {
    this.rpcUrl = process.env.NEXT_PUBLIC_LOTUS_URL!;
    this.authToken = process.env.NEXT_PUBLIC_LOTUS_TOKEN!;
  }
  
  async sendRpc(method: string, params: any[]): Promise<any> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(`RPC error: ${result.error.message}`);
    }
    
    return result.result;
  }
  
  async getState(): Promise<any> {
    return this.sendRpc('Filecoin.StateReadState', [this.address, null]);
  }
  
  async getPendingProposals(): Promise<any[]> {
    return this.sendRpc('Filecoin.MsigGetPending', [this.address, null]);
  }
  
  async getActorCode(address: string): Promise<any> {
    return this.sendRpc('Filecoin.StateGetActor', [address, null]);
  }
}
```

## Testing Strategy

### Unit Testing

#### Component Testing
```typescript
// src/components/dashboard/DashboardHeader.test.tsx
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from './DashboardHeader';

describe('DashboardHeader', () => {
  it('renders dashboard title', () => {
    render(<DashboardHeader />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
  
  it('shows connect wallet button when not connected', () => {
    render(<DashboardHeader />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// src/hooks/useAccount.test.ts
import { renderHook } from '@testing-library/react';
import { useAccount } from './useAccount';

describe('useAccount', () => {
  it('throws error when used outside AccountProvider', () => {
    expect(() => {
      renderHook(() => useAccount());
    }).toThrow('useAccount must be used within an AccountProvider');
  });
});
```

### Integration Testing

#### Wallet Connection Testing
```typescript
// src/components/connect/ConnectWalletDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectWalletDialog } from './ConnectWalletDialog';

describe('ConnectWalletDialog', () => {
  it('shows role selection on initial render', () => {
    render(<ConnectWalletDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Root Key Holder')).toBeInTheDocument();
    expect(screen.getByText('Meta Allocator')).toBeInTheDocument();
  });
  
  it('shows provider selection after role selection', () => {
    render(<ConnectWalletDialog isOpen={true} onClose={() => {}} />);
    
    fireEvent.click(screen.getByText('Connect as Root'));
    
    expect(screen.getByText('Ledger')).toBeInTheDocument();
    expect(screen.getByText('Filsnap')).toBeInTheDocument();
  });
});
```

### E2E Testing

#### Application Workflow Testing
```typescript
// e2e/application-workflow.test.ts
import { test, expect } from '@playwright/test';

test('complete application workflow', async ({ page }) => {
  // Navigate to dashboard
  await page.goto('/dashboard');
  
  // Connect wallet
  await page.click('[data-testid="connect-wallet"]');
  await page.click('[data-testid="role-root"]');
  await page.click('[data-testid="provider-ledger"]');
  
  // Verify connection
  await expect(page.locator('[data-testid="account-address"]')).toBeVisible();
  
  // View applications
  await page.click('[data-testid="applications-tab"]');
  await expect(page.locator('[data-testid="application-list"]')).toBeVisible();
});
```

## Build & Deployment

### Build Configuration

#### Next.js Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    https: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_LOTUS_URL: process.env.NEXT_PUBLIC_LOTUS_URL,
    NEXT_PUBLIC_LOTUS_TOKEN: process.env.NEXT_PUBLIC_LOTUS_TOKEN,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  },
};

export default nextConfig;
```

#### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Environment Variables

#### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_LOTUS_URL=http://localhost:1234
NEXT_PUBLIC_LOTUS_TOKEN=your-lotus-token
NEXT_PUBLIC_CHAIN_ID=314
NEXT_PUBLIC_META_ALLOCATOR_CONTRACT_ADDRESS=0xB6F5d279AEad97dFA45209F3E53969c2EF43C21d
```

#### Production (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.apply.allocator.tech
NEXT_PUBLIC_LOTUS_URL=https://api.node.glif.io/rpc/v1
NEXT_PUBLIC_LOTUS_TOKEN=your-production-token
NEXT_PUBLIC_CHAIN_ID=314
NEXT_PUBLIC_META_ALLOCATOR_CONTRACT_ADDRESS=0xB6F5d279AEad97dFA45209F3E53969c2EF43C21d
```

### Deployment Scripts

#### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --experimental-https",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:unit": "vitest run",
    "format:check": "prettier --check .",
    "format:fix": "prettier --write --ignore-unknown ."
  }
}
```

## Development Guide

### Getting Started

#### Prerequisites
- Node.js 18+
- npm or yarn
- Git

#### Installation
```bash
# Clone repository
git clone <repository-url>
cd rkh-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Development Workflow

#### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic formatting
- **Husky**: Pre-commit hooks

#### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Run tests
npm run test

# Format code
npm run format:fix

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

#### Component Development
```typescript
// Example component structure
interface ComponentProps {
  // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// Test file
describe('Component', () => {
  it('renders correctly', () => {
    // Test implementation
  });
});
```

### Debugging

#### Development Tools
- **React DevTools**: Component inspection
- **Redux DevTools**: State management debugging
- **Network Tab**: API request monitoring
- **Console**: Error logging

#### Common Issues

##### Wallet Connection Issues
```typescript
// Debug wallet connection
console.log('Wallet status:', walletStatus);
console.log('Account:', account);
console.log('Role:', role);
```

##### RPC Connection Issues
```typescript
// Debug RPC calls
try {
  const result = await client.sendRpc('method', params);
  console.log('RPC result:', result);
} catch (error) {
  console.error('RPC error:', error);
}
```

### Performance Optimization

#### Code Splitting
```typescript
// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

#### Image Optimization
```typescript
// Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority
/>
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

This comprehensive frontend documentation covers all aspects of the Next.js application, from architecture and components to testing and deployment. It provides developers with everything they need to understand, develop, and maintain the frontend codebase.
