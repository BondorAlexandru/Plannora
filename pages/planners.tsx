import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "../src/components/NextLayout";
import { useAuth } from "../src/contexts/NextAuthContext";
import PlannerCard from "../src/components/PlannerCard";

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

const PlannersPage: React.FC = () => {
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const { user, getToken } = useAuth();
  const router = useRouter();

  // Redirect non-client users
  useEffect(() => {
    if (user && user.accountType !== "client") {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Fetch planners
  useEffect(() => {
    const fetchPlanners = async () => {
      try {
        const token = await getToken();
        
        // Determine correct API URL based on environment
        let apiUrl;
        if (typeof window !== 'undefined') {
          if (window.location.hostname === 'localhost') {
            apiUrl = 'http://localhost:5001/api/planners';
          } else {
            apiUrl = `${window.location.origin}/api/planners`;
          }
        } else {
          apiUrl = '/api/planners';
        }
        
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch planners");
        }

        const data = await response.json();
        setPlanners(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch planners"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPlanners();
    }
  }, [user, getToken]);

  const handleSendRequest = async (plannerId: string) => {
    if (!user) return;

    setSendingRequest(plannerId);

    try {
      const token = await getToken();
      
      // Determine correct API URL based on environment
      let apiUrl;
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
          apiUrl = 'http://localhost:5001/api/match-requests';
        } else {
          apiUrl = `${window.location.origin}/api/match-requests`;
        }
      } else {
        apiUrl = '/api/match-requests';
      }
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: plannerId,
          message: "I would like to collaborate on my event planning.",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send match request");
      }

      alert("Match request sent successfully!");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to send match request"
      );
    } finally {
      setSendingRequest(null);
    }
  };

  const serviceOptions = [
    "Wedding Planning",
    "Corporate Events",
    "Birthday Parties",
    "Anniversary Celebrations",
    "Conferences",
    "Product Launches",
    "Fundraising Events",
    "Holiday Parties",
    "Graduation Celebrations",
    "Retirement Parties",
  ];

  const handleServiceFilter = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  // Filter planners based on search and services
  const filteredPlanners = planners.filter((planner) => {
    const matchesSearch =
      planner.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planner.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesServices =
      selectedServices.length === 0 ||
      selectedServices.some((service) => planner.services.includes(service));

    return matchesSearch && matchesServices;
  });

  if (!user) {
    return <Layout children={<div>Loading...</div>} />;
  }

  if (user.accountType !== "client") {
    return (
      <Layout
        children={<div>Access denied. Only clients can view planners.</div>}
      />
    );
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

  return (
    <Layout
      children={
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Event Planners
            </h1>
            <p className="text-gray-600">
              Browse and connect with professional event planners to collaborate
              on your events.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Search planners..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Filter by Services:
              </h3>
              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((service) => (
                  <button
                    key={service}
                    onClick={() => handleServiceFilter(service)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedServices.includes(service)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Planners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlanners.map((planner) => (
              <PlannerCard
                key={planner.id}
                planner={planner}
                onSendRequest={handleSendRequest}
                isRequestPending={sendingRequest === planner.id}
              />
            ))}
          </div>

          {filteredPlanners.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg mb-2">No planners found</p>
                <p className="text-sm">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

export default PlannersPage;
