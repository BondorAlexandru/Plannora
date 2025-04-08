import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Define the base URL for API calls
const API_URL = '/api';

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
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        
        // Try to get user profile
        const res = await axios.get(`${API_URL}/auth/profile`);
        
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Profile loading error:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
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
      
      // Try the direct registration endpoint
      const res = await axios.post(`${API_URL}/auth/register-direct`, {
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
      
      const res = await axios.post(`${API_URL}/auth/login`, {
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
        await axios.post(`${API_URL}/auth/logout`);
      }
      
      setUser(null);
      setIsAuthenticated(false);
      
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
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

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