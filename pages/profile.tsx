import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '../src/components/NextLayout';

// Create a loading component
const LoadingComponent = () => (
  <div className="p-8 text-center">
    <div className="animate-pulse">
      <h2 className="text-2xl font-semibold mb-4">Loading Profile...</h2>
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2.5"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
    </div>
  </div>
);

// Import the UserProfile page with the Router only on client side
const ProfileWithRouter = dynamic(
  () => import('../src/components/ProfileWithRouter'), 
  { 
    ssr: false,
    loading: LoadingComponent
  }
);

export default function ProfilePage() {
  return (
    <Layout children={<ProfileWithRouter />} />
  );
} 