import React from 'react';
import { useEvent } from '../context/EventContext';
import { ProviderCategory } from '../data/mockData';

export default function SelectedProviders() {
  const { eventConfig, removeItem, updateItemQuantity, calculateTotal } = useEvent();
  
  const categories = Object.values(ProviderCategory);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-primary-600 text-white px-6 py-4">
        <h2 className="text-xl font-semibold">Selected Services</h2>
      </div>
      
      {eventConfig.items.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p>No services selected yet</p>
          <p className="text-sm mt-1">Browse the categories and add services to your event</p>
        </div>
      ) : (
        <div>
          {categories.map((category) => {
            const items = eventConfig.items.filter(
              (item) => item.provider.category === category
            );
            
            if (items.length === 0) return null;
            
            return (
              <div key={category} className="border-b border-gray-200 last:border-b-0">
                <div className="bg-gray-50 px-6 py-3">
                  <h3 className="text-md font-medium text-gray-700">{category}</h3>
                </div>
                <ul>
                  {items.map((item) => (
                    <li key={item.provider.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={item.provider.image}
                          alt={item.provider.name}
                          className="h-10 w-10 rounded-md object-cover mr-3"
                        />
                        <div>
                          <h4 className="text-sm font-medium">{item.provider.name}</h4>
                          <p className="text-xs text-gray-500">
                            {formatPrice(item.provider.price)}
                            {category === ProviderCategory.CATERING ? ' per person' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateItemQuantity(
                              item.provider.id, 
                              Math.max(1, item.quantity - 1)
                            )}
                            className="text-gray-500 hover:text-gray-700 p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          <span className="mx-2 text-sm w-6 text-center">{item.quantity}</span>
                          
                          <button
                            onClick={() => updateItemQuantity(item.provider.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-gray-700 p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.provider.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold">{formatPrice(calculateTotal())}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              * Catering costs are calculated based on your guest count.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 