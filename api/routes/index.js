// Routes index file - combines all route modules
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';

// Function to create and mount all routers on the app
export function createRouter(app) {
  // Mount all route modules
  authRoutes(app);
  eventRoutes(app);
  
  // Add any other route modules here
  
  // Add a catch-all route for API requests
  app.all('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });
} 