import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'client' | 'planner'>('client');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { register, error, clearError, setGuestMode } = useAuth();
  const router = useRouter();
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();
    
    // Validate form
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await register(name, email, password, accountType, undefined);
      router.push('/create');
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGuestMode = () => {
    setGuestMode(true);
    router.push('/create');
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-fun mt-12">
      <h1 className="text-3xl font-display text-primary-600 mb-6 text-center">
        Create Account
      </h1>
      
      <div className="w-20 h-0.5 bg-primary-300 mx-auto mb-8"></div>
      
      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-600">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
            placeholder="Your name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block mb-2 text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
            placeholder="Confirm your password"
            required
          />
        </div>
        
        {/* Account Type Selection */}
        <div className="mb-6">
          <label className="block mb-3 text-gray-700 font-medium">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                accountType === 'client'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value="client"
                checked={accountType === 'client'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAccountType(e.target.value as 'client' | 'planner')
                }
                className="mr-2"
              />
              <div>
                <div className="font-semibold text-gray-800">Client</div>
                <div className="text-xs text-gray-600">Planning an event</div>
              </div>
            </label>
            
            <label
              className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                accountType === 'planner'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value="planner"
                checked={accountType === 'planner'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAccountType(e.target.value as 'client' | 'planner')
                }
                className="mr-2"
              />
              <div>
                <div className="font-semibold text-gray-800">Event Planner</div>
                <div className="text-xs text-gray-600">Offering services</div>
              </div>
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg text-white font-bold ${
            isSubmitting
              ? 'bg-primary-400 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600'
          } transition-colors`}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <button
          onClick={handleGuestMode}
          className="w-full py-3 px-4 rounded-lg bg-festive-yellow-100 text-festive-yellow-700 font-bold hover:bg-festive-yellow-200 transition-colors mb-4"
        >
          Continue as Guest
        </button>
        
        <p className="text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-800 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register; 