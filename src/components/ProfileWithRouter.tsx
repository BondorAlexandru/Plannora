'use client';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from '../pages/UserProfile';
import { AuthProvider } from '../contexts/NextAuthContext';

// This component wraps the UserProfile component with necessary providers
const ProfileWithRouter = () => {
  return (
    <BrowserRouter children={
      <AuthProvider children={<UserProfile />} />
    } />
  );
};

export default ProfileWithRouter; 