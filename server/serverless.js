import serverless from 'serverless-http';
import app from './index.js';

export const createServerlessFunction = () => {
  // Create a serverless-compatible handler
  const handler = serverless(app);
  
  // Return a function that handles serverless requests
  return async (req, res) => {
    // Log request for debugging
    console.log(`[Serverless] ${req.method} ${req.url}`);
    
    try {
      // Process the request with our Express app
      return await handler(req, res);
    } catch (error) {
      console.error('[Serverless] Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      };
    }
  };
}; 