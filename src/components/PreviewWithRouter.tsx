'use client';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Preview from '../pages/Preview';
import { AuthProvider } from '../contexts/NextAuthContext';

// This component wraps the Preview component with necessary providers
const PreviewWithRouter = () => {
  return (
    <BrowserRouter children={
      <AuthProvider children={<Preview />} />
    } />
  );
};

export default PreviewWithRouter; 