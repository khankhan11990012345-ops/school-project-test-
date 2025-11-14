import { ReactNode, CSSProperties } from 'react';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (value: any, row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  emptyMessageColSpan?: number;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: (row: T, index: number) => string | number;
  className?: string;
  style?: CSSProperties;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'No data found',
  emptyMessageColSpan,
  onRowClick,
  rowKey,
  className = '',
  style,
}: TableProps<T>) => {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const getRowKey = (row: T, index: number): string | number => {
    if (rowKey) {
      return rowKey(row, index);
    }
    // Default: try to use 'id' field, otherwise use index
    return (row as any).id !== undefined ? (row as any).id : index;
  };

  const getCellValue = (column: TableColumn<T>, row: T, index: number): any => {
    if (column.render) {
      const value = column.accessor ? column.accessor(row) : (row as any)[column.key];
      return column.render(value, row, index);
    }
    if (column.accessor) {
      return column.accessor(row);
    }
    return (row as any)[column.key];
  };

  const cellStyle: CSSProperties = {
    textAlign: 'left',
  };

  const headerCellStyle: CSSProperties = {
    textAlign: 'left',
  };

  return (
    <div className={`table-container ${className}`} style={style}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  ...headerCellStyle,
                  textAlign: column.align || 'left',
                  ...(column.width ? { width: column.width } : {}),
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.length === 0 ? (
            <tr>
              <td
                colSpan={emptyMessageColSpan || columns.length}
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#999',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            safeData.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                onClick={() => onRowClick?.(row, index)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      ...cellStyle,
                      textAlign: column.align || 'left',
                    }}
                  >
                    {getCellValue(column, row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

