'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// This is the lazy-loaded component to avoid Server-Side Rendering
const CreateWithRouter = dynamic(
  () => import('./CreateWithRouter'),
  { ssr: false }
);

const ClientSideCreate = () => {
  return <CreateWithRouter />;
};

export default ClientSideCreate; 