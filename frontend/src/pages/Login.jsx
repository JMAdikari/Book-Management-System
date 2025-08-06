import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import authService from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Login attempt with email:', email);
      const result = await authService.login(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        // Check if token was stored successfully
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          console.log('Token verified in localStorage:', storedToken);
          // Force a refresh to update the Navbar state
          window.location.href = '/';
        } else {
          setError('Authentication failed: Token storage issue');
          console.error('Token not found in localStorage after login');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl w-full max-w-sm border border-white/20">
          <h2 className="text-2xl font-extrabold mb-6 text-center text-white">Login</h2>
          {error && <p className="text-red-300 mb-4 text-center text-sm bg-red-500/20 p-2 rounded-lg border border-red-300/30">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-200 mb-2 text-sm font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm placeholder-gray-300"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-200 mb-2 text-sm font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm placeholder-gray-300"
                placeholder="Enter your password"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white/20 backdrop-blur-md text-white p-3 rounded-lg text-sm font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-300 disabled:bg-white/10 disabled:cursor-not-allowed border border-white/30"
            >
              {loading ? 'Logging in...' : '🚀 Login'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-white hover:text-gray-200 font-semibold underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;