"use client";

import type { NewsCategory } from "@/lib/sources/types";

interface CategoryTabsProps {
  selectedCategory: NewsCategory;
  onSelectCategory?: (category: NewsCategory) => void;
}

export function CategoryTabs({
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  const categories: Array<{
    id: NewsCategory;
    label: string;
  }> = [
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
          key={category.id}
          onClick={() => onSelectCategory?.(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            selectedCategory === category.id
              ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
