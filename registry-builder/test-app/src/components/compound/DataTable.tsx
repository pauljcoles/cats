import React, { useState } from 'react';
import { Button } from '../Button';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  onSort,
  loading = false,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof T) => {
    if (!columns.find(col => col.key === key)?.sortable) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const generateCellTestId = (rowIndex: number, columnKey: string): string => {
    return `table-cell-${rowIndex}-${columnKey}`;
  };

  const generateRowTestId = (rowIndex: number): string => {
    return `table-row-${rowIndex}`;
  };

  if (loading) {
    return (
      <div className="data-table-loading" data-testid="table-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="data-table-container" data-testid="data-table">
      <table className="data-table" role="table">
        <thead>
          <tr role="row">
            {columns.map(column => (
              <th
                key={String(column.key)}
                className={`table-header ${column.sortable ? 'sortable' : ''}`}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
                data-testid={`table-header-${String(column.key)}`}
                role="columnheader"
                aria-sort={
                  sortKey === column.key 
                    ? sortDirection === 'asc' ? 'ascending' : 'descending'
                    : column.sortable ? 'none' : undefined
                }
              >
                <div className="header-content">
                  <span className="header-label">{column.label}</span>
                  {column.sortable && (
                    <Button
                      variant="secondary"
                      size="sm"
                      data-testid={`sort-${String(column.key)}`}
                      aria-label={`Sort by ${column.label}`}
                    >
                      {sortKey === column.key && sortDirection === 'desc' ? '↓' : '↑'}
                    </Button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="empty-message"
                data-testid="table-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`table-row ${onRowClick ? 'clickable' : ''}`}
                onClick={() => onRowClick?.(row)}
                data-testid={generateRowTestId(rowIndex)}
                role="row"
              >
                {columns.map(column => (
                  <td
                    key={String(column.key)}
                    className="table-cell"
                    data-testid={generateCellTestId(rowIndex, String(column.key))}
                    role="cell"
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}