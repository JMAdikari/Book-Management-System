import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService from '../services/authService';
import logo from '../assets/logo.png';

function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    // Check authentication status and update state
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const authStatus = !!token;
      console.log('Authentication status:', authStatus, token ? 'Token exists' : 'No token');
      setIsAuthenticated(authStatus);
    };
    
    checkAuth();
    
    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        console.log('Auth token changed in storage, updating state');
        checkAuth();
      }
    };
    
    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('click', handleClickOutside);
    
    // Check auth status every second (temporary debugging solution)
    const interval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('click', handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <nav className="bg-black/30 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-white hover:text-gray-200 transition-all duration-200 flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 backdrop-blur-md border-3 border-white/30 p-2 hover:border-white/50 transition-all duration-300 hover:scale-150 hover:translate-y-4 shadow-lg hover:shadow-2xl hover:w-32 hover:h-32 hover:p-3">
                <img 
                  src={logo} 
                  alt="SmartBooks Logo" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="hidden sm:inline text-3xl font-bold">SmartBooks</span>
              <span className="sm:hidden text-xl font-bold">SB</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-white hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            >
                Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/catalog" 
                  className="text-white hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                    My Books
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="text-white hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center"
                  >
                    👤 Profile ▼
                  </button>
                  
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowProfileDropdown(false)}
                          className="block px-4 py-2 text-sm text-white hover:bg-white/20 transition-all duration-200"
                        >
                            View Profile
                        </Link>
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            navigate('/profile?edit=true');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/20 transition-all duration-200"
                        >
                            Edit Profile
                        </button>
                        <div className="border-t border-white/20 my-1"></div>
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            handleLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
                        >
                           Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                   Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 hover:scale-105 px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-white/30"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;