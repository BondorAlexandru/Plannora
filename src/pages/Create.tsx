import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { Event, SelectedProvider } from '../types';
import { providers, ProviderCategory } from '../data/mockData';

export default function Create() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') as ProviderCategory | null;
  
  const [event, setEvent] = useState<Event>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    guestCount: 0,
    budget: 0,
    eventType: 'Party',
    selectedProviders: []
  });
  
  const [step, setStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState<ProviderCategory | null>(initialCategory);
  const [budgetSuggestions, setBudgetSuggestions] = useState<{
    category: ProviderCategory;
    suggestion: string;
    minPrice: number;
  }[]>([]);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [budgetImpact, setBudgetImpact] = useState<{
    provider: SelectedProvider;
    impact: string;
    isPositive: boolean;
  } | null>(null);
  
  const navigate = useNavigate();

  // Load saved event data if it exists
  useEffect(() => {
    const savedEvent = localStorage.getItem('event');
    if (savedEvent) {
      setEvent(JSON.parse(savedEvent));
    }
  }, []);
  
  // Save event data whenever it changes
  useEffect(() => {
    localStorage.setItem('event', JSON.stringify(event));
  }, [event]);

  // Generate budget suggestions based on event type and guest count
  useEffect(() => {
    if (event.budget > 0 && event.guestCount > 0) {
      const suggestions = [];
      
      // Venue suggestion
      if (!event.selectedProviders.some(p => p.category === ProviderCategory.VENUE)) {
        const minVenueCost = Math.min(...providers
          .filter(p => p.category === ProviderCategory.VENUE)
          .map(p => p.price));
        
        if (minVenueCost > event.budget * 0.4) {
          suggestions.push({
            category: ProviderCategory.VENUE,
            suggestion: "Consider allocating 40-50% of your budget for a venue",
            minPrice: minVenueCost
          });
        }
      }
      
      // Catering suggestion
      if (!event.selectedProviders.some(p => p.category === ProviderCategory.CATERING)) {
        const minCateringPerPerson = Math.min(...providers
          .filter(p => p.category === ProviderCategory.CATERING)
          .map(p => p.price));
        
        const totalCateringCost = minCateringPerPerson * event.guestCount;
        
        if (totalCateringCost > event.budget * 0.3) {
          suggestions.push({
            category: ProviderCategory.CATERING,
            suggestion: `Plan around $${minCateringPerPerson} per person for catering`,
            minPrice: totalCateringCost
          });
        }
      }
      
      // Music suggestion
      if (!event.selectedProviders.some(p => p.category === ProviderCategory.MUSIC)) {
        const minMusicCost = Math.min(...providers
          .filter(p => p.category === ProviderCategory.MUSIC)
          .map(p => p.price));
        
        if (minMusicCost > event.budget * 0.15) {
          suggestions.push({
            category: ProviderCategory.MUSIC,
            suggestion: "Music typically costs 10-15% of your total budget",
            minPrice: minMusicCost
          });
        }
      }
      
      // Photography suggestion
      if (!event.selectedProviders.some(p => p.category === ProviderCategory.PHOTOGRAPHY)) {
        const minPhotoCost = Math.min(...providers
          .filter(p => p.category === ProviderCategory.PHOTOGRAPHY)
          .map(p => p.price));
        
        if (minPhotoCost > event.budget * 0.1) {
          suggestions.push({
            category: ProviderCategory.PHOTOGRAPHY,
            suggestion: "Photography usually takes up 10-12% of your budget",
            minPrice: minPhotoCost
          });
        }
      }
      
      setBudgetSuggestions(suggestions);
    }
  }, [event.budget, event.guestCount, event.selectedProviders]);

  // Check budget impact when selections change
  useEffect(() => {
    if (event.selectedProviders.length > 0 && event.budget > 0) {
      const total = calculateTotal();
      const percentUsed = (total / event.budget) * 100;
      
      // Show warning when budget is close to being exceeded or already exceeded
      if (percentUsed > 90) {
        setShowBudgetAlert(true);
      } else {
        setShowBudgetAlert(false);
      }
    } else {
      setShowBudgetAlert(false);
    }
  }, [event.selectedProviders, event.budget]);
  
  const handleEventSubmit = (eventData: Partial<Event>) => {
    setEvent(prev => ({
      ...prev,
      ...eventData
    }));
    setStep(2);
  };
  
  const handleSelectProvider = (provider: SelectedProvider) => {
    const isAlreadySelected = event.selectedProviders.some(p => p.id === provider.id);
    
    // Calculate actual price based on whether this is a per-person service
    const isPerPerson = provider.category === ProviderCategory.CATERING;
    const actualPrice = isPerPerson ? provider.price * event.guestCount : provider.price;
    
    if (isAlreadySelected) {
      // Show budget impact for removal
      const selectedProvider = event.selectedProviders.find(p => p.id === provider.id);
      const priceToRemove = selectedProvider?.price || 0;
      
      setBudgetImpact({
        provider,
        impact: `Removing ${provider.name} will free up $${priceToRemove.toLocaleString()} from your budget.`,
        isPositive: true
      });
      
      setEvent(prev => ({
        ...prev,
        selectedProviders: prev.selectedProviders.filter(p => p.id !== provider.id)
      }));
    } else {
      // Check budget impact before adding
      const newTotal = calculateTotal() + actualPrice;
      const remaining = event.budget - newTotal;
      const percentUsed = (newTotal / event.budget) * 100;
      
      // Show budget impact for addition
      if (event.budget > 0) {
        setBudgetImpact({
          provider,
          impact: remaining < 0 
            ? `Adding ${provider.name} will put you $${Math.abs(remaining).toLocaleString()} over budget.` 
            : `Adding ${provider.name} will use ${percentUsed.toFixed(1)}% of your budget.`,
          isPositive: remaining >= 0
        });
      }
      
      // Store the provider with additional metadata
      const providerWithActualPrice = {
        ...provider,
        price: actualPrice,
        originalPrice: provider.price,
        isPerPerson
      };
      
      setEvent(prev => ({
        ...prev,
        selectedProviders: [...prev.selectedProviders, providerWithActualPrice]
      }));
    }
    
    // Clear budget impact after 5 seconds
    setTimeout(() => {
      setBudgetImpact(null);
    }, 5000);
  };
  
  // Recalculate per-person prices when guest count changes
  useEffect(() => {
    if (event.selectedProviders.length > 0) {
      const updatedProviders = event.selectedProviders.map(provider => {
        if (provider.isPerPerson && provider.originalPrice) {
          return {
            ...provider,
            price: provider.originalPrice * event.guestCount
          };
        }
        return provider;
      });
      
      setEvent(prev => ({
        ...prev,
        selectedProviders: updatedProviders
      }));
    }
  }, [event.guestCount]);
  
  const handleSubmit = () => {
    localStorage.setItem('event', JSON.stringify(event));
    navigate('/preview');
  };
  
  const calculateTotal = () => {
    return event.selectedProviders.reduce((total, provider) => total + provider.price, 0);
  };
  
  const isOverBudget = event.budget > 0 && calculateTotal() > event.budget;
  const budgetRemaining = event.budget - calculateTotal();
  const percentUsed = event.budget > 0 ? (calculateTotal() / event.budget) * 100 : 0;
  
  // Find alternative services that fit within budget for a specific category
  const getAlternatives = (category: ProviderCategory, maxPrice: number) => {
    return providers
      .filter(p => 
        p.category === category && 
        p.price <= maxPrice && 
        !event.selectedProviders.some(sp => sp.id === p.id)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  };
  
  const handleSetActiveCategory = (category: ProviderCategory) => {
    setActiveCategory(category);
    
    // Scroll to the category section
    setTimeout(() => {
      const element = document.getElementById(`category-${category}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display text-primary-600 mb-4">
          Create Your Event
        </h1>
        <div className="w-24 h-0.5 bg-primary-300 mx-auto mb-6"></div>
        <p className="text-lg font-heading text-gray-700">Let's make your celebration unforgettable!</p>
      </div>
      
      {/* Step Indicator */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 1 ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-500'} font-bold text-lg shadow-sm`}>
            1
          </div>
          <div className={`w-16 h-0.5 ${step === 1 ? 'bg-gray-200' : 'bg-primary-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 2 ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-500'} font-bold text-lg shadow-sm`}>
            2
          </div>
        </div>
      </div>
      
      {step === 1 ? (
        <div className="bg-white rounded-xl shadow-fun p-6 md:p-8 transition-all">
          <h2 className="text-xl font-heading font-bold mb-6 text-center text-gray-800">Event Details</h2>
          <EventForm initialValues={event} onSubmit={handleEventSubmit} />
        </div>
      ) : (
        <div>
          {/* Budget Summary - Make it sticky */}
          {event.budget > 0 && (
            <div className="sticky top-4 z-10 mb-8">
              <div className="bg-white rounded-xl shadow-fun p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-heading font-bold text-gray-800">Budget Summary</h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Your Budget</p>
                    <p className="text-xl font-heading font-bold text-primary-600">${event.budget.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Budget progress bar */}
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        percentUsed <= 70 ? 'bg-green-500' : 
                        percentUsed <= 90 ? 'bg-yellow-500' : 
                        'bg-red-500'
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
                
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Current Total</p>
                    <p className={`text-xl font-heading font-bold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                      ${calculateTotal().toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className={`text-xl font-heading font-bold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                      ${budgetRemaining.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Budget impact alert */}
                {budgetImpact && (
                  <div className={`rounded-lg p-4 mb-4 flex items-start ${
                    budgetImpact.isPositive ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'
                  }`}>
                    <span className="mr-2">{budgetImpact.isPositive ? '✅' : '⚠️'}</span>
                    <p className={budgetImpact.isPositive ? 'text-green-600' : 'text-yellow-700'}>
                      {budgetImpact.impact}
                    </p>
                  </div>
                )}
                
                {isOverBudget && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                    <p className="text-red-600 font-medium">
                      Your selections exceed your budget by ${(calculateTotal() - event.budget).toLocaleString()}.
                      Consider removing some items or adjusting your budget.
                    </p>
                  </div>
                )}
                
                {showBudgetAlert && !isOverBudget && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-4">
                    <p className="text-yellow-700 font-medium">
                      You're using {percentUsed.toFixed(1)}% of your budget! Choose remaining services carefully.
                    </p>
                  </div>
                )}
                
                {budgetSuggestions.length > 0 && (
                  <div className="bg-festive-yellow-50 border border-festive-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-heading font-semibold text-primary-700 mb-2">Budget Suggestions</h3>
                    <ul className="space-y-2">
                      {budgetSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-festive-yellow-500 mr-2">💡</span>
                          <div>
                            <p className="font-medium text-gray-800">{suggestion.category}</p>
                            <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                            <button 
                              onClick={() => handleSetActiveCategory(suggestion.category)}
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
              </div>
            </div>
          )}

          {/* Category quick navigation */}
          <div className="bg-white rounded-xl shadow-fun p-4 mb-8 overflow-x-auto">
            <div className="flex space-x-2">
              {Object.values(ProviderCategory).map(category => (
                <button
                  key={category}
                  className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                    activeCategory === category 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleSetActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Selection Section */}
          <div className="bg-white rounded-xl shadow-fun p-6 md:p-8 mb-8">
            <h2 className="text-xl font-heading font-bold mb-6 text-gray-800">Select Services</h2>
            <div className="space-y-6">
              {Object.values(ProviderCategory).map(category => {
                const categoryProviders = providers.filter(p => p.category === category);
                if (categoryProviders.length === 0) return null;
                
                return (
                  <div id={`category-${category}`} key={category} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-heading font-semibold mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryProviders.map(provider => {
                        const isSelected = event.selectedProviders.some(p => p.id === provider.id);
                        const isOverBudgetItem = event.budget > 0 && provider.price > budgetRemaining && !isSelected;
                        const isPerPerson = provider.category === ProviderCategory.CATERING;
                        const displayPrice = isPerPerson 
                          ? `$${provider.price.toLocaleString()} per person (Total: $${(provider.price * event.guestCount).toLocaleString()})`
                          : `$${provider.price.toLocaleString()}`;
                        
                        return (
                          <div 
                            key={provider.id} 
                            className={`p-4 rounded-lg cursor-pointer transition-all border ${
                              isSelected 
                                ? 'border-primary-400 bg-primary-50' 
                                : isOverBudgetItem
                                  ? 'border-red-200 bg-red-50 hover:border-red-300'
                                  : 'border-gray-200 bg-white hover:border-primary-200'
                            }`}
                            onClick={() => handleSelectProvider({
                              id: provider.id,
                              name: provider.name,
                              price: provider.price,
                              category: provider.category,
                              image: provider.image
                            })}
                          >
                            <div className="flex items-center mb-3">
                              <img 
                                src={provider.image} 
                                alt={provider.name}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                              />
                              <div>
                                <h4 className="font-heading font-semibold">{provider.name}</h4>
                                <div className="flex items-center">
                                  <span className="text-yellow-400 mr-1">★</span>
                                  <span className="text-sm text-gray-600">{provider.rating}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{provider.description}</p>
                            <div className="flex justify-between items-center">
                              <span className={`font-heading font-bold ${isOverBudgetItem ? 'text-red-600' : 'text-primary-600'}`}>
                                {displayPrice}
                              </span>
                              {isSelected && (
                                <span className="bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                                  Selected
                                </span>
                              )}
                              {isOverBudgetItem && !isSelected && (
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                                  Over budget
                                </span>
                              )}
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
            <h2 className="text-xl font-heading font-bold mb-4 text-primary-700">Selected Services Summary</h2>
            
            {event.selectedProviders.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-500">You haven't selected any services yet</p>
                <p className="text-sm text-gray-400 mt-2">Click on services above to add them to your plan</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {event.selectedProviders.map((provider) => (
                    <div key={provider.id} className="bg-white p-4 rounded-lg flex justify-between items-start">
                      <div className="flex items-center">
                        <img 
                          src={provider.image} 
                          alt={provider.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <h4 className="font-heading font-semibold text-gray-800">{provider.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{provider.category}</p>
                          <p className="text-primary-600 font-bold mt-1">${provider.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSelectProvider(provider)}
                        className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                  <div>
                    <p className="text-gray-700">Total Cost:</p>
                    <p className="text-2xl font-heading font-bold text-primary-600">
                      ${calculateTotal().toLocaleString()}
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleSubmit}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-sm transition"
                  >
                    Generate Quote
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 