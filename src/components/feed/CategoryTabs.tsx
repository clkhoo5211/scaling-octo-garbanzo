"use client";

import type { NewsCategory } from "@/lib/sources/types";

interface CategoryTabsProps {
  selectedCategory?: NewsCategory;
  onSelectCategory?: (category: NewsCategory | undefined) => void;
}

export function CategoryTabs({
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  const categories: Array<{
    id: NewsCategory | undefined;
    label: string;
  }> = [
    { id: undefined, label: "All" },
    { id: "tech", label: "Tech" },
    { id: "crypto", label: "Crypto" },
    { id: "business", label: "Business" },
    { id: "science", label: "Science" },
    { id: "health", label: "Health" },
    { id: "sports", label: "Sports" },
    { id: "entertainment", label: "Entertainment" },
    { id: "social", label: "Social" },
    { id: "general", label: "General" },
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id || "all"}
          onClick={() => onSelectCategory?.(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === category.id
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
