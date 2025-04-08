import axios from 'axios';

// Determine the API base URL based on the environment
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the Vercel API URL
    return '/api';
  } else {
    // In development, use the local server
    return 'http://localhost:3000/api';
  }
};

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage if it exists
    const token = localStorage.getItem('token');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear the token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to the login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Events API functions
export const events = {
  getCurrent: () => api.get('/events/current'),
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  createNew: (eventData) => api.post('/events/new', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  updateStep: (eventId, step) => api.patch('/events/step', { eventId, step }),
  updateCategory: (eventId, activeCategory) => api.patch('/events/category', { eventId, activeCategory }),
};

export default api; 