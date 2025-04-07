import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventForm from '../components/EventForm';
import CategoryFilter from '../components/CategoryFilter';
import ProviderCard from '../components/ProviderCard';
import SelectedProviders from '../components/SelectedProviders';
import { ProviderCategory, providers } from '../data/mockData';

export default function CreateEvent() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | 'all'>(
    categoryParam as ProviderCategory || 'all'
  );

  // Update selected category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam as ProviderCategory);
    }
  }, [categoryParam]);

  const filteredProviders = selectedCategory === 'all'
    ? providers
    : providers.filter(provider => provider.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create Your Event</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <EventForm />
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
        </div>
        
        <div className="lg:col-span-2">
          <div className="mb-8">
            <SelectedProviders />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {selectedCategory === 'all' ? 'All Services' : selectedCategory}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProviders.map(provider => (
                <ProviderCard 
                  key={provider.id} 
                  provider={provider} 
                />
              ))}
              
              {filteredProviders.length === 0 && (
                <div className="col-span-full p-8 text-center bg-white rounded-lg shadow">
                  <p className="text-gray-500">No providers found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 