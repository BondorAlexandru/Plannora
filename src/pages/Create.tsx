import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EventForm from "../components/EventForm";
import { Event, SelectedProvider } from "../types";
import { providers, ProviderCategory, Provider, Offer } from "../data/mockData";
import ProviderDetail from "../components/ProviderDetail";
import { useAuth } from "../contexts/AuthContext";
import eventService from "../services/eventService";

export default function Create() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get(
    "category"
  ) as ProviderCategory | null;

  const [event, setEvent] = useState<Event>({
    name: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    guestCount: 0,
    budget: 0,
    eventType: "Party",
    selectedProviders: [],
  });

  const [step, setStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState<ProviderCategory | null>(
    initialCategory
  );
  const [budgetSuggestions, setBudgetSuggestions] = useState<
    {
      category: ProviderCategory;
      suggestion: string;
      minPrice: number;
    }[]
  >([]);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [budgetImpact, setBudgetImpact] = useState<{
    provider: SelectedProvider;
    impact: string;
    isPositive: boolean;
  } | null>(null);

  const [quickAlternatives, setQuickAlternatives] = useState<{
    category: ProviderCategory;
    originalPrice: number;
    alternatives: ReturnType<typeof getAlternatives>;
  } | null>(null);

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  const navigate = useNavigate();

  const { isAuthenticated, guestMode } = useAuth();

  // Load saved event data if it exists
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get event data from server or localStorage based on authentication
        const savedEvent = await eventService.getEvent(
          isAuthenticated,
          guestMode
        );

        if (savedEvent) {
          setEvent(savedEvent);
        }

        // Get step data
        const savedStep = localStorage.getItem("eventStep");
        if (savedStep) {
          setStep(parseInt(savedStep));
        }

        // Get active category data
        const savedCategory = localStorage.getItem("activeCategory");
        if (savedCategory) {
          setActiveCategory(savedCategory as ProviderCategory);
        }
      } catch (error) {
        console.error("Error loading event data:", error);
      }
    };

    loadData();
  }, [isAuthenticated, guestMode]);

  // Save event data whenever it changes
  useEffect(() => {
    if (event) {
      eventService.saveEvent(event, isAuthenticated, guestMode);
    }
  }, [event, isAuthenticated, guestMode]);

  // Save step data whenever it changes
  useEffect(() => {
    eventService.saveEventStep(step, isAuthenticated, guestMode);
  }, [step, isAuthenticated, guestMode]);

  // Save active category whenever it changes
  useEffect(() => {
    if (activeCategory) {
      eventService.saveActiveCategory(
        activeCategory,
        isAuthenticated,
        guestMode
      );
    }
  }, [activeCategory, isAuthenticated, guestMode]);

  // Generate budget suggestions based on event type and guest count
  useEffect(() => {
    if (event.budget > 0 && event.guestCount > 0) {
      const suggestions = [];

      // Venue suggestion
      if (
        !event.selectedProviders.some(
          (p) => p.category === ProviderCategory.VENUE
        )
      ) {
        const minVenueCost = Math.min(
          ...providers
            .filter((p) => p.category === ProviderCategory.VENUE)
            .map((p) => p.price)
        );

        if (minVenueCost > event.budget * 0.4) {
          suggestions.push({
            category: ProviderCategory.VENUE,
            suggestion: "Consider allocating 40-50% of your budget for a venue",
            minPrice: minVenueCost,
          });
        }
      }

      // Catering suggestion
      if (
        !event.selectedProviders.some(
          (p) => p.category === ProviderCategory.CATERING
        )
      ) {
        const minCateringPerPerson = Math.min(
          ...providers
            .filter((p) => p.category === ProviderCategory.CATERING)
            .map((p) => p.price)
        );

        const totalCateringCost = minCateringPerPerson * event.guestCount;

        if (totalCateringCost > event.budget * 0.3) {
          suggestions.push({
            category: ProviderCategory.CATERING,
            suggestion: `Plan around $${minCateringPerPerson} per person for catering`,
            minPrice: totalCateringCost,
          });
        }
      }

      // Music suggestion
      if (
        !event.selectedProviders.some(
          (p) => p.category === ProviderCategory.MUSIC
        )
      ) {
        const minMusicCost = Math.min(
          ...providers
            .filter((p) => p.category === ProviderCategory.MUSIC)
            .map((p) => p.price)
        );

        if (minMusicCost > event.budget * 0.15) {
          suggestions.push({
            category: ProviderCategory.MUSIC,
            suggestion: "Music typically costs 10-15% of your total budget",
            minPrice: minMusicCost,
          });
        }
      }

      // Photography suggestion
      if (
        !event.selectedProviders.some(
          (p) => p.category === ProviderCategory.PHOTOGRAPHY
        )
      ) {
        const minPhotoCost = Math.min(
          ...providers
            .filter((p) => p.category === ProviderCategory.PHOTOGRAPHY)
            .map((p) => p.price)
        );

        if (minPhotoCost > event.budget * 0.1) {
          suggestions.push({
            category: ProviderCategory.PHOTOGRAPHY,
            suggestion: "Photography usually takes up 10-12% of your budget",
            minPrice: minPhotoCost,
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
    setEvent((prev) => ({
      ...prev,
      ...eventData,
    }));
    setStep(2);
  };

  // Find alternative services that fit within budget for a specific category
  const getAlternatives = (category: ProviderCategory, maxPrice: number) => {
    return providers
      .filter(
        (p) =>
          p.category === category &&
          p.price <= maxPrice &&
          !event.selectedProviders.some((sp) => sp.id === p.id)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  };

  // Show affordable alternatives if a selected item is too expensive
  const showAffordableAlternatives = (provider: SelectedProvider) => {
    // If the budget is not set or the provider price is within budget, don't show alternatives
    if (event.budget <= 0 || provider.price <= budgetRemaining) {
      setQuickAlternatives(null);
      return;
    }

    // Calculate a target price (70% of the original price)
    const targetPrice = provider.originalPrice
      ? provider.originalPrice * 0.7
      : provider.price * 0.7;

    // Get alternatives that fit the budget
    const alternatives = getAlternatives(provider.category, targetPrice);

    if (alternatives.length > 0) {
      setQuickAlternatives({
        category: provider.category,
        originalPrice: provider.originalPrice || provider.price,
        alternatives,
      });
    } else {
      setQuickAlternatives(null);
    }
  };

  const handleViewProviderDetail = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleCloseProviderDetail = () => {
    setSelectedProvider(null);
  };

  const handleSelectOffer = (provider: Provider, offer: Offer) => {
    // Check if this provider is already selected
    const isAlreadySelected = event.selectedProviders.some(
      (p) => p.id === provider.id
    );

    // Calculate actual price based on whether this is a per-person service
    const isPerPerson = provider.category === ProviderCategory.CATERING;
    const actualPrice = isPerPerson
      ? offer.price * event.guestCount
      : offer.price;

    // Clear any existing alternatives
    setQuickAlternatives(null);

    if (isAlreadySelected) {
      // If the same offer is selected, remove it
      const existingProvider = event.selectedProviders.find(
        (p) => p.id === provider.id
      );
      if (existingProvider?.offerId === offer.id) {
        // Show budget impact for removal
        setBudgetImpact({
          provider: {
            id: provider.id,
            name: provider.name,
            price: provider.price,
            category: provider.category,
            image: provider.image,
          },
          impact: `Removing ${provider.name} - ${
            offer.name
          } will free up $${existingProvider.price.toLocaleString()} from your budget.`,
          isPositive: true,
        });

        setEvent((prev) => ({
          ...prev,
          selectedProviders: prev.selectedProviders.filter(
            (p) => p.id !== provider.id
          ),
        }));
        return;
      }

      // If a different offer is selected, update the selection
      setBudgetImpact({
        provider: {
          id: provider.id,
          name: provider.name,
          price: provider.price,
          category: provider.category,
          image: provider.image,
        },
        impact: `Changed ${provider.name} package to ${offer.name}.`,
        isPositive: true,
      });

      setEvent((prev) => ({
        ...prev,
        selectedProviders: prev.selectedProviders.map((p) => {
          if (p.id === provider.id) {
            return {
              ...p,
              price: actualPrice,
              originalPrice: offer.price,
              offerId: offer.id,
              offerName: offer.name,
            };
          }
          return p;
        }),
      }));
    } else {
      // Add new provider with selected offer
      // Check budget impact before adding
      const newTotal = calculateTotal() + actualPrice;
      const remaining = event.budget - newTotal;
      const percentUsed = (newTotal / event.budget) * 100;

      // Show budget impact for addition
      if (event.budget > 0) {
        setBudgetImpact({
          provider: {
            id: provider.id,
            name: provider.name,
            price: provider.price,
            category: provider.category,
            image: provider.image,
          },
          impact:
            remaining < 0
              ? `Adding ${provider.name} - ${
                  offer.name
                } will put you $${Math.abs(
                  remaining
                ).toLocaleString()} over budget.`
              : `Adding ${provider.name} - ${
                  offer.name
                } will use ${percentUsed.toFixed(1)}% of your budget.`,
          isPositive: remaining >= 0,
        });

        // If over budget, suggest alternatives
        if (remaining < 0) {
          setTimeout(() => {
            showAffordableAlternatives(provider);
          }, 500);
        }
      }

      // Store the provider with offer information
      const providerWithOffer = {
        id: provider.id,
        name: provider.name,
        price: actualPrice,
        originalPrice: offer.price,
        category: provider.category,
        image: provider.image,
        isPerPerson,
        offerId: offer.id,
        offerName: offer.name,
      };

      setEvent((prev) => ({
        ...prev,
        selectedProviders: [...prev.selectedProviders, providerWithOffer],
      }));
    }

    // Clear budget impact after 5 seconds
    setTimeout(() => {
      setBudgetImpact(null);
    }, 5000);
  };

  // Original handleSelectProvider modified to show provider detail if offers are available
  const handleSelectProvider = (provider: SelectedProvider) => {
    const fullProvider = providers.find((p) => p.id === provider.id);

    // If the provider has offers, show the detail view
    if (fullProvider && fullProvider.offers && fullProvider.offers.length > 0) {
      setSelectedProvider(fullProvider);
      return;
    }

    // Otherwise use the original selection logic
    const isAlreadySelected = event.selectedProviders.some(
      (p) => p.id === provider.id
    );

    // Calculate actual price based on whether this is a per-person service
    const isPerPerson = provider.category === ProviderCategory.CATERING;
    const actualPrice = isPerPerson
      ? provider.price * event.guestCount
      : provider.price;

    // Clear any existing alternatives
    setQuickAlternatives(null);

    if (isAlreadySelected) {
      // Show budget impact for removal
      const selectedProvider = event.selectedProviders.find(
        (p) => p.id === provider.id
      );
      const priceToRemove = selectedProvider?.price || 0;

      setBudgetImpact({
        provider,
        impact: `Removing ${
          provider.name
        } will free up $${priceToRemove.toLocaleString()} from your budget.`,
        isPositive: true,
      });

      setEvent((prev) => ({
        ...prev,
        selectedProviders: prev.selectedProviders.filter(
          (p) => p.id !== provider.id
        ),
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
          impact:
            remaining < 0
              ? `Adding ${provider.name} will put you $${Math.abs(
                  remaining
                ).toLocaleString()} over budget.`
              : `Adding ${provider.name} will use ${percentUsed.toFixed(
                  1
                )}% of your budget.`,
          isPositive: remaining >= 0,
        });

        // If over budget, suggest alternatives
        if (remaining < 0) {
          setTimeout(() => {
            showAffordableAlternatives(provider);
          }, 500);
        }
      }

      // Store the provider with additional metadata
      const providerWithActualPrice = {
        ...provider,
        price: actualPrice,
        originalPrice: provider.price,
        isPerPerson,
      };

      setEvent((prev) => ({
        ...prev,
        selectedProviders: [...prev.selectedProviders, providerWithActualPrice],
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
      const updatedProviders = event.selectedProviders.map((provider) => {
        if (provider.isPerPerson && provider.originalPrice) {
          return {
            ...provider,
            price: provider.originalPrice * event.guestCount,
          };
        }
        return provider;
      });

      setEvent((prev) => ({
        ...prev,
        selectedProviders: updatedProviders,
      }));
    }
  }, [event.guestCount]);

  const handleSubmit = () => {
    localStorage.setItem("event", JSON.stringify(event));
    navigate("/preview");
  };

  const calculateTotal = () => {
    return event.selectedProviders.reduce(
      (total, provider) => total + provider.price,
      0
    );
  };

  const isOverBudget = event.budget > 0 && calculateTotal() > event.budget;
  const budgetRemaining = event.budget - calculateTotal();
  const percentUsed =
    event.budget > 0 ? (calculateTotal() / event.budget) * 100 : 0;

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

  // Clear all saved data and reset to default state
  const handleClearData = () => {
    // Clear localStorage
    localStorage.removeItem("event");
    localStorage.removeItem("eventStep");
    localStorage.removeItem("activeCategory");

    // Reset state
    setEvent({
      name: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
      guestCount: 0,
      budget: 0,
      eventType: "Party",
      selectedProviders: [],
    });
    setStep(1);
    setActiveCategory(initialCategory);
    setBudgetSuggestions([]);
    setShowBudgetAlert(false);
    setBudgetImpact(null);
    setQuickAlternatives(null);
    setSelectedProvider(null);

    // Show confirmation
    alert("All data has been cleared. You can start fresh!");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display text-primary-600 mb-4">
          Create Your Event
        </h1>
        <div className="w-24 h-0.5 bg-primary-300 mx-auto mb-6"></div>
        <p className="text-lg font-heading text-gray-700">
          Let's make your celebration unforgettable!
        </p>

        {/* Clear Data Button */}
        <button
          onClick={handleClearData}
          className="mt-4 bg-red-100 hover:bg-red-200 text-red-600 font-medium py-1 px-4 rounded-full text-sm transition-colors"
        >
          Clear & Start Over
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 1
                ? "bg-primary-500 text-white"
                : "bg-primary-100 text-primary-500"
            } font-bold text-lg shadow-sm`}
          >
            1
          </div>
          <div
            className={`w-16 h-0.5 ${
              step === 1 ? "bg-gray-200" : "bg-primary-300"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 2
                ? "bg-primary-500 text-white"
                : "bg-primary-100 text-primary-500"
            } font-bold text-lg shadow-sm`}
          >
            2
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="bg-white rounded-xl shadow-fun p-6 md:p-8 transition-all">
          <h2 className="text-xl font-heading font-bold mb-6 text-center text-gray-800">
            Event Details
          </h2>
          <EventForm initialValues={event} onSubmit={handleEventSubmit} />
        </div>
      ) : (
        <div>
          {/* Budget Summary - Make it sticky */}
          {event.budget > 0 && (
            <div className="sticky top-12 z-20 mb-8">
              <div className="bg-white rounded-xl shadow-fun p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-heading font-bold text-gray-800">
                    Budget Summary
                  </h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Your Budget</p>
                    <p className="text-xl font-heading font-bold text-primary-600">
                      ${event.budget.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Budget progress bar */}
                <div className="mb-2">
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
                        onClick={() => navigate("/preview")}
                        className="text-sm bg-primary-100 hover:bg-primary-200 text-primary-700 py-1 px-3 rounded-md transition-colors"
                      >
                        View optimization suggestions
                      </button>
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
          )}

          {/* Quick Alternatives Section */}
          {quickAlternatives && (
            <div className="bg-primary-50 rounded-xl shadow-fun p-4 mb-8 border-2 border-dashed border-primary-200 animate-pulse">
              <div className="flex items-center mb-3">
                <span className="text-primary-500 text-xl mr-2">💡</span>
                <h3 className="text-lg font-heading font-semibold text-primary-700">
                  Budget-Friendly Alternatives
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                We found some highly-rated options that could help you stay
                within budget.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {quickAlternatives.alternatives.map((alternative) => {
                  const savings =
                    quickAlternatives.originalPrice - alternative.price;
                  const savingsPercent = Math.round(
                    (savings / quickAlternatives.originalPrice) * 100
                  );

                  return (
                    <div
                      key={alternative.id}
                      className="bg-white rounded-lg p-3 border border-primary-100 hover:border-primary-300 transition-colors cursor-pointer"
                      onClick={() =>
                        handleSelectProvider({
                          id: alternative.id,
                          name: alternative.name,
                          price: alternative.price,
                          category: alternative.category,
                          image: alternative.image,
                        })
                      }
                    >
                      <div className="flex items-center mb-2">
                        <img
                          src={alternative.image}
                          alt={alternative.name}
                          className="w-10 h-10 rounded-full object-cover mr-2"
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {alternative.name}
                          </h4>
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1 text-xs">
                              ★
                            </span>
                            <span className="text-xs text-gray-600">
                              {alternative.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-primary-600 font-semibold">
                          ${alternative.price.toLocaleString()}
                        </p>
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                          Save {savingsPercent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setQuickAlternatives(null)}
                className="text-primary-600 hover:text-primary-800 text-sm mt-3 inline-block"
              >
                Dismiss suggestions
              </button>
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
                            onClick={() =>
                              handleSelectProvider({
                                id: provider.id,
                                name: provider.name,
                                price: provider.price,
                                category: provider.category,
                                image: provider.image,
                              })
                            }
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
                              <div className="flex items-center">
                                {isSelected && (
                                  <span className="bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full mr-2">
                                    Selected
                                  </span>
                                )}
                                {isOverBudgetItem && !isSelected && (
                                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full mr-2">
                                    Over budget
                                  </span>
                                )}
                                {hasOffers && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewProviderDetail(provider);
                                    }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs p-1 rounded-full"
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

          {/* Updated Selected Services Summary Section */}
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
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {event.selectedProviders.map((provider) => {
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
                                    onClick={(e) => {
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
              </div>
            )}
          </div>

          {/* Budget Insights Section */}
          {event.budget > 0 && event.selectedProviders.length > 0 && (
            <div className="bg-white rounded-xl shadow-fun p-6 mb-8">
              <h2 className="text-xl font-heading font-bold mb-4 text-gray-800">
                Budget Insights
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Venue allocation */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Venue</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.round(
                      (event.selectedProviders
                        .filter((p) => p.category === ProviderCategory.VENUE)
                        .reduce((sum, p) => sum + p.price, 0) /
                        calculateTotal()) *
                        100
                    )}
                    %
                  </p>
                  <p className="text-xs text-gray-500">Recommended: 40-50%</p>
                </div>

                {/* Catering allocation */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Catering</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.round(
                      (event.selectedProviders
                        .filter((p) => p.category === ProviderCategory.CATERING)
                        .reduce((sum, p) => sum + p.price, 0) /
                        calculateTotal()) *
                        100
                    )}
                    %
                  </p>
                  <p className="text-xs text-gray-500">Recommended: 25-30%</p>
                  <p className="text-xs text-gray-600 mt-1">
                    ~$
                    {Math.round(
                      event.selectedProviders
                        .filter((p) => p.category === ProviderCategory.CATERING)
                        .reduce((sum, p) => sum + p.price, 0) / event.guestCount
                    )}{" "}
                    per guest
                  </p>
                </div>

                {/* Entertainment allocation */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Entertainment</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.round(
                      (event.selectedProviders
                        .filter((p) => p.category === ProviderCategory.MUSIC)
                        .reduce((sum, p) => sum + p.price, 0) /
                        calculateTotal()) *
                        100
                    )}
                    %
                  </p>
                  <p className="text-xs text-gray-500">Recommended: 10-15%</p>
                </div>

                {/* Other services allocation */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Other Services</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.round(
                      (event.selectedProviders
                        .filter(
                          (p) =>
                            p.category !== ProviderCategory.VENUE &&
                            p.category !== ProviderCategory.CATERING &&
                            p.category !== ProviderCategory.MUSIC
                        )
                        .reduce((sum, p) => sum + p.price, 0) /
                        calculateTotal()) *
                        100
                    )}
                    %
                  </p>
                  <p className="text-xs text-gray-500">Recommended: 15-25%</p>
                </div>
              </div>

              {/* Tips and guidance */}
              <div className="p-4 bg-primary-50 rounded-lg">
                <h3 className="font-heading font-semibold text-primary-800 mb-2">
                  Tips for your {event.eventType}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">✨</span>
                    <span>
                      For a {event.guestCount}-person event, experts recommend
                      budgeting $75-100 per guest for catering.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">✨</span>
                    <span>
                      Consider allocating 5-10% of your budget for decorations
                      and favors.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">✨</span>
                    <span>
                      Set aside 10-15% of your total budget as a contingency
                      fund for unexpected expenses.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <ProviderDetail
          provider={selectedProvider}
          onClose={handleCloseProviderDetail}
          onSelectOffer={handleSelectOffer}
          guestCount={event.guestCount}
          isPerPerson={selectedProvider.category === ProviderCategory.CATERING}
          selectedOfferId={
            event.selectedProviders.find((p) => p.id === selectedProvider.id)
              ?.offerId
          }
        />
      )}
    </div>
  );
}
