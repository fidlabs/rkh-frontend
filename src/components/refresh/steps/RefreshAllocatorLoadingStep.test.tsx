import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RefreshAllocatorLoadingStep } from './RefreshAllocatorLoadingStep';

describe('RefreshAllocatorLoadingStep', () => {
  it('should render loading content', () => {
    render(<RefreshAllocatorLoadingStep />);

    expect(screen.getByText('Connecting to Ledger...')).toBeInTheDocument();
  });
});
