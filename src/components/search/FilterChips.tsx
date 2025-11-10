"use client";

import { X } from "lucide-react";

export type FilterType = "category" | "source" | "date" | "tag";

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
export function FilterChips({
  filters,
  onRemove,
  onClearAll,
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-card bg-surface-subtle/60 p-3">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onRemove(filter.id)}
          className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm text-primary transition-smooth hover:bg-primary/15"
          aria-label={`Remove ${filter.label} filter`}
        >
          <span className="font-medium">{filter.label}</span>
          <X className="h-3 w-3" />
        </button>
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm font-medium text-text-tertiary underline-offset-4 transition-smooth hover:text-text-primary hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
