'use client';
import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Preview from '../pages/Preview';
import { AuthProvider } from '../contexts/AuthContext';
import axios from 'axios';

// This component wraps the Preview component with necessary providers
const PreviewWithRouter = () => {
  const [isReady, setIsReady] = useState(false);
  
  // Ensure auth state is preserved between contexts
  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Set axios headers for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth token found and set in axios headers, ready to render preview');
    } else {
      console.log('No auth token found, preview will load in guest/unauthenticated mode');
    }
    
    // Check for an event in localStorage
    const eventData = localStorage.getItem('event');
    if (eventData) {
      console.log('Event data found in localStorage');
    }
    
    // Mark as ready to render
    setIsReady(true);
  }, []);
  
  if (!isReady) {
    return <div className="p-4 text-center">Preparing preview...</div>;
  }
  
  return (
    <BrowserRouter children={
      <AuthProvider children={<Preview />} />
    } />
  );
};

export default PreviewWithRouter; 