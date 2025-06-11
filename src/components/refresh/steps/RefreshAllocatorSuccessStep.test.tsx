import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RefreshAllocatorSuccessStep } from './RefreshAllocatorSuccessStep'

describe('RefreshAllocatorSuccessStep', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render success message', () => {
    render(<RefreshAllocatorSuccessStep onClose={mockOnClose} />)

    expect(screen.getByText('Allocator refreshed successfully!')).toBeInTheDocument()
  })

  it('should render close button', () => {
    render(<RefreshAllocatorSuccessStep onClose={mockOnClose} />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('should call onClose when Close button is clicked', async () => {
    const user = userEvent.setup()
    render(<RefreshAllocatorSuccessStep onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should have only one button in footer', () => {
    render(<RefreshAllocatorSuccessStep onClose={mockOnClose} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveTextContent(/close/i)
  })
})
