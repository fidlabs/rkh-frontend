import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('should render input with type', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should handle typing text', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('should applies error styling when error prop is provided', () => {
    const error = { type: 'required', message: 'Field is required' };
    render(<Input error={error} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('text-red-500', 'border-red-500');
  });

  it('should not apply error styling when no error', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).not.toHaveClass('text-red-500', 'border-red-500');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });
});
