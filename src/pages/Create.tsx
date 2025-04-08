import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EventForm from "../components/EventForm";
import { Event, SelectedProvider } from "../types";
import { providers, ProviderCategory, Provider, Offer } from "../data/mockData";
import ProviderDetail from "../components/ProviderDetail";
import { useAuth } from "../contexts/NextAuthContext";
import eventService from "../services/eventService";
import EventStepSelector from "../components/EventStepSelector";
import EventsList from "../components/EventsList";
import ServicesSelection from "../components/ServicesSelection";
import EventComparison from "../components/EventComparison";
import React from "react";

// Component wrapper function that handles React version compatibility
function compatibleComponent<P>(Component: any): React.FC<P> {
  return Component as unknown as React.FC<P>;
}

// Create type-safe versions of our components
const SafeEventStepSelector = compatibleComponent<{
  currentStep: number;
  onChange: (newStep: number) => void;
}>(EventStepSelector);

const SafeEventsList = compatibleComponent<{
  events: Event[];
  isLoading: boolean;
  onSelectEvent: (selectedEvent: Event) => void;
  onDeleteEvent: (eventId: string, eventName: string) => Promise<void>;
  onAddToComparison: (eventToAdd: Event) => void;
  selectedForComparison: { event1: Event | null; event2: Event | null };
}>(EventsList);

const SafeServicesSelection = compatibleComponent<{
  event: Event;
  providers: Provider[];
  activeCategory: ProviderCategory | null;
  setActiveCategory: (value: ProviderCategory | null) => void;
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
}>(ServicesSelection);

const SafeProviderDetail = compatibleComponent<{
  provider: Provider;
  onClose: () => void;
  onSelectOffer: (provider: Provider, offer: Offer) => void;
  guestCount: number;
  isPerPerson: boolean;
  selectedOfferId?: string;
}>(ProviderDetail);

const SafeEventComparison = compatibleComponent<{
  event1: Event | null;
  event2: Event | null;
  onClose: () => void;
  onSelectEvent: (selectedEvent: Event) => void;
}>(EventComparison);

