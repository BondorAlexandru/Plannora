import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/NextAuthContext';

interface LayoutProps {
  children: ReactNode;
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

// Export as named export for clarity
export const Layout = ({ children }: LayoutProps) => {
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
                <li>
                  <Link href="/preview" className="text-white hover:text-festive-yellow-200 transition-colors duration-200">Get Quote</Link>
                </li>
                
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
                <li>
                  <Link 
                    href="/preview" 
                    className="block text-white hover:text-festive-yellow-200 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Quote
                  </Link>
                </li>
                
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
                </svg>
              </a>
              <a href="#" className="text-white/80 hover:text-festive-yellow-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-white/80 hover:text-festive-yellow-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Also keep default export
export default Layout; 