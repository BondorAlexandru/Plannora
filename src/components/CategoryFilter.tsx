import React from 'react';
import { ProviderCategory } from '../data/mockData';

interface CategoryFilterProps {
  selectedCategory: ProviderCategory | 'all';
  onSelectCategory: (category: ProviderCategory | 'all') => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const categories = Object.values(ProviderCategory);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <div className="bg-primary-600 text-white px-6 py-4">
        <h2 className="text-xl font-semibold">Categories</h2>
      </div>
      <div className="p-4">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-100 text-primary-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <button
                onClick={() => onSelectCategory(category)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-100 text-primary-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 