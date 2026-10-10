import React from 'react';
import { Search, Filter, RotateCcw, Calendar, Clock, Sparkles, X, ChevronDown } from 'lucide-react';

const categories = [
  'All',
  'Fest',
  'Workshop',
  'Guest Lecture',
  'Competition',
  'Cultural',
  'Sports',
  'Other',
];

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
];

const dateRanges = [
  { label: 'All Dates', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

const EventFilter = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedDateRange,
  setSelectedDateRange,
  onReset,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    (selectedStatus && selectedStatus !== '') ||
    (selectedDateRange && selectedDateRange !== 'all');

  const activeFilterCount = [
    searchQuery.trim() !== '',
    selectedCategory !== 'All',
    selectedStatus && selectedStatus !== '',
    selectedDateRange && selectedDateRange !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5 border border-[#27272A] shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      {/* Top Row: Search Input & Quick Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title, speaker, department, or venue..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-sm placeholder-[#71717A] focus:outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A1A1AA] hover:text-[#FAFAFA] rounded-md transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters (Status & Date Range) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Status Dropdown */}
          <div className="relative min-w-[130px] flex-1 sm:flex-initial">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs font-semibold text-[#FAFAFA] focus:outline-none focus:border-[#A3E635] cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#18181B] text-[#FAFAFA]">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A1A1AA] pointer-events-none" />
          </div>

          {/* Date Range Dropdown */}
          <div className="relative min-w-[130px] flex-1 sm:flex-initial">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs font-semibold text-[#FAFAFA] focus:outline-none focus:border-[#A3E635] cursor-pointer"
            >
              {dateRanges.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#18181B] text-[#FAFAFA]">
                  {opt.label}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A1A1AA] pointer-events-none" />
          </div>

          {/* Reset Filters Action */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#FAFAFA] bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] transition-all whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#A3E635]" />
              <span>Clear ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="pt-2 border-t border-[#27272A]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA] flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-[#A3E635]" />
            Categories
          </span>
          {selectedCategory !== 'All' && (
            <span className="text-[11px] text-[#A3E635] font-semibold">
              Filter: {selectedCategory}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#A3E635] text-[#09090B] font-bold shadow-[0_0_15px_rgba(163,230,53,0.25)] ring-1 ring-[#A3E635]'
                    : 'bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] border border-[#27272A]'
                }`}
              >
                {cat === 'All' && <Sparkles className="w-3 h-3 text-current" />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventFilter;
