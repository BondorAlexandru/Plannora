import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import dynamic from 'next/dynamic';

// Import components with compatibility in mind
const Layout = dynamic(() => import('./components/Layout'), { ssr: false });
const Home = dynamic(() => import('./pages/Home'), { ssr: false });
const Login = dynamic(() => import('./pages/Login'), { ssr: false });
const Register = dynamic(() => import('./pages/Register'), { ssr: false });
const Create = dynamic(() => import('./pages/Create'), { ssr: false });
const Preview = dynamic(() => import('./pages/Preview'), { ssr: false });
const UserProfile = dynamic(() => import('./pages/UserProfile'), { ssr: false });
const ProtectedRoute = dynamic(() => import('./components/ProtectedRoute'), { ssr: false });

// Use a simple function for type compatibility
export default function App() {
  return (
    <AuthProvider children={
      <div className="app-container">
        This is the App component. Please use the Next.js pages directly from the pages directory.
      </div>
    } />
  );
}; 