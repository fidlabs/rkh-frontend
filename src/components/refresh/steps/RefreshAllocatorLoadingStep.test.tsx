import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RefreshAllocatorLoadingStep } from './RefreshAllocatorLoadingStep';

describe('RefreshAllocatorLoadingStep', () => {
  it('should render loading content with default message', () => {
    render(<RefreshAllocatorLoadingStep />);

    expect(screen.getByTestId('loading-message')).toHaveTextContent('Loading...');
  });

  it('should render loading content with custom message', () => {
    render(<RefreshAllocatorLoadingStep loadingMessage="custom loading message" />);

    expect(screen.getByTestId('loading-message')).toHaveTextContent('custom loading message');
  });
});
