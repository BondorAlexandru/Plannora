import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../src/contexts/NextAuthContext';
import { EventProvider } from '../src/context/EventContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider children={
      <EventProvider children={
        <Component {...pageProps} />
      } />
    } />
  );
} 