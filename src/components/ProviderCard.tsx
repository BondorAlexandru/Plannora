import React, { useState } from 'react';
import { Provider } from '../data/mockData';
import { useEvent } from '../context/EventContext';

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const { addItem, eventConfig } = useEvent();
  const [quantity, setQuantity] = useState(1);

  const isAdded = eventConfig.items.some(item => item.provider.id === provider.id);

  const handleAddToEvent = () => {
    addItem(provider, quantity);
  };

  return (
    <div className="card transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={provider.image} 
          alt={provider.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
          ${provider.price}
          {provider.category === 'Catering' && ' per person'}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{provider.name}</h3>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm ml-1">{provider.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">{provider.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2 py-1 bg-gray-200 rounded-l-md"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 px-2 py-1 text-center border-y border-gray-200"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-2 py-1 bg-gray-200 rounded-r-md"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToEvent}
            disabled={isAdded}
            className={`btn ${
              isAdded ? 'bg-green-600 hover:bg-green-700' : 'btn-primary'
            }`}
          >
            {isAdded ? 'Added' : 'Add to Event'}
          </button>
        </div>
      </div>
    </div>
  );
} 