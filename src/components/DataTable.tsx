import { flexRender, getCoreRowModel, useReactTable, ColumnDef, VisibilityState, SortingState, getSortedRowModel, FilterFn, getFilteredRowModel, RowData } from '@tanstack/react-table';
import { useState, useEffect } from 'react';

// Define a generic filter option type
export interface FilterOption {
  value: string;
  label: string;
}

// Extend the RowData interface to ensure we can access any property
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterOptions?: FilterOption[];
  }
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  defaultHiddenColumns?: string[];
  // Optional filter configurations
  filterableColumns?: {
    id: string;
    options: FilterOption[];
  }[];
}

export default function DataTable<T>({ data, columns, defaultHiddenColumns = [], filterableColumns = [] }: DataTableProps<T>) {
  // Initialize column visibility state
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const initialState: VisibilityState = {};
    defaultHiddenColumns.forEach(columnId => {
      initialState[columnId] = false;
    });
    return initialState;
  });

  // Add sorting state
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Add column filters state
  const [columnFilters, setColumnFilters] = useState<{[key: string]: string}>({});

  // Custom filter function that handles our filter state
  const customFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    if (!filterValue || filterValue === 'all') return true;
    
    const value = row.getValue(columnId);
    
    // Handle different types of values
    if (typeof value === 'object' && value !== null && 'name' in value) {
      // For objects with a name property (like mainStat)
      return value.name === filterValue;
    } else {
      // For primitive values
      return String(value) === filterValue;
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      sorting,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      custom: customFilterFn,
    },
    globalFilterFn: customFilterFn,
  });
  
  // Apply filters to the table

    useEffect(() => {
    // Clear existing filters
    table.resetColumnFilters();
    
    // Apply new filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        table.getColumn(columnId)?.setFilterValue(filterValue);
      }
    });
  }, [columnFilters, table]);

  // Handle filter change
  const handleFilterChange = (columnId: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: value,
    }));
  };

  return (
    <div>
      {/* Filters */}
      {filterableColumns.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filters</h3>
          <div className="flex flex-wrap gap-4">
            {filterableColumns.map(({ id, options }) => {
              const column = table.getColumn(id);
              if (!column) return null;
              
              return (
                <div key={id} className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {typeof column.columnDef.header === 'string' ? column.columnDef.header : id}
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={columnFilters[id] || 'all'}
                    onChange={(e) => handleFilterChange(id, e.target.value)}
                  >
                    <option value="all">All</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Column visibility toggles */}
      <div className="mb-4 flex flex-wrap gap-2">
        {table.getAllColumns().filter(column => column.getCanHide()).map(column => {
          return (
            <div key={column.id} className="flex items-center">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                </span>
              </label>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <span className="ml-1">
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? ''}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}