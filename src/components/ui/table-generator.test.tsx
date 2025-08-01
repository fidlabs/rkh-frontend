import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TableGenerator } from './table-generator';
import { ColumnDef } from '@tanstack/react-table';

interface TestData {
  id: string;
  name: string;
  value: number;
}

describe('TableGenerator', () => {
  const mockColumns: ColumnDef<TestData>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'value',
      header: 'Value',
    },
  ];

  const mockData: TestData[] = [
    { id: '1', name: 'Test 1', value: 100 },
    { id: '2', name: 'Test 2', value: 200 },
  ];

  it('should render table with data', () => {
    render(<TableGenerator data={mockData} columns={mockColumns} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    render(<TableGenerator data={[]} columns={mockColumns} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(<TableGenerator data={[]} columns={mockColumns} isLoading={true} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByTestId('table-spinner')).toBeInTheDocument();
  });

  it('should render error state', () => {
    render(<TableGenerator data={[]} columns={mockColumns} isError={true} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Cannot load data')).toBeInTheDocument();
  });

  it('should render pagination when provided', () => {
    const pagination = {
      totalPages: 3,
      paginationState: { pageIndex: 0, pageSize: 10 },
      setPaginationState: vi.fn(),
    };

    render(<TableGenerator data={mockData} columns={mockColumns} pagination={pagination} />);

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    const pagination = {
      totalPages: 3,
      paginationState: { pageIndex: 0, pageSize: 10 },
      setPaginationState: vi.fn(),
    };

    render(<TableGenerator data={mockData} columns={mockColumns} pagination={pagination} />);

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    const pagination = {
      totalPages: 1,
      paginationState: { pageIndex: 0, pageSize: 10 },
      setPaginationState: vi.fn(),
    };

    render(<TableGenerator data={mockData} columns={mockColumns} pagination={pagination} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should render table without pagination when not provided', () => {
    render(<TableGenerator data={mockData} columns={mockColumns} />);

    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
  });
});
