import React from 'react';

export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRowClick?: (item: T, index: number) => void;
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedRows: Set<string | number>) => void;
  getRowId?: (item: T, index: number) => string | number;
}

// Composant Table principal
export function Table<T = any>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  className = '',
  striped = false,
  hover = false,
  bordered = false,
  size = 'md',
  onRowClick,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId = (item, index) => index,
}: TableProps<T>) {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };
    return sizes[size];
  };

  const getTableClasses = () => {
    let classes = 'w-full';

    if (bordered) classes += ' border border-gray-300';
    if (striped) classes += ' divide-y divide-gray-200';

    return classes;
  };

  const getRowClasses = (index: number) => {
    let classes = 'transition-colors';

    if (striped && index % 2 === 1) {
      classes += ' bg-gray-50';
    }

    if (hover) {
      classes += ' hover:bg-gray-100';
    }

    if (onRowClick) {
      classes += ' cursor-pointer';
    }

    return classes;
  };

  const handleRowClick = (item: T, index: number) => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedRows.size === data.length) {
      onSelectionChange(new Set());
    } else {
      const allIds = new Set(data.map((item, index) => getRowId(item, index)));
      onSelectionChange(allIds);
    }
  };

  const handleSelectRow = (item: T, index: number) => {
    if (!onSelectionChange) return;

    const rowId = getRowId(item, index);
    const newSelection = new Set(selectedRows);

    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }

    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={getTableClasses()}>
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.width ? `w-${column.width}` : ''
                }`}
                style={column.align ? { textAlign: column.align } : undefined}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`${striped ? '' : 'divide-y divide-gray-200'} ${getSizeClasses()}`}>
          {data.map((item, index) => {
            const rowId = getRowId(item, index);
            const isSelected = selectedRows.has(rowId);

            return (
              <tr
                key={rowId}
                className={getRowClasses(index)}
                onClick={() => handleRowClick(item, index)}
              >
                {selectable && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(item, index)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                )}
                {columns.map((column, colIndex) => {
                  const value = item[column.key as keyof T];
                  const renderedValue = column.render
                    ? column.render(value, item, index)
                    : String(value || '');

                  return (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap ${
                        column.align ? `text-${column.align}` : ''
                      }`}
                      style={column.align ? { textAlign: column.align } : undefined}
                    >
                      {renderedValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Composant TableCard pour les écrans mobiles
export interface TableCardProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  titleKey?: keyof T;
  subtitleKey?: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (item: T, index: number) => void;
  className?: string;
}

export function TableCard<T = any>({
  data,
  columns,
  titleKey,
  subtitleKey,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  onItemClick,
  className = '',
}: TableCardProps<T>) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onItemClick?.(item, index)}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              {titleKey && (
                <h3 className="font-medium text-gray-900">
                  {String(item[titleKey])}
                </h3>
              )}
              {subtitleKey && (
                <p className="text-sm text-gray-600">
                  {String(item[subtitleKey])}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {columns.slice(0, 4).map((column, colIndex) => {
              const value = item[column.key as keyof T];
              const renderedValue = column.render
                ? column.render(value, item, index)
                : String(value || '');

              return (
                <div key={colIndex}>
                  <span className="text-gray-500">{column.header}:</span>
                  <span className="ml-2 text-gray-900">{renderedValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}