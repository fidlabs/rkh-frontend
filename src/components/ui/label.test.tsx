import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from './label';

describe('Label', () => {
  it('should render with htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('should apply error styling when error prop is true', () => {
    render(<Label error={true}>Error Label</Label>);

    const label = screen.getByText('Error Label');
    expect(label).toHaveClass('text-red-600');
  });

  it('should not apply error styling when error prop is false', () => {
    render(<Label error={false}>Normal Label</Label>);

    const label = screen.getByText('Normal Label');
    expect(label).not.toHaveClass('text-red-600');
  });

  it('should apply disabled styling when disabled prop is true', () => {
    render(<Label disabled={true}>Disabled Label</Label>);

    const label = screen.getByText('Disabled Label');
    expect(label).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should show required asterisk when required prop is true', () => {
    render(<Label required={true}>Required Label</Label>);

    const label = screen.getByText('Required Label');
    expect(label).toHaveClass('after:content-["*"]', 'after:text-red-500');
  });

  it('should not show required asterisk when required prop is false', () => {
    render(<Label required={false}>Optional Label</Label>);

    const label = screen.getByText('Optional Label');
    expect(label).not.toHaveClass('after:content-["*"]');
  });

  it('should apply both error and required styling together', () => {
    render(
      <Label error={true} required={true}>
        Error Required Label
      </Label>,
    );

    const label = screen.getByText('Error Required Label');
    expect(label).toHaveClass('text-red-600');
    expect(label).toHaveClass('after:content-["*"]', 'after:text-red-500');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Label ref={ref}>Label with ref</Label>);

    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('applies custom className', () => {
    render(<Label className="custom-class">Custom Label</Label>);

    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-class');
  });

  it('should have default base styling', () => {
    render(<Label>Base Label</Label>);

    const label = screen.getByText('Base Label');
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');
  });

  it('should handle peer-disabled state styling', () => {
    render(<Label>Disabled Peer Label</Label>);

    const label = screen.getByText('Disabled Peer Label');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
  });
});
