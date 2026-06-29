import Card from './Card';

const Table = ({ 
  columns = [], 
  data = [], 
  onRowClick,
  className = '' 
}) => {
  const getHeader = (col) => col.header || col.label || '';
  const getValue = (row, col) => {
    if (col.render) {
      if (col.accessor || col.key) {
        const raw = row[col.accessor || col.key];
        return col.render(raw, row);
      }
      return col.render(row);
    }

    const accessor = col.accessor || col.key;
    return accessor ? row[accessor] : '';
  };

  return (
    <Card padding={false} className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-700">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-xs font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest"
                >
                  {getHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'hover:bg-slate-100/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors px-6' : ''}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 text-sm text-slate-700 dark:text-gray-300 font-medium">
                      {getValue(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Table;
