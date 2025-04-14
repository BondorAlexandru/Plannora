import { useEffect, useState } from "react";
import Link from "next/link";
import { Event, SelectedProvider } from "../types";
import { providers } from "../data/mockData";
import { useRouter } from "next/router";
import eventService from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';

// Import html2pdf dynamically to avoid SSR issues
const handleExportPDF = async (event: Event | null) => {
  try {
    // Dynamically import html2pdf
    const html2pdf = (await import('html2pdf.js')).default;

    const element = document.getElementById("quote-content");
    const opt = {
      margin: 10,
      filename: `${event?.name || "Event"}_Quote.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as "portrait" | "landscape" },
    };

    if (element) {
      html2pdf().set(opt).from(element).save();
    } else {
      console.error("Quote content element not found");
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("There was an error generating the PDF. Please try again.");
  }
};

function Preview() {
  const [event, setEvent] = useState<Event | null>(null);
  const [showBudgetSuggestions, setShowBudgetSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    originalProvider: SelectedProvider;
    alternatives: typeof providers;
    savings: number;
  }[]>([]);
  const [sampleMode, setSampleMode] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State to handle minimized view on mobile
  const [isSuggestionsMinimized, setIsSuggestionsMinimized] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      setError(null);
      const { eventId } = router.query;
      const eventIdString = typeof eventId === 'string' ? eventId : Array.isArray(eventId) ? eventId[0] : null;

      // First try localStorage in all cases
      const savedEvent = localStorage.getItem('event');
      let localEvent = savedEvent ? JSON.parse(savedEvent) : null;

      // Try to load from API with eventId if provided (regardless of auth state)
      if (eventIdString) {
        try {
          // Try with auth if authenticated, but allow fallback to no auth
          const fetchedEvent = await eventService.getEventById(eventIdString, isAuthenticated);

          if (fetchedEvent) {
            setEvent(fetchedEvent);

            // Store in localStorage for offline/cross-context access
            localStorage.setItem('event', JSON.stringify(fetchedEvent));

            setSampleMode(false);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error(`Error loading event ${eventIdString} from API:`, error);
          // Continue to try localStorage
        }
      }

      // Fallback to localStorage if API call failed or wasn't attempted
      if (localEvent) {
        setEvent(localEvent);
        setSampleMode(false);
      } else {
        // If no event data anywhere, create sample data for demo purposes
        setSampleMode(true);
        setEvent({
          name: 'Sample Event',
          date: new Date().toISOString().split('T')[0],
          location: 'Sample Location',
          guestCount: 50,
          budget: 5000,
          eventType: 'Party',
          selectedProviders: []
        });
      }
      setIsLoading(false);
    };

    loadEvent().catch(err => {
      console.error('Unhandled error in loadEvent:', err);
      setError('Failed to load event data. Please try again or create a new event.');
      setIsLoading(false);
    });

    // Show optimization tips after a delay for better UX
    const timer = setTimeout(() => {
      setShowTips(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [router.query, isAuthenticated]);

  // Generate budget optimization suggestions when event changes or when over budget
  useEffect(() => {
    if (event && isOverBudget) {
      generateBudgetSuggestions();

      // Auto-show budget suggestions when tips are enabled
      if (showTips) {
        setShowBudgetSuggestions(true);
      }
    }
  }, [event, showTips]);

  // Function to find cheaper alternatives for expensive services
  const generateBudgetSuggestions = () => {
    if (!event) return;

    // First sort providers by price (most expensive first)
    const sortedProviders = [...event.selectedProviders].sort((a, b) => b.price - a.price);

    const newSuggestions: {
      originalProvider: SelectedProvider;
      alternatives: typeof providers;
      savings: number;
    }[] = [];

    // Find alternatives for each provider
    sortedProviders.forEach(provider => {
      // Get alternative providers in the same category with lower prices
      const alternatives = providers.filter(p =>
        p.category === provider.category &&
        p.price < (provider.originalPrice || provider.price) &&
        !event.selectedProviders.some(sp => sp.id === p.id)
      ).sort((a, b) => b.rating - a.rating);

      if (alternatives.length > 0) {
        newSuggestions.push({
          originalProvider: provider,
          alternatives: alternatives.slice(0, 3), // Get top 3 alternatives by rating
          savings: provider.price - (alternatives[0].price * (provider.isPerPerson ? event.guestCount : 1))
        });
      }
    });

    // Sort suggestions by potential savings
    setSuggestions(newSuggestions.sort((a, b) => b.savings - a.savings));
  };

  const calculateTotal = () => {
    if (!event) return 0;
    return event.selectedProviders.reduce(
      (total, provider) => total + provider.price,
      0
    );
  };

  const isOverBudget = event && calculateTotal() > (event.budget || 0);
  const overBudgetAmount = event ? calculateTotal() - (event.budget || 0) : 0;

  // Replace a selected provider with a suggested alternative
  const handleReplaceProvider = (originalId: string, newProvider: typeof providers[0]) => {
    if (!event) return;

    // Calculate actual price for the new provider if it's per-person
    const isPerPerson = newProvider.category === "Catering";
    const actualPrice = isPerPerson ? newProvider.price * event.guestCount : newProvider.price;

    const updatedProviders = event.selectedProviders.map(provider => {
      if (provider.id === originalId) {
        return {
          id: newProvider.id,
          name: newProvider.name,
          price: actualPrice,
          originalPrice: newProvider.price,
          isPerPerson,
          category: newProvider.category,
          image: newProvider.image
        };
      }
      return provider;
    });

    const updatedEvent = {
      ...event,
      selectedProviders: updatedProviders
    };

    setEvent(updatedEvent);
    localStorage.setItem("event", JSON.stringify(updatedEvent));

    // Regenerate budget suggestions
    setTimeout(() => {
      generateBudgetSuggestions();
    }, 300);
  };

  // Function to clear all data and return to home
  const handleClearData = () => {
    // Clear localStorage
    localStorage.removeItem('event');
    localStorage.removeItem('eventStep');
    localStorage.removeItem('activeCategory');

    // Show confirmation
    alert('All data has been cleared. Returning to home page.');

    // Navigate to home
    router.push('/');
  };

  // Add this error UI component
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-fun p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-display text-primary-600 mb-4">Error Loading Preview</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a href="/create" className="btn-primary text-center">
              Return to Event Creation
            </a>
            <a href="/create?fresh=true" className="btn-secondary text-center">
              Start a New Event
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display text-primary-600 mb-4">
          Event Summary & Quote
        </h1>
        {sampleMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 mb-6 max-w-lg mx-auto">
            <p className="text-yellow-700">
              <span className="font-medium">Sample Mode:</span> You're viewing a demo preview.
              <a href="/create" className="ml-2 text-primary-600 hover:text-primary-800 underline">Create your own event</a>
            </p>
          </div>
        )}
        <div className="w-24 h-0.5 bg-primary-300 mx-auto mb-6"></div>
        <div className="flex justify-center gap-4">
          <a href="/create" className="text-primary-600 hover:text-primary-800 font-medium">
            Edit Event
          </a>
          {!sampleMode && (
            <button
              onClick={handleClearData}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear & Start Over
            </button>
          )}
        </div>
      </div>

      {event ? (
        <div>
          {/* Sticky Budget Summary */}
          <div className="sticky top-4 z-10 mb-4">
            <div className="bg-white rounded-xl shadow-fun p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-heading text-primary-700">
                  Budget: ${event.budget?.toLocaleString()}
                </h2>
                <div className="text-right">
                  <p className={`font-heading font-bold ${isOverBudget ? "text-red-500" : "text-green-500"}`}>
                    Total: ${calculateTotal().toLocaleString()}
                    {isOverBudget && <span className="text-red-500 text-sm ml-1">(${overBudgetAmount.toLocaleString()} over)</span>}
                  </p>
                </div>
              </div>

              {/* Always visible budget progress bar */}
              <div className="mt-3 mb-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${isOverBudget
                        ? "bg-red-500"
                        : calculateTotal() / event.budget > 0.9
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    style={{ width: `${Math.min(calculateTotal() / event.budget * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {isOverBudget && suggestions.length > 0 && !showBudgetSuggestions && showTips && (
                <button
                  onClick={() => setShowBudgetSuggestions(true)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium mt-2 block w-full text-center"
                >
                  View budget optimization suggestions
                </button>
              )}
            </div>
          </div>

          <div id="quote-content" className="space-y-8">

            {/* Budget Optimization Section */}
            {isOverBudget && suggestions.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-heading text-primary-700">
                    Budget Optimization
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Toggle for showing/hiding suggestions */}
                    <button
                      onClick={() => setShowBudgetSuggestions(!showBudgetSuggestions)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                    >
                      {showBudgetSuggestions ? "Hide Suggestions" : "Show Suggestions"}
                      {showBudgetSuggestions ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* Minimize/expand toggle for mobile */}
                    <button
                      onClick={() => setIsSuggestionsMinimized(!isSuggestionsMinimized)}
                      className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full"
                      aria-label={isSuggestionsMinimized ? "Expand suggestions" : "Minimize suggestions"}
                    >
                      {isSuggestionsMinimized ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className={`bg-festive-yellow-50 rounded-xl shadow-fun p-4 transition-all duration-300 ${showBudgetSuggestions
                    ? 'opacity-100 mb-8'
                    : 'max-h-0 opacity-0 overflow-hidden py-0 mb-0'
                  }`}>
                  {/* When minimized on mobile, show only a summary */}
                  {isSuggestionsMinimized ? (
                    <div className="p-2 text-center">
                      <p className="text-primary-600 font-medium">
                        {suggestions.length} optimization suggestions available
                      </p>
                      <p className="text-sm text-gray-600">
                        Possible savings up to ${suggestions.reduce((sum, s) => sum + s.savings, 0).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-festive-yellow-500 text-xl mr-2">💰</span>
                        <h3 className="font-heading text-lg text-gray-800">You're ${overBudgetAmount.toLocaleString()} over budget</h3>
                      </div>
                      <p className="text-gray-600 mb-3">
                        Here are some options to help you stay within your budget:
                      </p>

                      <div className="space-y-4">
                        {suggestions.map((suggestion, index) => (
                          <div key={index} className="border border-gray-100 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-heading text-primary-600 mb-1">
                                  {suggestion.originalProvider.name} (${suggestion.originalProvider.price.toLocaleString()})
                                </h4>
                                <p className="text-sm text-gray-600 mb-1">
                                  Consider these alternatives to save up to ${suggestion.savings.toLocaleString()}:
                                </p>
                              </div>
                              <span className="bg-festive-yellow-100 text-festive-yellow-800 text-xs px-2 py-1 rounded-full">
                                Save ${suggestion.savings.toLocaleString()}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                              {suggestion.alternatives.map((alt, altIndex) => (
                                <div key={altIndex} className="bg-gray-50 rounded-md p-2 flex flex-col h-full">
                                  <div className="flex-grow">
                                    <h5 className="font-medium text-gray-800 mb-1">{alt.name}</h5>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">${alt.price.toLocaleString()}</span>
                                      <span className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {alt.rating}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleReplaceProvider(suggestion.originalProvider.id, alt)}
                                    className="mt-2 w-full bg-primary-100 hover:bg-primary-200 text-primary-700 text-sm py-1 px-3 rounded transition-colors"
                                  >
                                    Replace
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-heading text-primary-700 mb-4">
                Selected Services
              </h2>

              {event.selectedProviders.length > 0 ? (
                <div className="bg-white rounded-xl shadow-fun p-4">
                  {event.selectedProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center">
                        <img
                          src={provider.image}
                          alt={provider.name}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {provider.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {provider.category}
                            {provider.isPerPerson && provider.originalPrice && (
                              <span className="ml-1 text-xs">
                                (${provider.originalPrice.toLocaleString()} per person × {event.guestCount})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-primary-600">
                          ${provider.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-lg">Total Cost:</p>
                      <p
                        className={`font-bold text-lg ${isOverBudget ? "text-red-500" : "text-primary-600"
                          }`}
                      >
                        ${calculateTotal().toLocaleString()}
                      </p>
                    </div>
                    {isOverBudget && (
                      <div className="mt-1">
                        <p className="text-red-500 text-sm">
                          You're ${overBudgetAmount.toLocaleString()} over budget
                        </p>
                        {suggestions.length > 0 && !showBudgetSuggestions && showTips && (
                          <button
                            onClick={() => setShowBudgetSuggestions(true)}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium mt-1"
                          >
                            View budget optimization suggestions
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-fun p-6 text-center">
                  <p className="text-gray-500 mb-4">
                    Welcome to the quote preview! No services selected yet.
                  </p>
                  <Link href="/create" className="btn-primary">
                    Add Services
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-primary-50 rounded-xl p-6 shadow-fun mb-8">
              <h3 className="text-xl font-heading text-primary-700 mb-4">
                Booking Information
              </h3>
              <p className="text-gray-600 mb-6">
                Ready to make your event a reality? Here's what you need to know
                about booking these services.
              </p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Next Steps:</h4>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>
                    Review your selections and confirm they meet your needs
                  </li>
                  <li>Contact providers to check availability for your date</li>
                  <li>Request contracts and review terms</li>
                  <li>Pay deposits to secure your bookings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Loading event details...</p>
        </div>
      )}

      {event && event.selectedProviders.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => handleExportPDF(event)}
            className="flex-1 py-3 px-4 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-heading text-lg shadow-md flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                clipRule="evenodd"
              />
            </svg>
            Export as PDF
          </button>
          <button className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-heading text-lg shadow-md flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Contact Event Coordinator
          </button>
        </div>
      )}
    </div>
  );
}

export default Preview;