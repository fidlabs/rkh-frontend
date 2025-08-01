import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  Row,
  SortingState,
  Table as TableSchema,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Loader, Loader2 } from 'lucide-react';

interface Pagination<TData> {
  totalPages: number;
  paginationState: PaginationState;
  setPaginationState?: OnChangeFn<PaginationState>;
}

interface TableGeneratorProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pagination?: Pagination<TData>;
  isLoading?: boolean;
  isError?: boolean;
}

export function TableGenerator<TData>({
  data,
  columns,
  pagination,
  isError,
  isLoading,
}: TableGeneratorProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    manualPagination: !!pagination,
    pageCount: pagination?.totalPages,
    onPaginationChange: pagination?.setPaginationState,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    enableHiding: true,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(pagination ? { pagination: pagination.paginationState } : {}),
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md">
        <Table role="table">
          <TableHeader role="rowgroup">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} role="row">
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody role="rowgroup">
            <TableBodyContent
              table={table}
              columns={columns}
              isError={isError}
              isLoading={isLoading}
            />
          </TableBody>
        </Table>
      </div>

      {pagination ? <DashboardTableFooter pagination={pagination} table={table} /> : null}
    </div>
  );
}

function DashboardTableFooter<TData>({
  table,
  pagination,
}: { table: TableSchema<TData> } & { pagination?: Pagination<TData> }) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-between mt-4"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {(pagination?.paginationState?.pageIndex || 0) + 1} of {pagination?.totalPages || 1}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </nav>
  );
}

function TableBodyContent<TData>({
  table,
  columns,
  isError,
  isLoading,
}: { table: TableSchema<TData> } & {
  columns: ColumnDef<TData>[];
  isError?: boolean;
  isLoading?: boolean;
}) {
  if (isError) {
    return (
      <TableRow role="row">
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <p data-testid="error-message" className="text-red-500">
            Cannot load data
          </p>
        </TableCell>
      </TableRow>
    );
  }

  if (isLoading) {
    return (
      <TableRow role="row">
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <Loader size={24} data-testid="table-spinner" className="animate-spin mx-auto" />
        </TableCell>
      </TableRow>
    );
  }

  const tableRows = table.getRowModel().rows;

  if (!tableRows.length)
    return (
      <TableRow role="row">
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <p data-testid="no-results-message" className="text-muted-foreground">
            No results.
          </p>
        </TableCell>
      </TableRow>
    );

  return tableRows.map(row => (
    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map(cell => (
        <TableCell key={cell.id} role="cell">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ));
}
