import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Event, SelectedProvider } from "../types";
import { providers } from "../data/mockData";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";

const Preview = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [showBudgetSuggestions, setShowBudgetSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    originalProvider: SelectedProvider;
    alternatives: typeof providers;
    savings: number;
  }[]>([]);
  const [sampleMode, setSampleMode] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEvent = localStorage.getItem('event');
    
    if (savedEvent) {
      setEvent(JSON.parse(savedEvent));
    } else {
      // If no event data, create sample data for demo purposes
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
    
    // Show optimization tips after a delay for better UX
    const timer = setTimeout(() => {
      setShowTips(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Generate budget optimization suggestions when event changes or when over budget
  useEffect(() => {
    if (event && isOverBudget) {
      generateBudgetSuggestions();
    }
  }, [event]);

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

  const handleExportPDF = () => {
    const element = document.getElementById("quote-content");
    const opt: {
      margin: number;
      filename: string;
      image: { type: string; quality: number };
      html2canvas: { scale: number };
      jsPDF: { unit: string; format: string; orientation: "portrait" | "landscape" };
    } = {
      margin: 10,
      filename: `${event?.name || "Event"}_Quote.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    if (element) {
      html2pdf().set(opt).from(element).save();
    }
  };
  
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
    navigate('/');
  };

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
              {isOverBudget && suggestions.length > 0 && !showBudgetSuggestions && (
                <button
                  onClick={() => setShowBudgetSuggestions(true)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium mt-2 block w-full text-center"
                >
                  View budget optimization suggestions
                </button>
              )}
            </div>
          </div>
          
          <div id="quote-content">
            <div className="bg-white rounded-xl shadow-fun p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-heading text-primary-700">
                  {event.name || "Your Event"}
                </h2>
                <Link
                  to="/create"
                  className="btn-secondary text-sm py-1.5 px-3"
                >
                  Edit Event
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Location:</span>{" "}
                    {event.location}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Event Type:</span>{" "}
                    {event.eventType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Guest Count:</span>{" "}
                    {event.guestCount}
                  </p>
                  <p className="text-gray-600 mr-2">
                    <span className="font-medium">Budget:</span>{" "}
                    <span
                      className={isOverBudget ? "text-red-500 font-bold" : ""}
                    >
                      ${event.budget?.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Budget Optimization Suggestions */}
            {isOverBudget && suggestions.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-heading text-primary-700">
                    Budget Optimization
                  </h2>
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
                </div>
                
                <div className={`bg-festive-yellow-50 rounded-xl shadow-fun p-4 transition-all duration-300 ${
                  showBudgetSuggestions 
                    ? 'opacity-100 mb-8' 
                    : 'max-h-0 opacity-0 overflow-hidden py-0 mb-0'
                }`}>
                  <div className={`bg-white rounded-lg p-4 ${showBudgetSuggestions ? 'mb-4' : 'mb-0'}`}>
                    <div className="flex items-center mb-2">
                      <span className="text-festive-yellow-500 text-xl mr-2">💰</span>
                      <h3 className="font-heading text-lg text-gray-800">You're ${overBudgetAmount.toLocaleString()} over budget</h3>
                    </div>
                    <p className="text-gray-600 mb-3">
                      Here are some options to help you stay within your budget:
                    </p>
                    
                    <div className="space-y-4">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="border border-gray-100 rounded-lg overflow-hidden">
                          <div className="p-3 bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center">
                              <img 
                                src={suggestion.originalProvider.image} 
                                alt={suggestion.originalProvider.name}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                              <div>
                                <p className="font-medium">{suggestion.originalProvider.name}</p>
                                <p className="text-sm text-gray-500">
                                  ${suggestion.originalProvider.price.toLocaleString()}
                                  {suggestion.originalProvider.isPerPerson && 
                                    <span className="text-xs"> (${suggestion.originalProvider.originalPrice?.toLocaleString()} × {event.guestCount} guests)</span>
                                  }
                                </p>
                              </div>
                            </div>
                            <span className="text-gray-400">→</span>
                          </div>
                          
                          <div className="p-3">
                            <p className="text-sm text-gray-600 mb-2">Potential savings: <span className="text-green-600 font-bold">${suggestion.savings.toLocaleString()}</span></p>
                            
                            <div className="space-y-2">
                              {suggestion.alternatives.map((alt) => {
                                const altPrice = alt.price * (suggestion.originalProvider.isPerPerson ? event.guestCount : 1);
                                return (
                                  <div key={alt.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex items-center">
                                      <img 
                                        src={alt.image}
                                        alt={alt.name}
                                        className="w-8 h-8 rounded-full object-cover mr-2"
                                      />
                                      <div>
                                        <p className="font-medium text-sm">{alt.name}</p>
                                        <div className="flex items-center">
                                          <span className="text-yellow-400 mr-1 text-xs">★</span>
                                          <span className="text-xs text-gray-500">{alt.rating}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center">
                                      <p className="text-primary-600 font-medium text-sm mr-3">
                                        ${altPrice.toLocaleString()}
                                        {suggestion.originalProvider.isPerPerson && 
                                          <span className="text-xs text-gray-500 block"> 
                                            (${alt.price} × {event.guestCount})
                                          </span>
                                        }
                                      </p>
                                      <button 
                                        onClick={() => handleReplaceProvider(suggestion.originalProvider.id, alt)}
                                        className="text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 py-1 px-2 rounded transition-colors"
                                      >
                                        Switch
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Add extra space when the suggestions are shown */}
                {showBudgetSuggestions && <div className="h-8"></div>}
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
                        className={`font-bold text-lg ${
                          isOverBudget ? "text-red-500" : "text-primary-600"
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
                        {suggestions.length > 0 && !showBudgetSuggestions && (
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
                  <Link to="/create" className="btn-primary">
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
            onClick={handleExportPDF}
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
};

export default Preview;
