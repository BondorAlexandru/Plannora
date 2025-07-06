import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

// Define the base URL for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

console.log('NextAuthContext using API URL:', API_URL);

// Define types locally
interface User {
  _id: string;
  name: string;
  email: string;
  accountType: 'client' | 'planner';
  plannerProfile?: PlannerProfile;
  createdAt?: string;
  updatedAt?: string;
}

interface PlannerProfile {
  businessName: string;
  services: string[];
  experience: string;
  description: string;
  pricing: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
}

// Define Auth Context state
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, accountType: 'client' | 'planner', plannerProfile?: PlannerProfile) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  guestMode: boolean;
  setGuestMode: (value: boolean) => void;
  clearError: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  getToken: () => Promise<string>;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  error: null,
  guestMode: false,
  setGuestMode: () => {},
  clearError: () => {},
  updateProfile: async () => {},
  getToken: async () => ''
});

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState<boolean>(false);
  const router = useRouter();

  // Configure axios
  axios.defaults.withCredentials = true;

  // Load user on first render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if in guest mode
        if (typeof window !== 'undefined') {
          const storedGuestMode = localStorage.getItem('guestMode');
          if (storedGuestMode === 'true') {
            setGuestMode(true);
            setIsLoading(false);
            return;
          }

          // Check for token in localStorage (backup)
          const token = localStorage.getItem('token');
          if (!token) {
            // If no token, don't make the API call
            setIsLoading(false);
            return;
          }
          
          // Set token in headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        // Determine correct API URL based on environment
        // For local development, explicitly target the correct port where your API is running
        let apiUrl;
        if (typeof window !== 'undefined') {
          if (window.location.hostname === 'localhost') {
            // Use the explicit port where your auth server is running
            apiUrl = 'http://localhost:5001/api/auth/profile';

          } else {
            // For production - use relative URL based on origin
            apiUrl = `${window.location.origin}/api/auth/profile`;
          }
        } else {
          apiUrl = '/api/auth/profile';
        }
        
        // Try to get user profile
        const res = await axios.get(apiUrl);
        
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Effect to save guest mode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestMode', guestMode.toString());
    }
  }, [guestMode]);

  // Register user
  const register = async (name: string, email: string, password: string, accountType: 'client' | 'planner', plannerProfile?: PlannerProfile) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Determine correct API URL based on environment
      // For local development, explicitly target the correct port where your API is running
      let apiUrl;
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
          // Use the explicit port where your auth server is running
          apiUrl = 'http://localhost:5001/api/auth/register';
        } else {
          // For production - use relative URL based on origin
          apiUrl = `${window.location.origin}/api/auth/register`;
        }
      } else {
        apiUrl = '/api/auth/register';
      }
      

      
      // Use the correct registration endpoint
      const requestData: any = {
        name,
        email,
        password,
        accountType
      };
      
      // Only include plannerProfile if it exists and accountType is planner
      if (accountType === 'planner' && plannerProfile) {
        requestData.plannerProfile = plannerProfile;
      }
      
      const res = await axios.post(apiUrl, requestData);
      
      setUser(res.data);
      setIsAuthenticated(true);
      
      // Save token to localStorage as backup
      if (res.data.token && typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      
      setGuestMode(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      
      // Determine correct API URL based on environment
      // For local development, explicitly target the correct port where your API is running
      let apiUrl;
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
          // Use the explicit port where your auth server is running
          apiUrl = 'http://localhost:5001/api/auth/login';
        } else {
          // For production - use relative URL based on origin
          apiUrl = `${window.location.origin}/api/auth/login`;
        }
      } else {
        apiUrl = '/api/auth/login';
      }
      

      
      const response = await axios.post(apiUrl, { email, password });
      
      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        
        // Save token to localStorage as backup
        if (response.data.token && typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        
        setGuestMode(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Only call the logout API if authenticated
      if (isAuthenticated) {
        // Determine correct API URL based on environment
        // For local development, explicitly target the correct port where your API is running
        let apiUrl;
        if (typeof window !== 'undefined') {
          if (window.location.hostname === 'localhost') {
            // Use the explicit port where your auth server is running
            apiUrl = 'http://localhost:5001/api/auth/logout';
            console.log('Using explicit local development auth endpoint');
          } else {
            // For production - use relative URL based on origin
            apiUrl = `${window.location.origin}/api/auth/logout`;
          }
        } else {
          apiUrl = '/api/auth/logout';
        }
        
        try {
          await axios.post(apiUrl);
        } catch (err) {
          console.error('Logout error:', err);
        }
      }
      
      // Reset auth state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
      
      // Clear guest mode
      setGuestMode(false);
      
      // Clear event data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('event');
        localStorage.removeItem('eventStep');
        localStorage.removeItem('activeCategory');
      }
    } catch (error) {
      console.error('Error in logout process:', error);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Update profile
  const updateProfile = async (updates: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Determine correct API URL based on environment
      // For local development, explicitly target the correct port where your API is running
      let apiUrl;
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
          // Use the explicit port where your auth server is running
          apiUrl = 'http://localhost:5001/api/auth/profile';
          console.log('Using explicit local development auth endpoint');
        } else {
          // For production - use relative URL based on origin
          apiUrl = `${window.location.origin}/api/auth/profile`;
        }
      } else {
        apiUrl = '/api/auth/profile';
      }
      
      // Use the correct update profile endpoint
      const res = await axios.put(apiUrl, updates);
      
      setUser(res.data);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Profile update failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get token from localStorage
  const getToken = async (): Promise<string> => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        error,
        guestMode,
        setGuestMode,
        clearError,
        updateProfile,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context as AuthContextType;
}; 