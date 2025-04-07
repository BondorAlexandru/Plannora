import React, { useState } from 'react';
import { Provider, Offer } from '../data/mockData';

interface ProviderDetailProps {
  provider: Provider;
  onClose: () => void;
  onSelectOffer: (provider: Provider, offer: Offer) => void;
  guestCount: number;
  isPerPerson: boolean;
  selectedOfferId?: string;
}

const ProviderDetail: React.FC<ProviderDetailProps> = ({ 
  provider, 
  onClose, 
  onSelectOffer,
  guestCount,
  isPerPerson,
  selectedOfferId
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'about' | 'offers' | 'gallery'>('about');
  
  const displayImages = provider.gallery?.length 
    ? [provider.image, ...provider.gallery] 
    : [provider.image];
  
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
  };
  
  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };
  
  const calculatePrice = (price: number) => {
    if (isPerPerson) {
      return {
        unitPrice: price,
        totalPrice: price * guestCount
      };
    }
    return {
      unitPrice: price,
      totalPrice: price
    };
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center pt-16 px-4 pb-8">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="relative">
          {/* Image carousel */}
          <div className="h-64 md:h-80 w-full relative overflow-hidden">
            <img 
              src={displayImages[activeImageIndex]} 
              alt={provider.name} 
              className="w-full h-full object-cover transition-opacity"
            />
            
            {/* Navigation arrows */}
            {displayImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
                {activeImageIndex + 1} / {displayImages.length}
              </div>
            )}
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Provider name and rating */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-800">{provider.name}</h2>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="text-gray-600">{provider.rating} | {provider.category}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Base Price</p>
                <p className="text-xl font-heading font-bold text-primary-600">
                  ${provider.price.toLocaleString()}
                  {isPerPerson && <span className="text-sm text-gray-500 ml-1">per person</span>}
                </p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mt-6">
              <button
                className={`px-4 py-2 font-medium ${selectedTab === 'about' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSelectedTab('about')}
              >
                About
              </button>
              {provider.offers && provider.offers.length > 0 && (
                <button
                  className={`px-4 py-2 font-medium ${selectedTab === 'offers' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setSelectedTab('offers')}
                >
                  Packages & Offers
                </button>
              )}
              {provider.gallery && provider.gallery.length > 0 && (
                <button
                  className={`px-4 py-2 font-medium ${selectedTab === 'gallery' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setSelectedTab('gallery')}
                >
                  Gallery
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Tab content - Only this part should scroll */}
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          <div className="py-4 px-6">
            {/* About Tab */}
            {selectedTab === 'about' && (
              <div>
                <p className="text-gray-700 leading-relaxed">
                  {provider.longDescription || provider.description}
                </p>
                
                {provider.contactInfo && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">Contact Information</h3>
                    <ul className="space-y-2 text-sm">
                      {provider.contactInfo.phone && (
                        <li className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {provider.contactInfo.phone}
                        </li>
                      )}
                      {provider.contactInfo.email && (
                        <li className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {provider.contactInfo.email}
                        </li>
                      )}
                      {provider.contactInfo.website && (
                        <li className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          {provider.contactInfo.website}
                        </li>
                      )}
                      {provider.contactInfo.address && (
                        <li className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {provider.contactInfo.address}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Offers Tab */}
            {selectedTab === 'offers' && provider.offers && (
              <div className="space-y-4">
                {provider.offers.map(offer => {
                  const priceDetails = calculatePrice(offer.price);
                  const isSelected = offer.id === selectedOfferId;
                  
                  return (
                    <div 
                      key={offer.id} 
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center">
                            <h3 className="font-heading font-semibold text-lg">{offer.name}</h3>
                            {offer.popular && (
                              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{offer.description}</p>
                          
                          <ul className="mt-3 space-y-1">
                            {offer.features.map((feature, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="text-right mb-4">
                            <p className="text-lg font-bold text-primary-600">
                              ${priceDetails.unitPrice.toLocaleString()}
                              {isPerPerson && <span className="text-sm text-gray-500 ml-1">per person</span>}
                            </p>
                            {isPerPerson && (
                              <p className="text-sm text-gray-600">
                                Total: ${priceDetails.totalPrice.toLocaleString()}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => onSelectOffer(provider, offer)}
                            className={`px-4 py-2 rounded-lg font-medium ${
                              isSelected
                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Gallery Tab */}
            {selectedTab === 'gallery' && provider.gallery && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[provider.image, ...provider.gallery].map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${provider.name} gallery ${index + 1}`} 
                      className={`w-full h-full object-cover transition-all hover:scale-105 ${activeImageIndex === index ? 'ring-2 ring-primary-500' : ''}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetail; 