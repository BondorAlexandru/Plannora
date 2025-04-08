'use client';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Create from '../pages/Create';
import { AuthProvider } from '../contexts/NextAuthContext';

// This component wraps the Create component with necessary providers
const CreateWithRouter = () => {
  return (
    <BrowserRouter children={
      <AuthProvider children={<Create />} />
    } />
  );
};

export default CreateWithRouter; 