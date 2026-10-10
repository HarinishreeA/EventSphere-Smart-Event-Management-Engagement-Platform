import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ page, pages, total, limit, onPageChange, onLimitChange }) => {
  if (pages <= 1 && total <= limit) return null;

  const startIdx = Math.min((page - 1) * limit + 1, total);
  const endIdx = Math.min(page * limit, total);

  // Generate sliding page numbers (max 5 buttons)
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    return range;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-[#27272A]">
      
      {/* Range and Total Metadata */}
      <div className="text-xs text-[#A1A1AA] font-medium">
        Showing <span className="font-bold text-[#FAFAFA]">{total > 0 ? `${startIdx}–${endIdx}` : 0}</span> of{' '}
        <span className="font-bold text-[#FAFAFA]">{total}</span> events
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
        {/* Page Size Dropdown */}
        {onLimitChange && (
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-[#18181B] border border-[#27272A] text-[#FAFAFA] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#A3E635] text-xs font-semibold cursor-pointer"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] disabled:opacity-25 disabled:cursor-not-allowed border border-[#27272A] transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Prev Page */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] disabled:opacity-25 disabled:cursor-not-allowed border border-[#27272A] transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbered Page Buttons */}
          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                page === num
                  ? 'bg-[#A3E635] text-[#09090B] shadow-[0_0_12px_rgba(163,230,53,0.3)] ring-1 ring-[#A3E635]'
                  : 'bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#27272A]'
              }`}
            >
              {num}
            </button>
          ))}

          {/* Next Page */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] disabled:opacity-25 disabled:cursor-not-allowed border border-[#27272A] transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(pages)}
            disabled={page >= pages}
            className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] disabled:opacity-25 disabled:cursor-not-allowed border border-[#27272A] transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
