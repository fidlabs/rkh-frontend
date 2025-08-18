# Multisig RKH Portal

This portal provides a dedicated interface for Root Key Holder (RKH) multisig operations, separate from the main applications dashboard.

## Features

### 1. Signer Management
- Manage multisig signers and their permissions
- View current signer configuration

### 2. Allocator Proposals  
- Review pending allocator proposals requiring multisig approval
- View decoded transaction parameters
- Approve or reject proposals with action buttons

### 3. My Proposals
- Manage outstanding proposals for your RKH Org multisig
- Track proposal status and approvals

## Filecoin RPC Integration

The portal integrates with Filecoin RPC to fetch real-time data:

- **Multisig State**: Reads current signers, threshold, and balance
- **Pending Transactions**: Fetches all pending proposals
- **Parameter Decoding**: Decodes transaction parameters for human-readable display
- **Real-time Updates**: Data is reloaded each time the portal is accessed

## Configuration

Set the following environment variables:

```bash
# Lotus RPC endpoint
NEXT_PUBLIC_LOTUS_URL=http://your-lotus-node:1234

# Authentication token
NEXT_PUBLIC_LOTUS_TOKEN=your-auth-token

# Chain ID (314 for mainnet, 314159 for calibnet)
NEXT_PUBLIC_CHAIN_ID=314
```

## Architecture

### Components
- `MultisigRkhPortalPage`: Main portal component with tab navigation
- `SignerManagementPanel`: Manages multisig signers
- `AllocatorProposalsPanel`: Handles allocator proposal reviews
- `MyProposalsPanel`: Manages RKH org proposals

### Hooks
- `useAllocatorProposals`: Fetches and processes allocator proposals
- `useFilecoinRpc`: Core Filecoin RPC client functionality

### Utilities
- `FilecoinRpcClient`: Modular RPC client for Filecoin operations
- `filecoinConfig`: Centralized configuration management

## Usage

1. Navigate to `/multisig-rkh-portal`
2. Select the appropriate tab for your operation
3. Review pending proposals and their decoded parameters
4. Use approve/reject buttons to take action on proposals
5. Data automatically refreshes on each visit

## Security

- Only accessible to users with ROOT_KEY_HOLDER or INDIRECT_ROOT_KEY_HOLDER roles
- All RPC calls use secure authentication tokens
- No sensitive data is stored locally - everything is fetched fresh from the blockchain
