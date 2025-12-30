import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DataTable({ 
  columns, 
  data, 
  onRowClick,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) {
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              {columns.map((column, idx) => (
                <th 
                  key={idx}
                  className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((row, rowIdx) => (
              <motion.tr
                key={row.id || rowIdx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIdx * 0.05 }}
                onClick={() => onRowClick?.(row)}
                className="hover:bg-slate-800/30 cursor-pointer transition-colors duration-200"
              >
                {columns.map((column, colIdx) => (
                  <td key={colIdx} className="px-4 py-4 text-sm text-slate-300">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-slate-700/50">
          <p className="text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}