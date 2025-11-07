'use client';

import { X } from 'lucide-react';

export type FilterType = 'category' | 'source' | 'date' | 'tag';

export interface FilterChip {
  id: string;
  label: string;
  type: FilterType;
  value: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
}

/**
 * FilterChips Component
 * Displays active filters as removable chips
 */
export function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onRemove(filter.id)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          aria-label={`Remove ${filter.label} filter`}
        >
          <span className="font-medium">{filter.label}</span>
          <X className="w-3 h-3" />
        </button>
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

