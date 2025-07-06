import React from 'react';
import { Event } from '../../../types';
import { Provider, ProviderCategory } from '../../../data/mockData';
import { VendorNotesCount } from '../types';
import { useVendorSelection } from '../hooks/useVendorSelection';
import ServicesSelection from '../../../components/ServicesSelection';
import ProviderDetail from '../../../components/ProviderDetail';

interface VendorManagementTabProps {
  event: Event;
  providers: Provider[];
  selectedProviders: any[];
  setSelectedProviders: (providers: any[]) => void;
  onQuickNote: (providerId: string, providerName: string) => void;
  vendorNotesCount: VendorNotesCount;
}

export const VendorManagementTab: React.FC<VendorManagementTabProps> = ({
  event,
  providers,
  selectedProviders,
  setSelectedProviders,
  onQuickNote,
  vendorNotesCount
}) => {
  const {
    activeCategory,
    setActiveCategory,
    selectedProviderDetail,
    setSelectedProviderDetail,
    handleSelectProvider,
    handleViewProviderDetail,
    handleSelectOffer,
    calculateTotal,
    percentUsed,
    budgetRemaining,
    isOverBudget
  } = useVendorSelection(event, selectedProviders, setSelectedProviders);

  return (
    <>
      <ServicesSelection
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
        setStep={() => {}}
        handleSubmit={() => {}}
        budgetImpact={null}
        showBudgetAlert={false}
        budgetSuggestions={[]}
        onQuickNote={onQuickNote}
        vendorNotes={vendorNotesCount}
      />

      {selectedProviderDetail && (
        <ProviderDetail
          provider={selectedProviderDetail}
          onClose={() => setSelectedProviderDetail(null)}
          onSelectOffer={handleSelectOffer}
          guestCount={event.guestCount}
          isPerPerson={selectedProviderDetail.category === ProviderCategory.CATERING}
          selectedOfferId={selectedProviders.find(p => p.id === selectedProviderDetail.id)?.offerName}
        />
      )}
    </>
  );
}; 