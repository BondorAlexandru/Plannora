import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, error, clearError, setGuestMode } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    // Validate form
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
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
        Welcome Back
      </h1>

      <div className="w-20 h-0.5 bg-primary-300 mx-auto mb-8"></div>

      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-600">
          {formError || error}
        </div>
      )}

      <form onSubmit={handleLogin}>
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

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label htmlFor="password" className="text-gray-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800">
              Forgot Password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
            placeholder="Your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg text-white font-bold ${isSubmitting
              ? 'bg-primary-400 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600'
            } transition-colors`}
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
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
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 