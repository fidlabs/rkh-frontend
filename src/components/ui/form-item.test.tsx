import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormItem } from './form-item'
import { Input } from './input'

describe('FormItem', () => {
  it('should render form item with children', () => {
    render(
      <FormItem label="Test input" name="test-input">
        <Input />
      </FormItem>,
    )

    expect(screen.getByRole('textbox', { name: 'Test input' })).toBeInTheDocument()
  })

  it('should render with label when label prop is provided', () => {
    render(
      <FormItem label="Test Label" name="test-field">
        <Input />
      </FormItem>,
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should not render label when label prop is not provided', () => {
    render(
      <FormItem>
        <Input />
      </FormItem>,
    )

    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('should connect label with input using htmlFor and id', () => {
    render(
      <FormItem label="Username" name="username">
        <Input />
      </FormItem>,
    )

    const label = screen.getByText('Username')
    const input = screen.getByRole('textbox', { name: 'Username' })

    expect(label).toHaveAttribute('for', 'username')
    expect(input).toHaveAttribute('id', 'username')
  })

  it('should show required asterisk when required prop is true', () => {
    render(
      <FormItem label="Required Field" name="required-field" required={true}>
        <Input />
      </FormItem>,
    )

    const label = screen.getByText('Required Field')
    expect(label).toHaveClass('after:content-["*"]', 'after:text-red-500')
  })

  it('should display error message with alert role when error prop is provided', () => {
    const error = { type: 'required', message: 'This field is required' }

    render(
      <FormItem label="Test Field" error={error}>
        <Input />
      </FormItem>,
    )

    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveTextContent('This field is required')
    expect(errorMessage).toHaveAttribute('aria-live', 'assertive')
  })

  it('should not display error message when no error', () => {
    render(
      <FormItem label="Test Field">
        <Input />
      </FormItem>,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText(/This field is required/)).not.toBeInTheDocument()
  })

  it('should apply error styling to label when error is present', () => {
    const error = { type: 'required', message: 'Error message' }

    render(
      <FormItem label="Error Field" error={error}>
        <Input />
      </FormItem>,
    )

    const label = screen.getByText('Error Field')
    expect(label).toHaveClass('text-red-600')
  })

  it('should pass error prop to child component', () => {
    const error = { type: 'required', message: 'Error message' }

    render(
      <FormItem error={error}>
        <Input />
      </FormItem>,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('text-red-500', 'border-red-500')
  })

  it('should apply custom className', () => {
    render(
      <FormItem className="custom-form-item">
        <Input />
      </FormItem>,
    )

    const formItem = screen.getByRole('textbox').parentElement
    expect(formItem).toHaveClass('custom-form-item')
  })

  it('should have default margin bottom styling', () => {
    render(
      <FormItem>
        <Input />
      </FormItem>,
    )

    const formItem = screen.getByRole('textbox').parentElement
    expect(formItem).toHaveClass('mb-2')
  })

  it('should combine required and error states correctly', () => {
    const error = { type: 'required', message: 'Required field error' }

    render(
      <FormItem label="Required Error Field" required={true} error={error}>
        <Input />
      </FormItem>,
    )

    const label = screen.getByText('Required Error Field')
    const errorAlert = screen.getByRole('alert')

    expect(label).toHaveClass('after:content-["*"]')
    expect(label).toHaveClass('text-red-600')
    expect(errorAlert).toHaveTextContent('Required field error')
  })

  it('should forward additional props to div element', () => {
    render(
      <FormItem data-testid="form-item-test" role="group">
        <Input />
      </FormItem>,
    )

    const formItem = screen.getByTestId('form-item-test')
    expect(formItem).toHaveAttribute('role', 'group')
  })

  it('should have proper accessibility attributes on error message', () => {
    const error = { type: 'validation', message: 'Invalid input format' }

    render(
      <FormItem error={error}>
        <Input />
      </FormItem>,
    )

    const errorAlert = screen.getByRole('alert')
    expect(errorAlert).toHaveAttribute('role', 'alert')
    expect(errorAlert).toHaveAttribute('aria-live', 'assertive')
    expect(errorAlert).toHaveClass('text-sm', 'text-red-600', 'pt-1')
  })
})
