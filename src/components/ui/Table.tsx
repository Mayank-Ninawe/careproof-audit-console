import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto border border-[#D9D3C5] rounded-[2px] bg-white">
      <table className={`w-full text-left border-collapse text-xs font-mono-ledger ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead
      className={`bg-[#FAF8F3] border-b border-[#D9D3C5] text-[11px] font-semibold text-[#5B6475] uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-[#D9D3C5]/60 text-[#14213D] ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tr className={`hover:bg-[#FAF8F3]/60 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th className={`px-3 py-2.5 font-semibold text-left select-none ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`px-3 py-2.5 align-middle whitespace-nowrap ${className}`} {...props}>
      {children}
    </td>
  );
};
