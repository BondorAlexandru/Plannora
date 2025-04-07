import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';

const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const handleDeleteData = async () => {
    if (window.confirm('Are you sure you want to delete all your event data? This cannot be undone.')) {
      try {
        await eventService.deleteEvent(isAuthenticated);
        alert('All event data deleted successfully.');
        navigate('/');
      } catch (error) {
        console.error('Error deleting event data', error);
        alert('Failed to delete event data. Please try again.');
      }
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-fun p-8 mb-8">
        <h1 className="text-3xl font-display text-primary-600 mb-6">
          Your Account
        </h1>
        
        <div className="bg-primary-50 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mr-4">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-gray-800">
                {user?.name || 'User'}
              </h2>
              <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-heading font-semibold text-gray-800 mb-2">
                Account Information
              </h3>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-medium">Email: </span>
                {user?.email}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Member since: </span>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </p>
              <button className="mt-4 text-sm text-primary-600 hover:text-primary-800">
                Change Password
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-heading font-semibold text-gray-800 mb-2">
                Account Options
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handleDeleteData}
                  className="text-sm text-red-600 hover:text-red-800 block"
                >
                  Delete All Event Data
                </button>
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`text-sm text-red-600 hover:text-red-800 block ${
                    isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-heading font-bold text-gray-800 mb-4">
            Your Events
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="font-heading text-lg text-gray-700 mb-2">
              Current Event in Progress
            </h3>
            <p className="text-gray-600 mb-4">
              You have an event that you're currently planning
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/create')}
                className="py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-sm"
              >
                Continue Planning
              </button>
              <button
                onClick={() => navigate('/preview')}
                className="py-2 px-4 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg transition-colors shadow-sm"
              >
                View Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 