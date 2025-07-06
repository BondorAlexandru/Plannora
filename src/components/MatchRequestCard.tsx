import React from 'react';

interface MatchRequest {
  _id: string;
  senderId: string;
  receiverId: string;
  eventId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  senderName?: string;
  receiverName?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
}

interface MatchRequestCardProps extends React.HTMLAttributes<HTMLDivElement> {
  matchRequest: MatchRequest;
  isReceived: boolean;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  isLoading?: boolean;
}

const MatchRequestCard: React.FC<MatchRequestCardProps> = ({ 
  matchRequest, 
  isReceived, 
  onAccept, 
  onDecline, 
  isLoading = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {isReceived ? `Request from ${matchRequest.senderName}` : `Request to ${matchRequest.receiverName}`}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Event:</strong> {matchRequest.eventName}</p>
            <p><strong>Date:</strong> {matchRequest.eventDate}</p>
            <p><strong>Location:</strong> {matchRequest.eventLocation}</p>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(matchRequest.status)}`}>
            {matchRequest.status.charAt(0).toUpperCase() + matchRequest.status.slice(1)}
          </span>
        </div>
      </div>
      
      {matchRequest.message && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Message:</strong> {matchRequest.message}
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Sent: {formatDate(matchRequest.createdAt)}
        </p>
        
        {isReceived && matchRequest.status === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onDecline?.(matchRequest._id)}
              disabled={isLoading}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Decline'}
            </button>
            <button
              onClick={() => onAccept?.(matchRequest._id)}
              disabled={isLoading}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Accept'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchRequestCard; 