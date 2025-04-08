import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // In a real implementation, you might invalidate tokens on the server-side
    // or manage a blacklist of logged-out tokens
    
    // For now, we'll just return a success response
    // The client-side will handle removing the token from storage
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 