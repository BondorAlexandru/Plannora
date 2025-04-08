import React from 'react';
import { SelectedProvider } from '../types';
import { Provider } from '../data/mockData';

interface SelectedProvidersListProps {
  selectedProviders: SelectedProvider[];
  handleSelectProvider: (provider: SelectedProvider) => void;
  handleViewProviderDetail: (provider: Provider) => void;
  showAffordableAlternatives: (provider: SelectedProvider) => void;
  providers: Provider[];
  budgetRemaining: number;
  event: { budget: number; guestCount: number };
}

function SelectedProvidersList({
  selectedProviders,
  handleSelectProvider,
  handleViewProviderDetail,
  showAffordableAlternatives,
  providers,
  budgetRemaining,
  event
}: SelectedProvidersListProps) {
  if (selectedProviders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-gray-500">
          You haven't selected any services yet
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Click on services above to add them to your plan
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {selectedProviders.map((provider) => {
        const fullProvider = providers.find(
          (p) => p.id === provider.id
        );
        const hasOffers =
          fullProvider?.offers && fullProvider.offers.length > 0;

        return (
          <div
            key={provider.id}
            className="bg-white p-4 rounded-lg flex justify-between items-start"
          >
            <div className="flex items-center">
              <img
                src={provider.image}
                alt={provider.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <h4 className="font-heading font-semibold text-gray-800">
                  {provider.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {provider.category}
                </p>
                {provider.offerName && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Package: {provider.offerName}
                  </p>
                )}
                <p className="text-primary-600 font-bold mt-1">
                  ${provider.price.toLocaleString()}
                  {provider.isPerPerson &&
                    provider.originalPrice && (
                      <span className="text-xs text-gray-500 ml-1">
                        (${provider.originalPrice} ×{" "}
                        {event.guestCount})
                      </span>
                    )}
                </p>
                {/* Show options */}
                <div className="mt-1 flex space-x-2">
                  {/* Show alternatives link if cheaper options exist */}
                  {event.budget > 0 &&
                    provider.price > budgetRemaining / 5 && (
                      <button
                        onClick={(e: any) => {
                          e.stopPropagation();
                          showAffordableAlternatives(provider);
                        }}
                        className="text-xs text-primary-600 hover:text-primary-800 underline"
                      >
                        See cheaper options
                      </button>
                    )}

                  {/* View/change details button for providers with offers */}
                  {hasOffers && (
                    <button
                      onClick={() =>
                        handleViewProviderDetail(fullProvider!)
                      }
                      className="text-xs text-gray-600 hover:text-gray-800 underline ml-2"
                    >
                      View/change package
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSelectProvider(provider)}
              className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SelectedProvidersList; 