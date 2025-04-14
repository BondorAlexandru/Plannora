import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Define the base URL for API calls
// Use environment variables or fallback to the actual server URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

console.log('AuthContext using API URL:', API_URL);

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

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState<boolean>(false);

  // Configure axios
  axios.defaults.withCredentials = true;

  // Load user on first render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if in guest mode
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
        
        // Determine correct API URL based on environment
        // For local development, explicitly target the correct port where your API is running
        let apiUrl;
        if (typeof window !== 'undefined') {
          if (window.location.hostname === 'localhost') {
            // Use the explicit port where your auth server is running
            apiUrl = 'http://localhost:5001/api/auth/profile';
            console.log('Using explicit local development auth endpoint in AuthContext');
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
        
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err: any) {
        console.error('Profile loading error:', err);
        
        // Only clear token on explicit 401 unauthorized errors
        // For network errors or other issues, keep the token
        if (err.response && err.response.status === 401) {
          console.log('Unauthorized access (401) - clearing credentials');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        } else {
          console.log('Non-auth error loading profile, keeping credentials');
          // For network errors etc., we'll keep the token and just set not authenticated
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Effect to save guest mode to localStorage
  useEffect(() => {
    localStorage.setItem('guestMode', guestMode.toString());
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
          console.log('Using explicit local development auth endpoint in AuthContext');
        } else {
          // For production - use relative URL based on origin
          apiUrl = `${window.location.origin}/api/auth/register`;
        }
      } else {
        apiUrl = '/api/auth/register';
      }
      
      // Use the correct registration endpoint
      const res = await axios.post(apiUrl, {
        name,
        email,
        password
      });
      
      setUser(res.data);
      setIsAuthenticated(true);
      
      // Save token to localStorage as backup
      if (res.data.token) {
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
    try {
      setIsLoading(true);
      setError(null);
      
      // Determine correct API URL based on environment
      // For local development, explicitly target the correct port where your API is running
      let apiUrl;
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
          // Use the explicit port where your auth server is running
          apiUrl = 'http://localhost:5001/api/auth/login';
          console.log('Using explicit local development auth endpoint in AuthContext');
        } else {
          // For production - use relative URL based on origin
          apiUrl = `${window.location.origin}/api/auth/login`;
        }
      } else {
        apiUrl = '/api/auth/login';
      }
      
      console.log(`API URL for login: ${apiUrl}`);
      
      const res = await axios.post(apiUrl, {
        email,
        password
      });
      
      setUser(res.data);
      setIsAuthenticated(true);
      
      // Save token to localStorage as backup
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      
      setGuestMode(false);
    } catch (err: any) {
      console.error('Login error:', err);
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
            console.log('Using explicit local development auth endpoint in AuthContext');
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
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear guest mode
      setGuestMode(false);
      
      // Clear event data
      localStorage.removeItem('event');
      localStorage.removeItem('eventStep');
      localStorage.removeItem('activeCategory');
    } catch (error) {
      console.error('Error in logout process:', error);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    // @ts-ignore - Work around React 18 typing issue
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
        clearError
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