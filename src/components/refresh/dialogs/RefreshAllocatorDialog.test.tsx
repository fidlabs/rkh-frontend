import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RefreshAllocatorDialog } from './RefreshAllocatorDialog'

const mockProposeAddVerifier = vi.fn()
const mockToast = vi.fn()

vi.mock('@/hooks/useAccount', () => ({
  useAccount: () => ({
    proposeAddVerifier: mockProposeAddVerifier,
  }),
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

describe('RefreshAllocatorDialog Integration Tests', () => {
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Success flow', () => {
    beforeEach(() => {
      mockProposeAddVerifier.mockResolvedValue('message-id-123')
    })

    it('should go through complete success flow', async () => {
      const user = userEvent.setup()
      render(<RefreshAllocatorDialog {...mockProps} />)

      expect(screen.getByRole('textbox', { name: /allocator address/i })).toBeInTheDocument()

      await user.type(screen.getByRole('textbox', { name: /allocator address/i }), 'f1234567890abcdef')
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000')
      await user.click(screen.getByRole('button', { name: /approve/i }))

      expect(mockProposeAddVerifier).toHaveBeenCalledWith('f1234567890abcdef', '1000')

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'RKH Transaction Proposed',
          description: 'Transaction proposed with message id: message-id-123',
        })
      })

      // Should show success step
      await waitFor(() => {
        expect(screen.getByText('Allocator refreshed successfully!')).toBeInTheDocument()
      })
    })

    it('should close dialog from success step', async () => {
      const user = userEvent.setup()
      render(<RefreshAllocatorDialog {...mockProps} />)

      // Go through form submission
      await user.type(screen.getByRole('textbox', { name: /allocator address/i }), 'f1234567890abcdef')
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000')
      await user.click(screen.getByRole('button', { name: /approve/i }))

      await waitFor(() => {
        expect(screen.getByText('Allocator refreshed successfully!')).toBeInTheDocument()
      })

      await user.click(screen.getAllByRole('button', { name: /close/i })[0])

      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Error flow', () => {
    beforeEach(() => {
      mockProposeAddVerifier.mockRejectedValue(new Error('Transaction failed'))
    })

    it('should show error step when transaction fails', async () => {
      const user = userEvent.setup()
      render(<RefreshAllocatorDialog {...mockProps} />)

      await user.type(screen.getByRole('textbox', { name: /allocator address/i }), 'f1234567890abcdef')
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000')
      await user.click(screen.getByRole('button', { name: /approve/i }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to propose verifier',
          variant: 'destructive',
        })
      })

      // Should show error step
      await waitFor(() => {
        expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
      })
    })

    it('should go back to form from error step', async () => {
      const user = userEvent.setup()
      render(<RefreshAllocatorDialog {...mockProps} />)

      await user.type(screen.getByRole('textbox', { name: /allocator address/i }), 'f1234567890abcdef')
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000')
      await user.click(screen.getByRole('button', { name: /approve/i }))

      await waitFor(() => {
        expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /go back/i }))

      expect(screen.getByRole('textbox', { name: /allocator address/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /datacap/i })).toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    beforeEach(() => {
      mockProposeAddVerifier.mockImplementation(() => new Promise(() => {}))
    })

    it('should show loading step during transaction', async () => {
      const user = userEvent.setup()
      render(<RefreshAllocatorDialog {...mockProps} />)

      await user.type(screen.getByRole('textbox', { name: /allocator address/i }), 'f1234567890abcdef')
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000')
      await user.click(screen.getByRole('button', { name: /approve/i }))

      expect(screen.getByText('Connecting to Ledger...')).toBeInTheDocument()
    })
  })
})
