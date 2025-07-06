import { useState } from 'react';
import { useAuth } from '../../../contexts/NextAuthContext';
import { Event, SelectedProvider } from '../../../types';
import { Provider, ProviderCategory, Offer } from '../../../data/mockData';

export const useVendorSelection = (
  event: Event | null,
  selectedProviders: SelectedProvider[],
  setSelectedProviders: (providers: SelectedProvider[]) => void
) => {
  const [activeCategory, setActiveCategory] = useState<ProviderCategory | null>(null);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<Provider | null>(null);

  const { getToken } = useAuth();

  // Handle provider selection
  const handleSelectProvider = async (provider: SelectedProvider) => {
    if (!event) return;
    
    const newSelectedProviders = selectedProviders.find(p => p.id === provider.id)
      ? selectedProviders.filter(p => p.id !== provider.id)
      : [...selectedProviders, provider];
    
    setSelectedProviders(newSelectedProviders);
    
    // Save to backend
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      await fetch(`${baseUrl}/api/events/${event._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...event,
          selectedProviders: newSelectedProviders
        })
      });
    } catch (err) {
      // Silently handle error - provider selection will be retried on next action
    }
  };

  const handleViewProviderDetail = (provider: Provider) => {
    setSelectedProviderDetail(provider);
  };

  const handleSelectOffer = (provider: Provider, offer: Offer) => {
    if (!event) return;
    
    const isPerPerson = provider.category === ProviderCategory.CATERING;
    const price = isPerPerson ? offer.price * event.guestCount : offer.price;
    
    const selectedProvider: SelectedProvider = {
      id: provider.id,
      name: provider.name,
      price: price,
      category: provider.category,
      image: provider.image,
      offerName: offer.name,
      originalPrice: isPerPerson ? offer.price : undefined,
      isPerPerson
    };

    handleSelectProvider(selectedProvider);
    setSelectedProviderDetail(null); // Close modal after selection
  };

  const calculateTotal = () => {
    return selectedProviders.reduce((total, provider) => total + provider.price, 0);
  };

  // Check if vendor is selected
  const isVendorSelected = (providerId: string) => {
    return selectedProviders.some(p => p.id === providerId);
  };

  // Budget calculations
  const budget = event?.budget || 10000;
  const currentTotal = calculateTotal();
  const percentUsed = budget > 0 ? (currentTotal / budget) * 100 : 0;
  const budgetRemaining = budget - currentTotal;
  const isOverBudget = budget > 0 && currentTotal > budget;

  return {
    activeCategory,
    setActiveCategory,
    selectedProviderDetail,
    setSelectedProviderDetail,
    handleSelectProvider,
    handleViewProviderDetail,
    handleSelectOffer,
    calculateTotal,
    isVendorSelected,
    budget,
    currentTotal,
    percentUsed,
    budgetRemaining,
    isOverBudget
  };
}; 