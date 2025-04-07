import { Link } from 'react-router-dom';
import { useEvent } from '../context/EventContext';
import { ProviderCategory } from '../data/mockData';

export default function Preview() {
  const { eventConfig } = useEvent();
  const { name, date, guestCount, items } = eventConfig;

  const categories = Object.values(ProviderCategory);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateCateringTotal = () => {
    const cateringItems = items.filter(
      (item) => item.provider.category === ProviderCategory.CATERING
    );
    return cateringItems.reduce(
      (total, item) => total + item.provider.price * item.quantity * guestCount,
      0
    );
  };

  const calculateNonCateringTotal = () => {
    const nonCateringItems = items.filter(
      (item) => item.provider.category !== ProviderCategory.CATERING
    );
    return nonCateringItems.reduce(
      (total, item) => total + item.provider.price * item.quantity,
      0
    );
  };

  const total = calculateNonCateringTotal() + calculateCateringTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Event Summary</h1>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto mb-4 text-gray-400"
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
          <h2 className="text-xl font-semibold mb-2">No services selected yet</h2>
          <p className="text-gray-600 mb-6">
            You need to add services to your event before previewing it.
          </p>
          <Link to="/create" className="btn btn-primary">
            Add Services
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">
              {name || 'Unnamed Event'} - {formatDate(date)}
            </h2>
            <p className="text-sm opacity-80">
              {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-8">
              {categories.map((category) => {
                const categoryItems = items.filter(
                  (item) => item.provider.category === category
                );

                if (categoryItems.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
                      {category}
                    </h3>
                    <ul className="space-y-4">
                      {categoryItems.map((item) => (
                        <li key={item.provider.id} className="flex items-start justify-between">
                          <div className="flex items-start">
                            <img
                              src={item.provider.image}
                              alt={item.provider.name}
                              className="h-16 w-16 rounded-md object-cover mr-4"
                            />
                            <div>
                              <h4 className="font-medium">{item.provider.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.provider.description}
                              </p>
                              <p className="text-sm mt-1">
                                Quantity: {item.quantity} x {formatPrice(item.provider.price)}
                                {category === ProviderCategory.CATERING ? ' per person' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {category === ProviderCategory.CATERING
                                ? formatPrice(
                                    item.provider.price * item.quantity * guestCount
                                  )
                                : formatPrice(item.provider.price * item.quantity)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Services Subtotal:</span>
                  <span>{formatPrice(calculateNonCateringTotal())}</span>
                </div>
                {calculateCateringTotal() > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">
                      Catering Subtotal ({guestCount} guests):
                    </span>
                    <span>{formatPrice(calculateCateringTotal())}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <Link to="/create" className="btn btn-outline mr-4">
                Back to Edit
              </Link>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  alert('Your event has been saved! In a real application, this would generate a PDF or send a quote.');
                }}
              >
                Save & Generate Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 