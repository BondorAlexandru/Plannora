import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

// Define the base URL for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

console.log('NextAuthContext using API URL:', API_URL);

// Define User type
interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string; // Add createdAt as an optional field
  updatedAt?: string; // Add updatedAt as an optional field
}

// Define Auth Context state
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  guestMode: boolean;
  setGuestMode: (value: boolean) => void;
  clearError: () => void;
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
  clearError: () => {}
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
            console.log('Using explicit local development auth endpoint');
          } else {
            // For production - use relative URL based on origin
            apiUrl = `${window.location.origin}/api/auth/profile`;
          }
        } else {
          apiUrl = '/api/auth/profile';
        }
        
        // Try to get user profile
        console.log(`Calling profile API at: ${apiUrl}`);
        const res = await axios.get(apiUrl);
        console.log('Profile API response:', res.data);
        
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Profile loading error:', err);
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
  const register = async (name: string, email: string, password: string) => {
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
          console.log('Using explicit local development auth endpoint');
        } else {
          // For production - use relative URL based on origin
          apiUrl = `${window.location.origin}/api/auth/register`;
        }
      } else {
        apiUrl = '/api/auth/register';
      }
      
      console.log(`API URL for register: ${apiUrl}`);
      
      // Use the correct registration endpoint
      const res = await axios.post(apiUrl, {
        name,
        email,
        password
      });
      
      setUser(res.data);
      setIsAuthenticated(true);
      
      // Save token to localStorage as backup
      if (res.data.token && typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      
      setGuestMode(false);
    } catch (err: any) {
      console.error('Registration error:', err);
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
      console.log(`Attempting login with email: ${email}`);
      
      // Determine correct API URL based on environment
      // For local development, explicitly target the correct port where your API is running
      let apiUrl;
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
          // Use the explicit port where your auth server is running
          apiUrl = 'http://localhost:5001/api/auth/login';
          console.log('Using explicit local development auth endpoint');
        } else {
          // For production - use relative URL based on origin
          apiUrl = `${window.location.origin}/api/auth/login`;
        }
      } else {
        apiUrl = '/api/auth/login';
      }
      
      console.log(`API URL for login: ${apiUrl}`);
      
      const response = await axios.post(apiUrl, { email, password });
      console.log('Login response:', response.data);
      
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
      console.error('Login error details:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Only call the logout API if authenticated (not in guest mode)
      if (isAuthenticated) {
        try {
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
          
          const response = await axios.post(apiUrl);
          console.log('Logout successful:', response.data);
        } catch (apiError) {
          console.error('API logout error:', apiError);
          // Continue with client-side logout even if API call fails
        }
      }
      
      // Always perform client-side logout actions regardless of API success
      setUser(null);
      setIsAuthenticated(false);
      
      if (typeof window !== 'undefined') {
        // Remove token from localStorage
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        
        // Always clear guest mode
        setGuestMode(false);
        localStorage.removeItem('guestMode');
        
        // Clear event data
        localStorage.removeItem('event');
        localStorage.removeItem('eventStep');
        localStorage.removeItem('activeCategory');
      }
      
    } catch (err: any) {
      console.error('Logout process error:', err);
      setError(err.response?.data?.message || 'Logout failed. Please try again.');
      // Still try to clean up client-side state
      setUser(null);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error,
    guestMode,
    setGuestMode,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext) as AuthContextType;
  return context;
}; 