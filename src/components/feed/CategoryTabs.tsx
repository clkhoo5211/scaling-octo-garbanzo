'use client';

interface CategoryTabsProps {
  selectedCategory?: 'tech' | 'crypto' | 'social' | 'general';
  onSelectCategory?: (category: 'tech' | 'crypto' | 'social' | 'general' | undefined) => void;
}

export function CategoryTabs({
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  const categories: Array<{
    id: 'tech' | 'crypto' | 'social' | 'general' | undefined;
    label: string;
  }> = [
    { id: undefined, label: 'All' },
    { id: 'tech', label: 'Tech' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'social', label: 'Social' },
    { id: 'general', label: 'General' },
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id || 'all'}
          onClick={() => onSelectCategory?.(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === category.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

