import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

// Simplify with any type to avoid React type conflicts
interface LayoutProps {
  children: any;
}

// LogoutButton component
const LogoutButton = ({ onClick }: { onClick?: () => void }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (onClick) onClick(); // Close mobile menu if provided
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`text-white hover:text-festive-yellow-200 transition-colors duration-200 ${
        isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoggingOut ? 'Logging out...' : 'Log Out'}
    </button>
  );
};

// New component to handle the quote navigation
const GetQuoteLink = ({ onClick }: { onClick?: () => void }) => {
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Try to get the current event from localStorage
    const savedEvent = localStorage.getItem('event');
    if (savedEvent) {
      try {
        const eventData = JSON.parse(savedEvent);
        if (eventData && (eventData._id || eventData.id)) {
          setCurrentEventId(eventData._id || eventData.id);
        }
      } catch (error) {
        console.error("Error parsing event from localStorage:", error);
      }
    }
  }, []);
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick();
    
    if (currentEventId) {
      router.push(`/preview?eventId=${currentEventId}`);
    } else {
      router.push('/preview');
    }
  };
  
  return (
    <a 
      href="#" 
      onClick={handleClick}
      className="text-white hover:text-festive-yellow-200 transition-colors duration-200"
    >
      Get Quote
    </a>
  );
};

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, isLoading, guestMode } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <header className="bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-display text-white">Plannora</span>
                <span className="text-festive-yellow-300 ml-1">✨</span>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden flex items-center text-white focus:outline-none" 
              onClick={toggleMobileMenu}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            {/* Desktop navigation */}
            <nav className="hidden md:block">
              <ul className="flex items-center space-x-6 font-heading">
                <li>
                  <Link href="/" className="text-white hover:text-festive-yellow-200 transition-colors duration-200">Home</Link>
                </li>
                <li>
                  <Link href="/create" className="text-white hover:text-festive-yellow-200 transition-colors duration-200">Create Event</Link>
                </li>
                {user?.accountType === 'client' && (
                  <li>
                    <Link href="/planners" className="text-white hover:text-festive-yellow-200 transition-colors duration-200">Planners</Link>
                  </li>
                )}
                {user?.accountType === 'planner' && (
                  <li>
                    <Link href="/match-requests" className="text-white hover:text-festive-yellow-200 transition-colors duration-200">Match Requests</Link>
                  </li>
                )}
                {user && (
                  <li>
                    <Link href="/collaborations" className="text-white hover:text-festive-yellow-200 transition-colors duration-200">Collaborations</Link>
                  </li>
                )}
                
                {isLoading ? (
                  <li className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></li>
                ) : isAuthenticated ? (
                  <>
                    <li>
                      <Link href="/profile" className="flex items-center bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 transition-colors duration-200">
                        <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm mr-2">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-white">{user?.name?.split(' ')[0] || 'User'}</span>
                      </Link>
                    </li>
                    <li>
                      <LogoutButton />
                    </li>
                  </>
                ) : guestMode ? (
                  <>
                    <li>
                      <span className="flex items-center bg-white/20 rounded-full px-3 py-1">
                        <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm mr-2">
                          G
                        </div>
                        <span className="text-white">Guest</span>
                      </span>
                    </li>
                    <li>
                      <LogoutButton />
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className="text-white hover:text-festive-yellow-200 transition-colors duration-200">
                        Log In
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="bg-festive-yellow-400 hover:bg-festive-yellow-500 text-white px-3 py-1 rounded-lg transition-colors duration-200">
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-white/20">
              <ul className="space-y-3 pb-3 font-heading">
                <li>
                  <Link 
                    href="/" 
                    className="block text-white hover:text-festive-yellow-200 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/create" 
                    className="block text-white hover:text-festive-yellow-200 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create Event
                  </Link>
                </li>
                {user?.accountType === 'client' && (
                  <li>
                    <Link 
                      href="/planners" 
                      className="block text-white hover:text-festive-yellow-200 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Planners
                    </Link>
                  </li>
                )}
                {user?.accountType === 'planner' && (
                  <li>
                    <Link 
                      href="/match-requests" 
                      className="block text-white hover:text-festive-yellow-200 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Match Requests
                    </Link>
                  </li>
                )}
                {user && (
                  <li>
                    <Link 
                      href="/collaborations" 
                      className="block text-white hover:text-festive-yellow-200 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Collaborations
                    </Link>
                  </li>
                )}
                
                {isLoading ? (
                  <li className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></li>
                ) : isAuthenticated ? (
                  <>
                    <li>
                      <Link 
                        href="/profile" 
                        className="flex items-center bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 transition-colors duration-200 w-fit"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm mr-2">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-white">{user?.name?.split(' ')[0] || 'User'}</span>
                      </Link>
                    </li>
                    <li>
                      <LogoutButton onClick={() => setIsMobileMenuOpen(false)} />
                    </li>
                  </>
                ) : guestMode ? (
                  <>
                    <li>
                      <span className="flex items-center bg-white/20 rounded-full px-3 py-1 w-fit">
                        <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm mr-2">
                          G
                        </div>
                        <span className="text-white">Guest</span>
                      </span>
                    </li>
                    <li>
                      <LogoutButton onClick={() => setIsMobileMenuOpen(false)} />
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link 
                        href="/login" 
                        className="block text-white hover:text-festive-yellow-200 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log In
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/register" 
                        className="bg-festive-yellow-400 hover:bg-festive-yellow-500 text-white px-3 py-1 rounded-lg transition-colors duration-200 inline-block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-heading">© 2025 Plannora. All rights reserved.</p>
              <p className="text-sm mt-1 text-white/80">Your all-in-one event planning solution</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-white/80 hover:text-festive-yellow-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z" />
                  <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" />
                </svg>
              </a>
              <a href="#" className="text-white/80 hover:text-festive-yellow-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                </svg>
              </a>
              <a href="#" className="text-white/80 hover:text-festive-yellow-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 