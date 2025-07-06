import React from 'react';

interface Planner {
  id: string;
  name: string;
  email: string;
  businessName: string;
  services: string[];
  experience: string;
  description: string;
  pricing: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
}

interface PlannerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  planner: Planner;
  onSendRequest: (plannerId: string) => Promise<void>;
  isRequestPending?: boolean;
}

const PlannerCard: React.FC<PlannerCardProps> = ({ planner, onSendRequest, isRequestPending = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{planner.businessName}</h3>
          <p className="text-gray-600">{planner.name}</p>
        </div>
        <div className="flex items-center">
          <span className="text-yellow-400 mr-1">★</span>
          <span className="text-gray-700">{planner.rating?.toFixed(1) || 'N/A'}</span>
          <span className="text-gray-500 ml-1">({planner.reviewCount || 0})</span>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 mb-2">{planner.description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {planner.services.map((service: string, index: number) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {service}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Experience: {planner.experience} years</span>
          {planner.pricing && (
            <span className="font-medium">{planner.pricing}</span>
          )}
        </div>
      </div>
      
      <button
        onClick={() => onSendRequest(planner.id)}
        disabled={isRequestPending}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          isRequestPending
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isRequestPending ? 'Request Sent' : 'Request Collaboration'}
      </button>
      
      {!isRequestPending && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Start a new collaboration project together
        </p>
      )}
    </div>
  );
};

export default PlannerCard; 