import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "../src/components/NextLayout";
import { useAuth } from "../src/contexts/NextAuthContext";
import MatchRequestCard from "../src/components/MatchRequestCard";

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

const MatchRequestsPage: React.FC = () => {
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const { user, getToken } = useAuth();
  const router = useRouter();

  // Redirect non-authenticated users
  useEffect(() => {
    if (user && !user) {
      router.push("/login");
      return;
    }
  }, [user, router]);

  // Fetch match requests
  useEffect(() => {
    const fetchMatchRequests = async () => {
      try {
        const token = await getToken();
        
        // Determine correct API URL based on environment
        const getApiUrl = (endpoint: string) => {
          if (typeof window !== 'undefined') {
            if (window.location.hostname === 'localhost') {
              return `http://localhost:5001/api/${endpoint}`;
            } else {
              return `${window.location.origin}/api/${endpoint}`;
            }
          } else {
            return `/api/${endpoint}`;
          }
        };

        // Fetch received requests
        const receivedResponse = await fetch(getApiUrl('match-requests/received'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch sent requests
        const sentResponse = await fetch(getApiUrl('match-requests/sent'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!receivedResponse.ok || !sentResponse.ok) {
          throw new Error("Failed to fetch match requests");
        }

        const receivedData = await receivedResponse.json();
        const sentData = await sentResponse.json();
        
        setReceivedRequests(receivedData);
        setSentRequests(sentData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch match requests"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMatchRequests();
    }
  }, [user, getToken]);

  const handleAccept = async (requestId: string) => {
    if (!user) return;

    setProcessingRequest(requestId);

    try {
      const token = await getToken();
      
      // Determine correct API URL based on environment
      let apiUrl;
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
          apiUrl = `http://localhost:5001/api/match-requests/${requestId}`;
        } else {
          apiUrl = `${window.location.origin}/api/match-requests/${requestId}`;
        }
      } else {
        apiUrl = `/api/match-requests/${requestId}`;
      }

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "accepted",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept match request");
      }

      // Update the local state
      setReceivedRequests(prev => 
        prev.map(request => 
          request._id === requestId 
            ? { ...request, status: 'accepted' as const }
            : request
        )
      );

      alert("Match request accepted! Collaboration has been created.");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to accept match request"
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!user) return;

    setProcessingRequest(requestId);

    try {
      const token = await getToken();
      
      // Determine correct API URL based on environment
      let apiUrl;
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
          apiUrl = `http://localhost:5001/api/match-requests/${requestId}`;
        } else {
          apiUrl = `${window.location.origin}/api/match-requests/${requestId}`;
        }
      } else {
        apiUrl = `/api/match-requests/${requestId}`;
      }

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "declined",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline match request");
      }

      // Update the local state
      setReceivedRequests(prev => 
        prev.map(request => 
          request._id === requestId 
            ? { ...request, status: 'declined' as const }
            : request
        )
      );

      alert("Match request declined.");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to decline match request"
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  if (!user) {
    return <Layout children={<div>Loading...</div>} />;
  }

  if (loading) {
    return (
      <Layout
        children={
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        }
      />
    );
  }

  if (error) {
    return (
      <Layout
        children={
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              Error: {error}
            </div>
          </div>
        }
      />
    );
  }

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <Layout
      children={
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Match Requests
            </h1>
            <p className="text-gray-600">
              View and manage your collaboration requests.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Received ({receivedRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sent ({sentRequests.length})
              </button>
            </nav>
          </div>

          {/* Match Requests List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {currentRequests.map((request) => (
              <MatchRequestCard
                key={request._id}
                matchRequest={request}
                isReceived={activeTab === 'received'}
                onAccept={activeTab === 'received' ? handleAccept : undefined}
                onDecline={activeTab === 'received' ? handleDecline : undefined}
                isLoading={processingRequest === request._id}
              />
            ))}
          </div>

          {currentRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg mb-2">
                  No {activeTab} requests found
                </p>
                <p className="text-sm">
                  {activeTab === 'received' 
                    ? "When clients send you collaboration requests, they'll appear here."
                    : "Requests you've sent to other users will appear here."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

export default MatchRequestsPage; 