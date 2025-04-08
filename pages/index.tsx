import React from 'react';
import Link from 'next/link';
import { ProviderCategory } from '../src/data/mockData';
import Layout from '../src/components/NextLayout';
import { useAuth } from '../src/contexts/NextAuthContext';

export default function Home() {
  const categories = Object.values(ProviderCategory);
  const { isAuthenticated } = useAuth();

  const homeContent = (
    <>
      {/* Hero Section */}
      <div className="py-12 mb-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-10">
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-primary-200 blur-3xl"></div>
          <div className="absolute top-40 right-1/4 w-72 h-72 rounded-full bg-secondary-200 blur-3xl"></div>
          <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-accent-200 blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-display text-primary-600 mb-6 relative inline-block">
            Welcome to Plannora
            <span className="absolute -top-6 -right-8 text-2xl transform rotate-12">✨</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10 font-heading">
            Your all-in-one solution for creating unforgettable events. Make your celebration special with just a few clicks!
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              href="/create"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition duration-300"
            >
              Start Planning Your Event
            </Link>
            <Link
              href="/preview"
              className="bg-festive-yellow-400 hover:bg-festive-yellow-500 font-bold text-lg px-8 py-4 rounded-xl shadow-fun hover:shadow-md transition duration-300 flex items-center justify-center"
            >
              <span className="mr-2 text-black">🎯</span> Get Your Free Quote
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-heading font-bold text-center mb-12 text-gray-800">
          <span className="text-primary-500">How</span> It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
          <div className="bg-white p-8 rounded-xl shadow-fun hover:shadow-md transition duration-300">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-gray-800">1. Enter Details</h3>
            <p className="text-gray-600">
              Start by entering the basics about your awesome event - name, date, and guest count.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-fun hover:shadow-md transition duration-300">
            <div className="bg-secondary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-secondary-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-gray-800">2. Select Services</h3>
            <p className="text-gray-600">
              Choose from a variety of fun services and vendors to make your event special.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-fun hover:shadow-md transition duration-300">
            <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-accent-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-gray-800">3. Get Your Plan</h3>
            <p className="text-gray-600">
              Review your perfect event plan with all details and pricing in one place!
            </p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-12 px-6 bg-gray-50 rounded-xl max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-heading font-bold text-center mb-2 text-gray-800">
          Browse <span className="text-primary-500">Categories</span>
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore our wide range of event services to create your perfect celebration!
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            // Assign a pastel color based on the index
            const colors = ['primary', 'secondary', 'accent', 'festive-purple', 'festive-pink', 'festive-green', 'festive-blue', 'festive-orange', 'festive-yellow'];
            const colorIndex = index % colors.length;
            const colorClass = 
              colors[colorIndex] === 'primary' ? 'bg-primary-100 text-primary-600' :
              colors[colorIndex] === 'secondary' ? 'bg-secondary-100 text-secondary-600' :
              colors[colorIndex] === 'accent' ? 'bg-accent-100 text-accent-600' :
              colors[colorIndex] === 'festive-purple' ? 'bg-festive-purple text-purple-600' :
              colors[colorIndex] === 'festive-pink' ? 'bg-festive-pink text-pink-600' :
              colors[colorIndex] === 'festive-green' ? 'bg-festive-green text-green-600' :
              colors[colorIndex] === 'festive-blue' ? 'bg-festive-blue text-blue-600' :
              colors[colorIndex] === 'festive-orange' ? 'bg-festive-orange text-orange-600' :
              'bg-festive-yellow text-yellow-600';

            return (
              <Link
                key={category}
                href={`/create?category=${category}`}
                className={`${colorClass} p-6 rounded-xl shadow-fun hover:shadow-md transition-all duration-300 text-center`}
              >
                <div className="font-heading font-semibold text-lg">{category}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="text-3xl font-heading font-bold text-center mb-12 text-gray-800">
          What People <span className="text-primary-500">Say</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-fun relative">
            <div className="text-primary-300 absolute -top-4 -left-4 text-6xl opacity-20">"</div>
            <p className="text-gray-700 mb-4 relative z-10">
              Planning my daughter's sweet sixteen was a breeze with Plannora. Everything was so colorful and fun to use!
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 mr-4">
                <span className="font-heading font-bold text-lg">JD</span>
              </div>
              <div>
                <p className="font-heading font-semibold">Jane Doe</p>
                <p className="text-sm text-gray-500">Sweet 16 Party</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-fun relative">
            <div className="text-secondary-300 absolute -top-4 -left-4 text-6xl opacity-20">"</div>
            <p className="text-gray-700 mb-4 relative z-10">
              Loved how easy it was to find all the services we needed for our wedding in one place. Saved us so much time!
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-500 mr-4">
                <span className="font-heading font-bold text-lg">MS</span>
              </div>
              <div>
                <p className="font-heading font-semibold">Mike Smith</p>
                <p className="text-sm text-gray-500">Wedding Planner</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12 px-6 bg-primary-100 rounded-xl max-w-4xl mx-auto mb-16 shadow-fun">
        <h2 className="text-3xl font-display mb-6 text-primary-600">Ready to Make Your Event Special?</h2>
        <p className="mb-8 max-w-2xl mx-auto text-gray-700">
          Start planning your next celebration now and create memories that will last a lifetime!
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/create"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-sm hover:shadow-md transition duration-300"
          >
            Get Started
          </Link>
          <Link
            href="/preview" 
            className="bg-festive-yellow-400 hover:bg-festive-yellow-500 font-bold text-lg px-8 py-3 rounded-xl shadow-sm hover:shadow-md transition duration-300 flex items-center justify-center"
          >
            <span className="mr-2 text-black">🎯</span> Get Your Event Quote
          </Link>
        </div>
        <div className="mt-6 flex justify-center space-x-4 opacity-70">
          <span className="text-xl">🎂</span>
          <span className="text-xl">🎵</span>
          <span className="text-xl">🎁</span>
          <span className="text-xl">✨</span>
          <span className="text-xl">🎊</span>
        </div>
      </div>
    </>
  );

  return <Layout children={homeContent} />;
} 