import React from 'react';
import { Event, SelectedProvider } from '../types';
import { Provider, ProviderCategory } from '../data/mockData';

interface ServicesSelectionProps {
  event: Event;
  providers: Provider[];
  activeCategory: ProviderCategory | null;
  setActiveCategory: (category: ProviderCategory) => void;
  handleSelectProvider: (provider: SelectedProvider) => void;
  handleViewProviderDetail: (provider: Provider) => void;
  calculateTotal: () => number;
  percentUsed: number;
  budgetRemaining: number;
  isOverBudget: boolean;
  setStep: (step: number) => void;
  handleSubmit: () => void;
  budgetImpact: {
    provider: SelectedProvider;
    impact: string;
    isPositive: boolean;
  } | null;
  showBudgetAlert: boolean;
  budgetSuggestions: {
    category: ProviderCategory;
    suggestion: string;
    minPrice: number;
  }[];
  onQuickNote?: (providerId: string, providerName: string) => void;
  vendorNotes?: Record<string, number>;
}

function ServicesSelection({
  event,
  providers,
  activeCategory,
  setActiveCategory,
  handleSelectProvider,
  handleViewProviderDetail,
  calculateTotal,
  percentUsed,
  budgetRemaining,
  isOverBudget,
  setStep,
  handleSubmit,
  budgetImpact,
  showBudgetAlert,
  budgetSuggestions,
  onQuickNote,
  vendorNotes
}: ServicesSelectionProps) {
  const handleSetActiveCategory = (category: ProviderCategory) => {
    setActiveCategory(category);

    // Scroll to the category section
    setTimeout(() => {
      const element = document.getElementById(`category-${category}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Add state for collapsed budget panel
  const [isBudgetPanelCollapsed, setIsBudgetPanelCollapsed] = React.useState(false);

  // Toggle budget panel visibility
  const toggleBudgetPanel = () => {
    setIsBudgetPanelCollapsed(!isBudgetPanelCollapsed);
  };

  return (
    <div>
      {/* Budget Summary - Make it sticky */}
      {event.budget > 0 && (
        <div className="sticky top-12 z-20 mb-8">
          <div className="bg-white rounded-xl shadow-fun p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-heading font-bold text-gray-800">
                Budget Summary
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Your Budget</p>
                  <p className="text-xl font-heading font-bold text-primary-600">
                    ${event.budget.toLocaleString()}
                  </p>
                </div>
                {/* Add mobile collapse button */}
                <button 
                  onClick={toggleBudgetPanel}
                  className="bg-gray-100 p-2 rounded-full"
                  aria-label={isBudgetPanelCollapsed ? "Expand budget panel" : "Collapse budget panel"}
                >
                  {isBudgetPanelCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Always visible budget progress bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-600">Current: ${calculateTotal().toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Remaining: ${budgetRemaining.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    percentUsed <= 70
                      ? "bg-green-500"
                      : percentUsed <= 90
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Collapsible content section */}
            <div className={`transition-all duration-300 overflow-hidden ${isBudgetPanelCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px]'}`}>
              {/* Other budget details */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-600">Current Total</p>
                  <p
                    className={`text-xl font-heading font-bold ${
                      isOverBudget ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    ${calculateTotal().toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p
                    className={`text-xl font-heading font-bold ${
                      isOverBudget ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    ${budgetRemaining.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Budget impact alert */}
              {budgetImpact && (
                <div
                  className={`rounded-lg p-4 mb-4 flex items-start ${
                    budgetImpact.isPositive
                      ? "bg-green-50 border border-green-100"
                      : "bg-yellow-50 border border-yellow-100"
                  }`}
                >
                  <span className="mr-2">
                    {budgetImpact.isPositive ? "✅" : "⚠️"}
                  </span>
                  <p
                    className={
                      budgetImpact.isPositive
                        ? "text-green-600"
                        : "text-yellow-700"
                    }
                  >
                    {budgetImpact.impact}
                  </p>
                </div>
              )}

              {isOverBudget && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                  <p className="text-red-600 font-medium">
                    Your selections exceed your budget by $
                    {(calculateTotal() - event.budget).toLocaleString()}.
                    Consider removing some items or adjusting your budget.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md transition-colors"
                    >
                      Adjust budget
                    </button>
                  </div>
                </div>
              )}

              {showBudgetAlert && !isOverBudget && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-4">
                  <p className="text-yellow-700 font-medium">
                    You're using {percentUsed.toFixed(1)}% of your budget!
                    Choose remaining services carefully.
                  </p>
                </div>
              )}

              {budgetSuggestions.length > 0 && (
                <div className="bg-festive-yellow-50 border border-festive-yellow-200 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-heading font-semibold text-primary-700 mb-2">
                    Budget Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {budgetSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-festive-yellow-500 mr-2">
                          💡
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">
                            {suggestion.category}
                          </p>
                          <p className="text-sm text-gray-600">
                            {suggestion.suggestion}
                          </p>
                          <button
                            onClick={() =>
                              handleSetActiveCategory(suggestion.category)
                            }
                            className="text-sm text-primary-600 hover:text-primary-800 mt-1 underline"
                          >
                            View options
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category quick navigation - Integrated into budget summary */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3 overflow-x-auto">
                <div className="flex space-x-2">
                  {Object.values(ProviderCategory).map((category) => (
                    <button
                      key={category}
                      className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                        activeCategory === category
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => handleSetActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Selection Section */}
      <div className="bg-white rounded-xl shadow-fun p-6 md:p-8 mb-8">
        <h2 className="text-xl font-heading font-bold mb-6 text-gray-800">
          Select Services
        </h2>
        <div className="space-y-6 scrollbar-hide">
          {Object.values(ProviderCategory).map((category) => {
            const categoryProviders = providers.filter(
              (p) => p.category === category
            );
            if (categoryProviders.length === 0) return null;

            return (
              <div
                id={`category-${category}`}
                key={category}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <h3 className="text-lg font-heading font-semibold mb-3">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryProviders.map((provider) => {
                    const isSelected = event.selectedProviders.some(
                      (p) => p.id === provider.id
                    );
                    const selectedProviderWithOffer =
                      event.selectedProviders.find(
                        (p) => p.id === provider.id
                      );
                    const isOverBudgetItem =
                      event.budget > 0 &&
                      provider.price > budgetRemaining &&
                      !isSelected;
                    const isPerPerson =
                      provider.category === ProviderCategory.CATERING;

                    let displayPrice = "";
                    if (
                      isSelected &&
                      selectedProviderWithOffer?.offerName
                    ) {
                      displayPrice = `${
                        selectedProviderWithOffer.offerName
                      }: $${selectedProviderWithOffer.price.toLocaleString()}`;
                      if (isPerPerson) {
                        displayPrice = `${
                          selectedProviderWithOffer.offerName
                        }: $${selectedProviderWithOffer.originalPrice?.toLocaleString()} per person (Total: $${selectedProviderWithOffer.price.toLocaleString()})`;
                      }
                    } else {
                      displayPrice = isPerPerson
                        ? `$${provider.price.toLocaleString()} per person (Total: $${(
                            provider.price * event.guestCount
                          ).toLocaleString()})`
                        : `$${provider.price.toLocaleString()}`;
                    }

                    // Check if provider has multiple offers
                    const hasOffers =
                      provider.offers && provider.offers.length > 0;

                    return (
                      <div
                        key={provider.id}
                        className={`p-4 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? "border-primary-400 bg-primary-50"
                            : isOverBudgetItem
                            ? "border-red-200 bg-red-50 hover:border-red-300"
                            : "border-gray-200 bg-white hover:border-primary-200"
                        }`}
                        onClick={() => handleViewProviderDetail(provider)}
                      >
                        <div className="flex items-center mb-3">
                          <img
                            src={provider.image}
                            alt={provider.name}
                            className="w-12 h-12 rounded-full object-cover mr-3"
                          />
                          <div>
                            <h4 className="font-heading font-semibold">
                              {provider.name}
                            </h4>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">
                                ★
                              </span>
                              <span className="text-sm text-gray-600">
                                {provider.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {provider.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span
                            className={`font-heading font-bold ${
                              isOverBudgetItem
                                ? "text-red-600"
                                : "text-primary-600"
                            }`}
                          >
                            {displayPrice}
                          </span>
                          <div className="flex items-center space-x-2">
                            {isOverBudgetItem && !isSelected && (
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                                Over budget
                              </span>
                            )}
                            
                            {/* Info icon for detailed view */}
                            <button
                              onClick={(e: any) => {
                                e.stopPropagation();
                                handleViewProviderDetail(provider);
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1 rounded-full transition-colors"
                              title="View details"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>

                            {/* Selection icons */}
                            {isSelected ? (
                              <>
                                {/* Quick Note Icon for Selected Vendors */}
                                {onQuickNote && (
                                  <button
                                    onClick={(e: any) => {
                                      e.stopPropagation();
                                      onQuickNote(provider.id, provider.name);
                                    }}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-1 rounded-full transition-colors relative"
                                    title="Add quick note"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                    {/* Note count badge */}
                                    {vendorNotes && vendorNotes[provider.id] && (
                                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {vendorNotes[provider.id]}
                                      </div>
                                    )}
                                  </button>
                                )}
                                
                                {/* Remove Button */}
                                <button
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleSelectProvider({
                                      id: provider.id,
                                      name: provider.name,
                                      price: provider.price,
                                      category: provider.category,
                                      image: provider.image,
                                    });
                                  }}
                                  className="bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded-full transition-colors"
                                  title="Remove from selection"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
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
                              </>
                            ) : (
                              <button
                                onClick={(e: any) => {
                                  e.stopPropagation();
                                  handleSelectProvider({
                                    id: provider.id,
                                    name: provider.name,
                                    price: provider.price,
                                    category: provider.category,
                                    image: provider.image,
                                  });
                                }}
                                className="bg-primary-100 hover:bg-primary-200 text-primary-600 p-1 rounded-full transition-colors"
                                title="Add to selection"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Services Summary Section */}
      <div className="bg-primary-50 rounded-xl shadow-fun p-6 mb-8">
        <h2 className="text-xl font-heading font-bold mb-4 text-primary-700">
          Selected Services Summary
        </h2>

        {event.selectedProviders.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-gray-500">
              You haven't selected any services yet
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Click on services above to add them to your plan
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white rounded-lg">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-700">Total Cost:</p>
              <p className="text-2xl font-heading font-bold text-primary-600">
                ${calculateTotal().toLocaleString()}
              </p>
              {isOverBudget && (
                <p className="text-red-500 text-sm">
                  ${(calculateTotal() - event.budget).toLocaleString()}{" "}
                  over budget
                </p>
              )}
              {!isOverBudget && event.budget > 0 && (
                <p className="text-green-600 text-sm">
                  ${budgetRemaining.toLocaleString()} remaining (
                  {(100 - percentUsed).toFixed(1)}% of budget)
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm transition"
              >
                Edit Details
              </button>
              <button
                onClick={handleSubmit}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition"
              >
                Generate Quote
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesSelection; 