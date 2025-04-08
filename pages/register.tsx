import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/NextAuthContext';
import Layout from '../src/components/NextLayout';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { register, error, clearError, setGuestMode } = useAuth();
  const router = useRouter();
  
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
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
      await register(name, email, password);
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
  
  const registerContent = (
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
            placeholder="Confirm your password"
            required
          />
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
  
  return <Layout children={registerContent} />;
};

Register.displayName = 'RegisterPage';
export default Register; 