export default function Create() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get(
    "category"
  ) as ProviderCategory | null;
  const eventId = searchParams.get("eventId");

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(!!eventId);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
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

  const [selectedEventsForComparison, setSelectedEventsForComparison] =
    useState<{ event1: Event | null; event2: Event | null }>({
      event1: null,
      event2: null,
    });
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const navigate = useNavigate();

  const { isAuthenticated, guestMode } = useAuth();

  // Load event by ID if provided
  useEffect(() => {
    const loadEventById = async () => {
      if (eventId && isAuthenticated) {
        setIsLoadingEvent(true);
        setIsEditMode(true);
        try {
          const fetchedEvent = await eventService.getEventById(
            eventId,
            isAuthenticated
          );
          if (fetchedEvent) {
            // Ensure the ID is properly set in the event object and selectedProviders exists
            setEvent({
              ...fetchedEvent,
              // Ensure we have both id and _id for consistency
              id: eventId,
              _id: fetchedEvent._id || eventId,
              selectedProviders: fetchedEvent.selectedProviders || [], // Ensure selectedProviders is an array
            });

            // Also set the step if available
            if (fetchedEvent.step) {
              setStep(fetchedEvent.step);
            }

            // Set active category if available
            if (fetchedEvent.activeCategory) {
              setActiveCategory(
                fetchedEvent.activeCategory as ProviderCategory
              );
            }
          }
        } catch (error) {
          console.error("Error loading event by ID:", error);
        } finally {
          setIsLoadingEvent(false);
        }
      }
    };

    loadEventById();
  }, [eventId, isAuthenticated]);

  // Load saved event data if not in edit mode and no eventId
  useEffect(() => {
    if (!eventId) {
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
    }
  }, [isAuthenticated, guestMode, eventId]);

  // Helper to determine if we have a valid event ID from the server
  const hasValidEventId = (): boolean => {
    return !!(isEditMode && eventId);
  };

  // Helper function to save the current event state
  const saveCurrentEvent = (forcePost = false) => {
    if (!event || isLoadingEvent) return;

    // Check if this event already has an ID (either from URL or previously created)
    const eventHasId = !!(eventId || event._id);

    const eventToSave = {
      ...event,
      // Keep existing IDs if we have them
      _id: eventHasId ? event._id || eventId : undefined,
      id: eventHasId ? event._id || eventId : undefined,
    };

    // If the event has an ID or if we're not forcing a POST, use PUT
    if (eventHasId && !forcePost) {
      // Use PUT for existing events
      const id = String(event._id || eventId);
      console.log(`Updating existing event with ID ${id} using PUT`);
      eventService
        .updateEventById(id, eventToSave as Event, isAuthenticated)
        .then((updatedEvent) => {
          if (updatedEvent) {
            console.log(`Successfully updated event: ${id}`);
          }
        })
        .catch((error) => {
          console.error(`Error updating event with ID ${id}:`, error);
        });
    } else {
      // Use POST only for brand new events or when forcing POST
      console.log("Creating new event using POST");
      eventService
        .createNewEvent(eventToSave as Event, isAuthenticated)
        .then((newEvent) => {
          if (newEvent && newEvent._id) {
            console.log(
              `Successfully created new event with ID: ${newEvent._id}`
            );

            // Update state with the new ID
            setEvent((prevEvent) => ({
              ...prevEvent,
              _id: newEvent._id,
              id: newEvent._id,
            }));

            // Set edit mode and update URL
            setIsEditMode(true);
            navigate(`/create?eventId=${newEvent._id}`, { replace: true });
          }
        })
        .catch((error) => {
          console.error("Error creating new event:", error);
        });
    }
  };

  // Replace the existing useEffect for saving event data
  useEffect(() => {
    // Only save if event data has been loaded and we're not in an initial loading state
    if (event && !isLoadingEvent) {
      // Don't auto-save for brand new events without IDs - wait for step change to force POST
      if (!eventId && !event._id) {
        console.log(
          "Skipping auto-save for new event - waiting for step change"
        );
        return;
      }

      // Debounce save to prevent too many requests
      const timeoutId = setTimeout(() => {
        // Only use PUT for updates
        saveCurrentEvent(false); // Explicitly pass false to ensure only PUT is used
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [event, isLoadingEvent, eventId]);

  // Save step data whenever it changes
  useEffect(() => {
    if (isEditMode && eventId) {
      eventService.saveEventStep(step, isAuthenticated, guestMode, eventId);
    } else if (event._id) {
      eventService.saveEventStep(step, isAuthenticated, guestMode, event._id);
    } else {
      eventService.saveEventStep(step, isAuthenticated, guestMode);
    }
  }, [step, isAuthenticated, guestMode, isEditMode, eventId, event._id]);

  // Save active category whenever it changes
  useEffect(() => {
    if (activeCategory) {
      if (isEditMode && eventId) {
        eventService.saveActiveCategory(
          activeCategory,
          isAuthenticated,
          guestMode,
          eventId
        );
      } else if (event._id) {
        eventService.saveActiveCategory(
          activeCategory,
          isAuthenticated,
          guestMode,
          event._id
        );
      } else {
        eventService.saveActiveCategory(
          activeCategory,
          isAuthenticated,
          guestMode
        );
      }
    }
  }, [
    activeCategory,
    isAuthenticated,
    guestMode,
    isEditMode,
    eventId,
    event._id,
  ]);

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

  // Load user's events at step 1
  useEffect(() => {
    const loadUserEvents = async () => {
      if (step === 1 && isAuthenticated) {
        setIsLoadingEvents(true);
        try {
          const events = await eventService.getEventsForStep1(isAuthenticated);
          setUserEvents(events);
        } catch (error) {
          console.error("Error loading user events:", error);
        } finally {
          setIsLoadingEvents(false);
        }
      }
    };

    loadUserEvents();
  }, [step, isAuthenticated]);

  // Modify the step change handler to create the event with POST when moving from step 1 to 2
  const handleStepChange = (newStep: number) => {
    // If going from step 1 to 2 for a new event
    if (newStep === 2 && step === 1 && !hasValidEventId() && !event._id) {
      // Force a POST to create the event when stepping from step 1 to 2
      saveCurrentEvent(true); // Pass true to force POST

      // Short delay to allow the save to complete before changing steps
      setTimeout(() => {
        setStep(newStep);
      }, 300);
    } else {
      // For existing events or other step changes, just change the step
      setStep(newStep);
    }
  };

  // Update handleEventSubmit to handle both event continuation and new event creation
  const handleEventSubmit = (eventData: Partial<Event>) => {
    // Update the current event state with form data
    const updatedEvent = {
      ...event,
      ...eventData,
    };

    setEvent(updatedEvent);

    // Check if we're continuing with an existing event or creating a new one
    if (isEditMode || event._id) {
      // For existing events, just move to step 2
      setStep(2);
    } else {
      // For new events, directly call createNewEvent to ensure a POST request
      console.log("Creating brand new event with POST");
      eventService
        .createNewEvent(updatedEvent as Event, isAuthenticated)
        .then((newEvent) => {
          if (newEvent && newEvent._id) {
            console.log(
              `Successfully created new event with ID: ${newEvent._id}`
            );

            // Update state with the new ID
            setEvent({
              ...updatedEvent,
              _id: newEvent._id,
              id: newEvent._id,
            });

            // Set edit mode and update URL
            setIsEditMode(true);
            navigate(`/create?eventId=${newEvent._id}`, { replace: true });

            // Move to step 2 after a short delay
            setTimeout(() => {
              setStep(2);
            }, 300);
          }
        })
        .catch((error) => {
          console.error("Error creating new event:", error);
          // Still move to step 2 even if there's an error (will use localStorage as fallback)
          setTimeout(() => {
            setStep(2);
          }, 300);
        });
    }
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
    // Add a safety check to prevent the error when selectedProviders is undefined
    return (event.selectedProviders || []).reduce(
      (total, provider) => total + provider.price,
      0
    );
  };

  const isOverBudget = event.budget > 0 && calculateTotal() > event.budget;
  const budgetRemaining = event.budget - calculateTotal();
  const percentUsed =
    event.budget > 0 ? (calculateTotal() / event.budget) * 100 : 0;

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

  // Handle selecting an existing event for editing
  const handleSelectEvent = (selectedEvent: Event) => {
    if (selectedEvent._id) {
      // Navigate to edit the selected event
      navigate(`/create?eventId=${selectedEvent._id}`);
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (confirm(`Are you sure you want to delete "${eventName}"?`)) {
      try {
        const success = await eventService.deleteEventById(
          eventId,
          isAuthenticated
        );
        if (success) {
          // Refresh the list of events
          const events = await eventService.getEventsForStep1(isAuthenticated);
          setUserEvents(events);
        } else {
          alert("Failed to delete the event. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("An error occurred while deleting the event.");
      }
    }
  };

  // Add a function to handle creating a new event
  const handleCreateNewEvent = () => {
    // Clear form data and reset to default values
    setEvent({
      name: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
      guestCount: 0,
      budget: 0,
      eventType: "Party",
      selectedProviders: [],
      // Explicitly remove any ID fields
      _id: undefined,
      id: undefined,
    });

    // Reset edit mode and eventId parameters
    setIsEditMode(false);
    // Update URL to remove any eventId
    navigate("/create", { replace: true });

    // Reset to step 1
    setStep(1);
  };

  // Handle adding an event to comparison
  const handleAddToComparison = (eventToAdd: Event) => {
    setSelectedEventsForComparison((prev) => {
      // If event1 is empty, add to event1
      if (!prev.event1) {
        return { ...prev, event1: eventToAdd };
      }
      // If event2 is empty, add to event2
      else if (!prev.event2) {
        return { ...prev, event2: eventToAdd };
      }
      // If both slots are filled, replace event2 and shift event2 to event1
      else {
        return { event1: prev.event2, event2: eventToAdd };
      }
    });
  };

  // Open comparison modal if we have at least one event selected
  const handleOpenComparison = () => {
    if (
      selectedEventsForComparison.event1 ||
      selectedEventsForComparison.event2
    ) {
      setShowComparisonModal(true);
    }
  };

  // Clear comparison selections
  const handleClearComparison = () => {
    setSelectedEventsForComparison({ event1: null, event2: null });
  };

  // Select event from comparison and load it for editing
  const handleSelectEventFromComparison = (selectedEvent: Event) => {
    if (selectedEvent._id) {
      // Navigate to edit the selected event
      navigate(`/create?eventId=${selectedEvent._id}`);
      setShowComparisonModal(false);
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display text-primary-600 mb-4">
          {isEditMode ? "Edit Your Event" : "Create Your Event"}
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

      {/* Step Selector Component */}
      <SafeEventStepSelector
        currentStep={step}
        onChange={handleStepChange}
      />

      {step === 1 ? (
        <div className="bg-white rounded-xl shadow-fun p-6 md:p-8 transition-all">
          {/* Add Continue/New Event options if we're editing an existing event */}
          {(isEditMode || event._id) && (
            <div className="mb-6 bg-primary-50 p-4 rounded-lg">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h3 className="text-lg font-heading font-semibold text-primary-700">
                    Currently editing: {event.name || "Unnamed Event"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Continue with this event or create a new one
                  </p>
                </div>
                <div className="flex gap-3 mt-3 md:mt-0">
                  <button
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    onClick={() => handleStepChange(2)}
                  >
                    Continue
                  </button>
                  <button
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    onClick={handleCreateNewEvent}
                  >
                    Create New Event
                  </button>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-xl font-heading font-bold mb-6 text-center text-gray-800">
            Event Details
          </h2>

          <EventForm
            initialValues={event}
            onSubmit={handleEventSubmit}
            isExistingEvent={isEditMode || !!event._id}
          />

          {isAuthenticated && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-heading font-semibold text-gray-700">
                  Your Previous Events
                </h3>

                <div className="flex space-x-2">
                  {(selectedEventsForComparison.event1 ||
                    selectedEventsForComparison.event2) && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleOpenComparison}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg text-sm transition-colors shadow-sm"
                      >
                        Compare Events (
                        {selectedEventsForComparison.event1 ? "1" : "0"}/
                        {selectedEventsForComparison.event2 ? "1" : "0"})
                      </button>
                      <button
                        onClick={handleClearComparison}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors shadow-sm"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <SafeEventsList
                events={userEvents}
                isLoading={isLoadingEvents}
                onSelectEvent={handleSelectEvent}
                onDeleteEvent={handleDeleteEvent}
                onAddToComparison={handleAddToComparison}
                selectedForComparison={selectedEventsForComparison}
              />
            </div>
          )}
        </div>
      ) : (
        <SafeServicesSelection
          event={event}
          providers={providers}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          handleSelectProvider={handleSelectProvider}
          handleViewProviderDetail={handleViewProviderDetail}
          calculateTotal={calculateTotal}
          percentUsed={percentUsed}
          budgetRemaining={budgetRemaining}
          isOverBudget={isOverBudget}
          setStep={setStep}
          handleSubmit={handleSubmit}
          budgetImpact={budgetImpact}
          showBudgetAlert={showBudgetAlert}
          budgetSuggestions={budgetSuggestions}
        />
      )}

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <SafeProviderDetail
          provider={selectedProvider}
          onClose={handleCloseProviderDetail}
          onSelectOffer={handleSelectOffer}
          guestCount={event.guestCount}
          isPerPerson={selectedProvider.category === ProviderCategory.CATERING}
          selectedOfferId={event.selectedProviders.find(p => p.id === selectedProvider.id)?.offerId}
        />
      )}

      {/* Event Comparison Modal */}
      {showComparisonModal && (
        <SafeEventComparison
          event1={selectedEventsForComparison.event1}
          event2={selectedEventsForComparison.event2}
          onClose={() => setShowComparisonModal(false)}
          onSelectEvent={handleSelectEventFromComparison}
        />
      )}
    </div>
  );
}
